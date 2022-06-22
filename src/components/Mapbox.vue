<template>
    <div class="map-container" id="map"></div>
</template>

<script>
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken =
    "pk.eyJ1IjoicG9saWtlc2VuIiwiYSI6ImNrNHptZzFkZzA5OTIzbWs3Mjd3bXM0bTAifQ.b2xG5nueRjrGFAVK7Lmdaw";
export default {
    name: "Mapbox",
    data() {
        return {
            map: null,
        };
    },
    mounted() {
        const map = new mapboxgl.Map({
            container: "map", // container ID
            style: "mapbox://styles/mapbox/streets-v11", // style URL
            center: [103.81749736759753, 38.00962447538922],
            zoom: 3.5, // starting zoom
        });
        this.map = map;
        map.on("load", () => {
            this.addLayer();
        });
    },
    methods: {
        addLayer() {
            this.map.addSource("culture_gcj.mbtiles", {
                type: "vector",
                tiles: [
                    `http://118.195.153.84/culture_gcj.mbtiles/{z}/{x}/{y}.pbf`,
                ],
            });
            this.map.addLayer({
                id: "__world_heritage_layer__",
                type: "circle",
                source: "culture_gcj.mbtiles",
                "source-layer": "world_heritage",
                paint: {
                    "circle-color": "#FFA500",
                    "circle-opacity": 0.8,
                },
            });
            this.map.on('click','__world_heritage_layer__',(e)=>{
                console.log(e.features[0].properties);
            })
        },
    },
};
</script>

<style scoped>
.map-container {
    width: 100vw;
    height: 100vh;
}
</style>
