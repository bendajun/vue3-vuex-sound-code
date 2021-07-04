import { storeKey } from './injectKey'
import ModuleCollection from './module/module-collection'

export default class Store {
  constructor(options) {
    // eslint-disable-next-line no-unused-vars
    const a = new ModuleCollection(options)
  }

  install(app, injectKey) { // app.use的时候调用插件时Vue调用这个方法，然后将app实例和参数传递进来
    app.provide(injectKey || storeKey, this) // 将this也就是store仓库通过provide提供出去，那么使用Vue3的inject API就可以接收store了
    app.config.globalProperties.$store = this // vue2的操作是Vue.prototype.$store = this,这样在模板中就可以通过$store得到了store了
  }
}

// 注1: 格式化modules

/**
state: {
  count: 0
},
modules: {
  aCount: {
    namespaced: true,
    state: {
      count: 0
    },
    mutations: {
      add(state, payload) {
        state.count += payload
      }
    }
  },
  bCount: {
    namespaced: true,
    state: {
      count: 0
    },
    mutations: {
      add(state, payload) {
        state.count += payload
      }
    }
  }
}
*/
// 我们需要转换成如下，更好管理 取cCount的 state, 可以通过 $store.state.aCount.cCount.count
/**

root = {
  _raw: rootModule,
  state: rootModule.state,
  _children: {
    aCount: {
      _raw: aModule,
      state: aModule.state,
      _children: {
        cCount: {
        _raw: cModule,
        state: cModule.state,
        _children: {}
      }
    },
    bCount: {
      _raw: bModule,
      state: bModule.state,
      _children: {}
    }
  }
}
*/
