
import { forEachValue } from '../utils'
import Module from './module'

export default class ModuleCollection { // 此类是用来处理module格式的，注1
  constructor(rootModule) {
    this.root = null
    this.register(rootModule, [])
  }

  register(rawModule, path) {
    const newModule = new Module(rawModule)

    if (path.length === 0) {
      this.root = newModule
    } else {
      // [1, 2, 3].slice(0, -1) => [1, 2],截取的返回是从数组的第一个开始截取到最后一个，含头不含尾
      // ['a', 'c'] => ['a']
      // ['a', 'c', 'b'] => ['a', 'c']
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }

    if (rawModule.modules) { // 递归处理生成module
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        // console.log('当前模块module的名称key ==>', key)
        this.register(rawChildModule, path.concat(key)) // concat() 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组
      })
    }
  }

  getNamespaced(path) { // ['a', 'c']
    let module = this.root
    return path.reduce((namespaceStr, key) => {
      module = module.getChild(key) // 子模块
      return namespaceStr + (module.namespaced ? key + '/' : '')
    }, '')
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
// 我们需要转换成如下,以便更好的处理
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
