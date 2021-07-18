import { reactive, watch } from 'vue'

import { forEachValue, isPromise } from './utils'

// 这个函数用来得到响应式的state
export const getNestedState = (state, path) => {
  return path.reduce((state, key) => {
    return state[key]
  }, state)
}

export const installModule = (store, rootState, path, module) => { // 递归安装
  const isRoot = !path.length // 如果数组是空数组，说明是根，否则不是

  const moduleNamespaced = store._modules.getNamespaced(path) // 这里得到了当前模块的命名空间 => ['a', 'c'] => aCount/cCount/, 然后给getters, mutations,actions添加上命名空间前缀

  // 这里是看是否有重复的命名空间模块
  if (module.namespaced) {
    if (store._modulesNamespaceMap[moduleNamespaced]) {
      console.error(`[vuex] duplicate namespace ${moduleNamespaced}`)
    }
    store._modulesNamespaceMap[moduleNamespaced] = module
  }

  if (!isRoot) { // 不是根模块，找到当前模块的父模块，将当前模块的state安装到父模块上的state上
    const parentState = path.slice(0, -1).reduce((state, key) => {
      return state[key]
    }, rootState)
    parentState[path[path.length - 1]] = module.state
  }

  module.forEachGetter((getter, key) => {
    store._wrappedGetters[moduleNamespaced + key] = () => { // 如 path = ['a'] 取的是 state['a'], 即模块a的state
      return getter(getNestedState(store.state, path)) // 这里传入响应式的state
    }
  })

  module.forEachMutation((mutation, key) => {
    const entry = store._mutations[moduleNamespaced + key] || (store._mutations[moduleNamespaced + key] = []) // 没有命名空间的时候，commit出发mutation时会执行所有同名的mutation
    entry.push(payload => {
      mutation.call(store, getNestedState(store.state, path), payload)
    })
  })

  module.forEachAction((action, key) => {
    const entry = store._actions[moduleNamespaced + key] || (store._actions[moduleNamespaced + key] = []) // 没有命名空间的时候，commit出发mutation时会执行所有同名的mutation
    entry.push(payload => {
      let res = action.call(store, store, payload) // stire.dispatch('fn', payload).then() 返回promise
      // res 如果不是promise,就包裹一层Promise
      return !isPromise(res) ? Promise.resolve(res) : res
    })
  })

  // 我们需要把不是根的模块的state也安装到根state上面去
  module.forEachChild((childModule, key) => { // key => aCount cCount bCount
    installModule(store, rootState, path.concat(key), childModule)
  })
}

// 将state和getters挂载到store上
export const resetStoreState = (store, state) => {
  store._state = reactive({ data: state }) // 方便替换，包裹个data
  const wrappedGetters = store._wrappedGetters
  store.getters = {}
  forEachValue(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      get: () => getter(),
      enumerable: true,
    })
  })

  if (store.strict) { // 开启严格模式
    enableStrictMode(store)
  }
}

// 开启严格模式
export const enableStrictMode = (store) => {
  watch(() => store._state.data, () => { // 当状态发生变化，就同布执行这里的代码
    console.assert(store._committing, 'do not mutate vuex store outside mutation handlers') // store._committing 为false，打印报错
  }, { deep: true, flush: 'sync' }) // flush: 'sync'， 同布执行
}
