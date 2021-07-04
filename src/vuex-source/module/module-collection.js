
import { forEachValue } from '../utils'
import Module from './module'

export default class ModuleCollection { // 此类是用来处理module格式的，注1
  constructor(rootModule) {
    this.root = null
    this.register(rootModule, [])
    console.log(this.root)
  }

  register(rawModule, path) {
    const newModule = new Module(rawModule)
    if (path.length === 0) {
      this.root = newModule
    } else {
      // [1, 2, 3].slice(0, -1) => [1, 2],截取的返回是从数组的第一个开始截取到最后一个，含头不含尾
      // ['a', 'c'] => ['a']
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }

    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        console.log(key)
        this.register(rawChildModule, path.concat(key))
      })
    }
  }
}
