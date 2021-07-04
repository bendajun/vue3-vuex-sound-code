export default class Module { // 生成module的
  constructor(rawModule) {
    this._raw = rawModule
    this.state = rawModule.state
    this._children = {}
  }

  addChild(key, module) {
    this._children[key] = module
  }

  getChild(key) {
    return this._children[key]
  }
}
