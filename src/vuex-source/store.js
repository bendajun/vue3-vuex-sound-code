import { reactive } from 'vue'
import { forEachValue } from './utils'
import { storeKey } from './injectKey'

export default class Store {
  constructor(options) {
    const store = this
    store._state = reactive({ data: options.state }) // vuex里面有个api，replaceState，所以这个地方用data代替方便replace

    const _getters = options.getters // 保存一份元getters
    const _mutations = options.mutations // 保存一份元_mutations
    const _actions = options.actions // 保存一份元_actions

    store.getters = {}
    // 这里将createStore时传递的getters处理后添加处理到store.getters上
    forEachValue(_getters, (fn, key) => {
      Object.defineProperty(store.getters, key, {
        get: () => fn(store.state) // 这里给每个getter的第一个参数传递了当前的state，并将getters的返回值返回
      })
    })

    store._mutations = Object.create(null)
    store._actions = Object.create(null)
    forEachValue(_mutations, (mutation, key) => { // 这里给每个mutation的第一个参数传递了当前的state，payload则是调用commit时传递的参数
      store._mutations[key] = (payload) => {
        mutation.call(store, store.state, payload)
      }
    })
    forEachValue(_actions, (action, key) => { // 这里给每个action的第一个参数传递了当前的state，payload则是调用commit时传递的参数
      store._actions[key] = (payload) => {
        action.call(store, store.state, payload)
      }
    })
  }

  get state() {
    return this._state.data
  }

  commit = (type, payload) => { // 这里使用箭头函数是为了防止 const { commit } = store，解构commit导致this出错
    const store = this
    store._mutations[type](payload)
  }

  dispatch = (type, payload) => { // 这里使用箭头函数是为了防止 const { dispatch } = store，解构dispatch导致this出错
    const store = this
    store._actions[type](payload)
  }

  install(app, injectKey) { // app.use的时候调用插件时Vue调用这个方法，然后将app实例和参数传递进来
    app.provide(injectKey || storeKey, this) // 将this也就是store仓库通过provide提供出去，那么使用Vue3的inject API就可以接收store了
    app.config.globalProperties.$store = this // vue2的操作是Vue.prototype.$store = this,这样在模板中就可以通过$store得到了store了
  }
}
