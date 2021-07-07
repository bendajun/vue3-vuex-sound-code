import { forEachValue } from '../utils'

// 生成module的
export default class Module {
  constructor(rawModule) {
    this._raw = rawModule // 这里保存的是createStore时传的modules下module元数据
    this._children = {} // 当前module下是否还有module
    this.state = rawModule.state // 对应module的state
    this.namespaced = rawModule.namespaced
  }

  addChild(key, module) {
    this._children[key] = module
  }

  getChild(key) {
    return this._children[key]
  }

  forEachChild(fn) {
    forEachValue(this._children, fn)
  }

  forEachGetter(fn) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, fn)
    }
  }

  forEachMutation(fn) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, fn)
    }
  }

  forEachAction(fn) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, fn)
    }
  }
}
