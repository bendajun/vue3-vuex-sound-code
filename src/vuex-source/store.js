import { storeKey } from './injectKey'
import { installModule, resetStoreState } from './store-util'
import ModuleCollection from './module/module-collection'

export const createStore = (options) => {
  return new Store(options)
}

export class Store {
  constructor(options = {}) {
    const store = this

    store.strict = options.strict || false // 严格模式
    store._committing = false // 严格模式下，修改state只能通过mutation，且mutation必须是同步的，不然会报错
    store._subscribes = [] // 收集函数，然后每次调用commit的时候，就调用这里面的函数
    store._modulesNamespaceMap = Object.create(null) // 用来检测命名空间是否重复

    store._wrappedGetters = Object.create(null)
    store._mutations = Object.create(null)
    store._actions = Object.create(null)
    store._modules = new ModuleCollection(options) // 处理options的module格式

    /**
     * 走到这一步store._modules.root应该为:
        {
          state: { count: 0 },
          _children: { aCount: {...}, b: Count: {...} }
          _raw: {...}
        }
     */
    const state = store._modules.root.state // 此时的state则为 { count: 0 }, 可通过深拷贝console查看

    installModule(store, state, [], store._modules.root)
    /**
     * installModule进行处理为了实现 如使取cCount的state, 可以通过 $store.state.aCount.cCount.count
     * 此时的state就是纯粹的一个state对象
     {
       count: 0,
       aCount: {
         count: 0,
         cCount: {
           count: 0
         }
       },
       bCount: {
         count: 0
       }
     }
     */
    /* console.log(JSON.parse(JSON.stringify(state))) */

    // 所以我们需要将state和getters挂载到store上
    resetStoreState(store, state)

    options.plugins.forEach(plugin => plugin(store))
  }

  get state() {
    return this._state.data
  }

  /**
   * 源码是在construction里面通过bind处理了this指向，我们这里使用箭头函数
   * 这样做是为了防止使用解构(const { dispatch, commit } = store)的方式，解构出来后this的指向问题
   */
  commit = (type, payload) => {
    const store = this
    const entry = store._mutations[type] || []
    store._withCommit(() => {
      entry.forEach(handler => handler(payload))
    })
    store._subscribes.forEach(sub => sub({ type, payload }, store.state))
  }

  dispatch = (type, payload) => {
    const store = this
    const entry = store._actions[type] || []
    // map等待所有的action执行结束
    return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0] && entry[0](payload)
  }

  install(app, injectKey) { // app.use的时候调用插件时Vue调用这个方法，然后将app实例和参数传递进来
    app.provide(injectKey || storeKey, this) // 将this也就是store仓库通过provide提供出去，那么使用Vue3的inject API就可以接收store了
    app.config.globalProperties.$store = this // vue2的操作是Vue.prototype.$store = this,这样在模板中就可以通过$store得到了store了
  }

  subscribe(fn) {
    const store = this
    store._subscribes.push(fn)
  }

  _withCommit(fn) { // 每次触发mutation调用store.commit时，就调用此函数
    const store = this
    const committing = store._committing // 正常情况下为false
    store._committing = true
    fn() // 如果mutation都是异步的，那么下一句代码肯定是在这里执行完毕后才会执行
    store._committing = committing
  }
}
