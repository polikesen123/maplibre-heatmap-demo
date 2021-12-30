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

console.log(aoi);
const defaultColor = ['rgba(23, 72, 112, 0.75)', 'rgba(50, 140, 138, 0.75)', 'rgba(20, 109, 58, 0.75)', 'rgba(183, 163, 46, 0.75)', 'rgba(255, 0, 0, 0.75)'];

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
        },
    },
    mounted() {
        this.initMap();
        const self = this;
        this.map.on("load", function () {
            self.map.addSource("park.mbtiles", {
                type: "vector",
                tiles: [
                    `http://192.168.1.150:8080/park.mbtiles/{z}/{x}/{y}.pbf`,
                ],
            });
            self.map.addLayer({
                id: "__park_cirle_layer__",
                type: "circle",
                source: "park.mbtiles",
                "source-layer": "park",
                paint:{
                    "circle-color":"#ff0000",
                    "circle-opacity":0.5
                }
            })
            self.map.addLayer({
                id: "__park_heatmap_layer__",
                type: "heatmap",
                source: "park.mbtiles",
                "source-layer": "park",
                paint: {
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    "heatmap-radius": {
					stops: [
						[8, 8],
						[11, 18],
						[16, 40]
					]
				},
				"heatmap-intensity": {
					stops: [
						[8, 1.0],
						[11, 3.0],
						[16, 5]
					],
				},
				"heatmap-color": [
					"interpolate",
					["linear"],
					["heatmap-density"],
					0, "rgba(255,255,255,0)",
					0.35, defaultColor[0],
					0.6, defaultColor[1],
					0.75, defaultColor[2],
					0.9, defaultColor[3],
					1, defaultColor[4]
				],
				"heatmap-opacity": {
					stops: [
						[8, 1],
						[11, 1],
						[16, 1]
					]
				}
                },
            });
            console.log(self.map.getLayer("__park_heatmap_layer__"));
            
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
