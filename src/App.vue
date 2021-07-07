<template>
  <div>根模块：count: {{ count }}</div>
  <div>根模块：count: {{ $store.state.count }}</div>
  <div>根模块：double: {{ double }}</div>
  <button @click="addCount">根模块：同步增加counte</button>
  <button @click="asyncAddCount">根模块：异步增加counte</button>
  <button @click="asyncPromiseAddCount">根模块：Promise异步增加counte</button>
  <hr />
  <div>a模块：aModuleCount: {{ aModuleCount }}</div>
  <button @click="addAmoduleCount">a模块：同步增加aModuleCount</button>
</template>

<script>
import { computed } from 'vue'
import { useStore } from './vuex-source'

export default {
  setup() {
    const store = useStore()
    const addCount = () => {
      store.commit('add', 1)
    }
    const asyncAddCount = () => {
      store.dispatch('asyncAdd', 1)
    }
    const asyncPromiseAddCount = async() => {
      const res = await store.dispatch('asyncPromiseAdd', 1)
      console.log('asyncPromiseAddCount返回结果==>', res)
    }

    const addAmoduleCount = () => {
      store.commit('aCount/add', 1)
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      addCount,
      asyncAddCount,
      asyncPromiseAddCount,
      aModuleCount: computed(() => store.state.aCount.count),
      addAmoduleCount,
    }
  }
}
</script>

<style>

</style>
