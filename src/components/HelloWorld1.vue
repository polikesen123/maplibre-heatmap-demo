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
            // Add a geojson point source.
            // Heatmap layers also work with a vector tile source.
            self.map.addSource("earthquakes", {
                type: "geojson",
                data: aoi_points,
            });
            // self.map.addSource("aoi_center.mbtiles", {
            //     type: "vector",
            //     tiles: [
            //         `http://192.168.1.150:8080/aoi_center.mbtiles/{z}/{x}/{y}.pbf`,
            //     ],
            // });
            self.map.addLayer({
                id: "aoi_center-heat",
                type: "heatmap",
                source: "earthquakes",
                // "source-layer": "aoi_center",
                // maxzoom: 9,
                paint: {
                    // Increase the heatmap weight based on frequency and property magnitude
                    /**
                         * 
                         [
                            "interpolate",
                            ["linear"],
                            ["get", "mag"],
                            0,
                            0,
                            6,
                            1,
                          ]
                         */
                    "heatmap-weight": [
                        "interpolate",
                        ["linear"],
                        [
                            "to-number",
                            ["get", ["get", "code"], ["literal", aoi]],
                        ],
                        0,
                        0,
                        827,
                        50,
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0,
                        1,
                        9,
                        3,
                        11,
                        4,
                        12,
                        5,
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0,
                        "rgba(0,0,0,0)",
                        0.2,
                        "#157219",
                        0.4,
                        "#72af01",
                        0.6,
                        "#f1fe2a",
                        0.8,
                        "#ffac18",
                        1,
                        "#ff3b18",
                    ],
                    // Adjust the heatmap radius by zoom level
                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0,
                        2,
                        9,
                        4,
                        10,
                        5,
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    "heatmap-opacity": 1,
                },
            });
            console.log(self.map.getLayer("aoi_center-heat"));
            /*self.map.addLayer(
                {
                    id: "earthquakes-point",
                    type: "circle",
                    source: "earthquakes",
                    minzoom: 7,
                    paint: {
                        // Size circle radius by earthquake magnitude and zoom level
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            7,
                            [
                                "interpolate",
                                ["linear"],
                                ["get", "mag"],
                                1,
                                1,
                                6,
                                4,
                            ],
                            16,
                            [
                                "interpolate",
                                ["linear"],
                                ["get", "mag"],
                                1,
                                5,
                                6,
                                50,
                            ],
                        ],
                        // Color circle by earthquake magnitude
                        "circle-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "mag"],
                            1,
                            "rgba(33,102,172,0)",
                            2,
                            "rgb(103,169,207)",
                            3,
                            "rgb(209,229,240)",
                            4,
                            "rgb(253,219,199)",
                            5,
                            "rgb(239,138,98)",
                            6,
                            "rgb(178,24,43)",
                        ],
                        "circle-stroke-color": "white",
                        "circle-stroke-width": 1,
                        // Transition from heatmap to circle layer by zoom level
                        "circle-opacity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            7,
                            0,
                            8,
                            1,
                        ],
                    },
                },
            );*/
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
