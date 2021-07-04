import Store from './store'
import { useStore } from './injectKey'

const createStore = (options) => {
  return new Store(options)
}

export {
  createStore,
  useStore
}
