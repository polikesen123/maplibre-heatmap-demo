<template>
  <div id="app">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <HeatMap></HeatMap>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import HeatMap from './components/HeatMap.vue'

export default {
  name: 'App',
  components: {
    HelloWorld,
    HeatMap
  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
