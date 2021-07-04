import { inject } from 'vue'

export const storeKey = 'store'
export const useStore = (injectKey = null) => {
  // 通过inject将 vuex插件调用的时候app.provide提供的store实例返回出去
  return inject(injectKey !== null ? injectKey : storeKey)
}
