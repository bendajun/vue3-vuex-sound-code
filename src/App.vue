<template>
  <div>count: {{ count }}</div>
  <div>count: {{ $store.state.count }}</div>
  <div>double: {{ double }}</div>
  <button @click="addCount">同步增加counte</button>
  <button @click="asyncAddCount">异步增加counte</button>
  <button @click="asyncPromiseAddCount">Promise异步增加counte</button>
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
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      addCount,
      asyncAddCount,
      asyncPromiseAddCount,
    }
  }
}
</script>

<style>

</style>
