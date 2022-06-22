<template>
    <div class="map" id="map"></div>
</template>

<script>
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
let eq = require("../../eq.json");
let aoi = require("../../aoi.json");
let aoi_points = require("../../aoi_points.json");
aoi = aoi.reduce((a, c) => {
    a[c.id] = c.m; //6*Math.random()
    return a;
}, new Object());

// console.log(aoi);
const defaultColor = [
    "rgba(23, 72, 112, 0.75)",
    "rgba(50, 140, 138, 0.75)",
    "rgba(20, 109, 58, 0.75)",
    "rgba(183, 163, 46, 0.75)",
    "rgba(255, 0, 0, 0.75)",
];

const amapStyle = {
    name: "amap",
    version: 8,
    sources: {
        mapsource: {
            type: "raster",
            tiles: [
                "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
            ],
            tileSize: 256,
        },
    },
    layers: [
        {
            id: "mapsource",
            type: "raster",
            source: "mapsource",
            minzoom: 1.5,
            maxzoom: 22,
        },
    ],
    glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    maxZoom: 17.49,
    minZoom: 1.5,
    mapCode: "高德地图 GS(2019)6379号",
};
import Supercluster from "supercluster";
var cluster = new Supercluster({ radius: 40, maxZoom: 16 });
export default {
    name: "HelloWorld",
    data() {
        return {
            map: null,
        };
    },
    methods: {
        initMap() {
            const container = document.getElementById("map");
            const map = new maplibre.Map({
                container: container, // container ID
                style: amapStyle, // style URL
                center: [103.81749736759753, 38.00962447538922],
                zoom: 3.5,
            });
            this.map = map;
            this.map.on("zoomend", () => {
                var features = map.querySourceFeatures("park.mbtiles", {
                    sourceLayer: "park",
                });
                cluster.load(features);
            });
        },
    },
    mounted() {
        this.initMap();
        const self = this;
        this.map.on("load", function () {
            self.map.addSource("culture_gcj.mbtiles", {
                type: "vector",
                tiles: [
                    `http://118.195.153.84/culture_gcj.mbtiles/{z}/{x}/{y}.pbf`,
                ],
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50,
            });
            self.map.addLayer({
                id: "__world_heritage_layer__",
                type: "circle",
                source: "culture_gcj.mbtiles",
                "source-layer": "world_heritage",
                paint: {
                    "circle-color": "#FFA500",
                    "circle-opacity": 0.8,
                },
            });
            self.map.addLayer({
                id: "__village_layer__",
                type: "circle",
                source: "culture_gcj.mbtiles",
                "source-layer": "city_town_village",
                filter: ["==", "LX", "历史文化名村"],
                paint: {
                    "circle-color": "#008B8B",
                    "circle-opacity": 0.8,
                },
            });
            self.map.addLayer({
                id: "__city_layer__",
                type: "circle",
                source: "culture_gcj.mbtiles",
                "source-layer": "city_town_village",
                filter: ["==", "LX", "历史文化名城"],
                paint: {
                    "circle-color": "#A020F0",
                    "circle-opacity": 0.8,
                },
            });
            self.map.addLayer({
                id: "__town_layer__",
                type: "circle",
                source: "culture_gcj.mbtiles",
                "source-layer": "city_town_village",
                filter: ["==", "LX", "历史文化名镇"],
                paint: {
                    "circle-color": "#FF6347",
                    "circle-opacity": 0.8,
                },
            });
            self.map.addLayer({
                id: "__traditional_village_layer__",
                type: "circle",
                source: "culture_gcj.mbtiles",
                "source-layer": "traditional_village",
                paint: {
                    "circle-color": "#FFFF00",
                    "circle-opacity": 0.8,
                },
            });
            // self.map.on("click", "__world_heritage_layer__", (e) => {
            //     console.log(e.features[0].properties);
            // });
            // self.map.addSource("deepcity.mbtiles", {
            //     type: "vector",
            //     tiles: [
            //         `http://118.195.153.84/deepcity.mbtiles/{z}/{x}/{y}.pbf`,
            //     ],
            // });
            // self.map.addLayer({
            //     id: "__deepcity_layer__",
            //     type: "circle",
            //     source: "deepcity.mbtiles",
            //     "source-layer": "deepcity",
            //     paint: {
            //         "circle-color": "#00FFFF",
            //         "circle-opacity": 0.8,
            //         "circle-radius": 20,
            //     },
            // });
        });
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#map {
    width: 100%;
    height: 100%;
}
</style>
