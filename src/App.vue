<template>
  <div>count: {{ count }}</div>
  <div>count: {{ $store.state.count }}</div>
  <div>double: {{ double }}</div>
  <button @click="addCount">增加counte</button>
</template>

<script>
import { computed } from 'vue'
import { useStore } from './vuex-source'

export default {
  setup() {
    const store = useStore()
    console.log(store)
    const addCount = () => {
      store.commit('add', 2)
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      addCount,
    }
  }
}
</script>

<style>

</style>
