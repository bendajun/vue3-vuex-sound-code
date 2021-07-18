# vue3-vuex-sound-code

---

## 借助Vue3从零开始实现Vuex4的版本，主要实现了Vuex的主要功能，去除一些不必要的功能，方便大家学习。

---

## Versions
  总共6个tag，以及一个master主分支
  * **version1.0** 版本1. 实现了state和mutation的功能
  * **version2.0-module** 版本2. 递归处理module模块化
  * **version3.0-no-namespace-store** 版本3. 完成了一个没有命名空间的Vuex
  * **version4.0-namespace-store** 版本4. 命名空间版本Vuex
  * **version5.0-strict-store** 版本5. 为Vuex添加严格模式
  * **version6.0-store-done** 版本6. 添加Vuex插件功能，完成开发
  * **master** 最终版. 添加注释以及添加了许多额外的源码功能

## tips
  * 建议一个一个tag的学习，注释明了
  * 本源码Vuex4中去掉了无法在组合式Api中使用的mapState等helper函数实现方法，方便注重核心功能。


Running the examples:

```bash
$ npm install
$ npm run serve
```