<template>
  <div id="app">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <HeatMap></HeatMap>
    <!-- <SuperCluster></SuperCluster> -->
    <!-- <MapboxMap></MapboxMap> -->
    <!-- <GridLayer></GridLayer> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import HeatMap from './components/HeatMap.vue'
import SuperCluster from './components/SuperCluster.vue';
import MapboxMap from './components/Mapbox.vue'
import GridLayer from './components/GridLayer.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    HeatMap,
    SuperCluster,
    MapboxMap,
    GridLayer
  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
