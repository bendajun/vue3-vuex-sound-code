import { createStore } from '../vuex-source'

const customPlugin = (store) => {
  console.log('我是插件，我在store初始化完毕之后执行了')
  store.subscribe((mutation, state) => {
    console.log(mutation, state, '每当状态发生变化，也就是调用mutation的时候，我就会执行')
  })
}

export default createStore({
  plugins: [ // 会按照顺序依次执行插件，执行的时候会将store传递给你
    customPlugin
  ],
  strict: true,
  state: {
    count: 0
  },
  getters: {
    double(state) {
      return state.count * 2
    }
  },
  mutations: {
    add(state, payload) {
      state.count += payload
    }
  },
  actions: {
    asyncAdd({ commit }, payload) {
      setTimeout(() => {
        commit('add', payload)
      }, 1000)
    },
    asyncPromiseAdd({ commit }, payload) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('add', payload)
          resolve('asyncPromiseAdd')
        }, 1000)
      })
    }
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
      },
      modules: {
        cCount: {
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
})
