<template>
  <div id="app">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <HeatMap></HeatMap>
    <!-- <SuperCluster></SuperCluster> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import HeatMap from './components/HeatMap.vue'
import SuperCluster from './components/SuperCluster.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    HeatMap,
    SuperCluster
  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
