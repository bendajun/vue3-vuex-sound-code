import { reactive } from 'vue'
import { storeKey } from './injectKey'
import { forEachValue, isPromise } from './utils'
import ModuleCollection from './module/module-collection'

const getNestedState = (state, path) => { // 这个函数用来得到响应式的state
  return path.reduce((state, key) => {
    return state[key]
  }, state)
}

const installModule = (store, rootState, path, module) => { // 递归安装
  const isRoot = !path.length // 如果数组是空数组，说明是根，否则不是

  if (!isRoot) { // 不是根模块
    const parentState = path.slice(0, -1).reduce((state, key) => {
      return state[key]
    }, rootState)
    parentState[path[path.length - 1]] = module.state
  }

  module.forEachGetter((getter, key) => {
    store._wrappedGetters[key] = () => { // 如 path = ['a'] 取的是 state['a'], 即模块a的state
      return getter(getNestedState(store.state, path)) // 这里传入响应式的state
    }
  })

  module.forEachMutation((mutation, key) => {
    const entry = store._mutations[key] || (store._mutations[key] = []) // 没有命名空间的时候，commit出发mutation时会执行所有同名的mutation
    entry.push(payload => {
      mutation.call(store, getNestedState(store.state, path), payload)
    })
  })

  module.forEachAction((action, key) => {
    const entry = store._actions[key] || (store._actions[key] = []) // 没有命名空间的时候，commit出发mutation时会执行所有同名的mutation
    entry.push(payload => {
      let res = action.call(store, store, payload) // stire.dispatch('fn', payload).then() 返回promise
      // res 如果不是promise,就包裹一层Promise
      return !isPromise(res) ? Promise.resolve(res) : res
    })
  })

  // 我们需要把不是根的模块的state安装到根上面去
  module.forEachChild((childModule, key) => { // key => aCount cCount bCount
    installModule(store, rootState, path.concat(key), childModule)
  })
}

const resetStoreState = (store, state) => {
  store._state = reactive({ data: state }) // 方便替换，包裹个data
  const wrappedGetters = store._wrappedGetters
  store.getters = {}
  forEachValue(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      get: () => getter(),
      enumerable: true,
    })
  })
}

export default class Store {
  constructor(options) {
    const store = this
    // 处理module格式
    store._modules = new ModuleCollection(options)
    store._wrappedGetters = Object.create(null)
    store._mutations = Object.create(null)
    store._actions = Object.create(null)

    const state = store._modules.root.state // 根状态 ==> 走到这一步应该为 { aCount: {count: 0, cCount: {…}}, bCount: {count: 0}, count: 0 }
    // installModule进行处理为了实现 如使取cCount的state, 可以通过 $store.state.aCount.cCount.count
    installModule(store, state, [], store._modules.root)

    resetStoreState(store, state) // 将state和getters挂载到store上
    console.log(store, state)
  }

  get state() {
    return this._state.data
  }

  commit = (type, payload) => {
    const store = this
    const entry = store._mutations[type] || []
    entry.forEach(handler => handler(payload))
  }

  dispatch = (type, payload) => {
    const store = this
    const entry = store._actions[type] || []
    return Promise.all(entry.map(handler => handler(payload))) // 等待所有的action执行结束
  }

  install(app, injectKey) { // app.use的时候调用插件时Vue调用这个方法，然后将app实例和参数传递进来
    app.provide(injectKey || storeKey, this) // 将this也就是store仓库通过provide提供出去，那么使用Vue3的inject API就可以接收store了
    app.config.globalProperties.$store = this // vue2的操作是Vue.prototype.$store = this,这样在模板中就可以通过$store得到了store了
  }
}
