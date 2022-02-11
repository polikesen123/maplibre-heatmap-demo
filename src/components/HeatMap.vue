<template>
    <div class="map-container" id="map"></div>
</template>

<script>
const Host = "http://192.168.1.151:5588";
const token = `eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJkNjFhNGNkNi00NzJiLTQ5ODQtOTIyMi0wZjRlMjJiZDQ4OTQiLCJpYXQiOjE2NDQ1NDQyNjgsInN1YiI6IjQwNjAzODE4OTc2MTgzOTEwNCIsImlzcyI6InJhbmV2IiwibG9naW5OYW1lIjoiYWRtaW4iLCJ1c2VySWQiOjQwNjAzODE4OTc2MTgzOTEwNCwiZXhwIjoxNjQ0NjA0MjY4fQ.o2tPUxnZc7Xzo4R10SUeF8iIX9Mh67mM5ew_RVgh3tg`;
// heatmap图层
const HEAT_MAP_SOURCE_ID = "__heat_map_source__";
const HEAT_MAP_SOURCE_LAYER = "h3";
const HEAT_MAP_LAYER_ID = "__heat_map_layer_id__"; // 1-11 显示aoi热力图
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GraphQLClient, gql } from "graphql-request";
const ownerClient = new GraphQLClient(
    `${Host}/owner/graphql?token=${token}`,
    {
        headers: {},
    }
);
const geoqGray = {
    name: "geoqGray",
    version: 8,
    sources: {
        mapsource: {
            type: "raster",
            tiles: [
                "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/WMTS/tile/1.0.0/ChinaOnlineCommunity/default/default028mm/{z}/{y}/{x}.png",
            ],
            tileSize: 256,
        },
    },
    layers: [
        {
            id: "mapsource",
            type: "raster",
            source: "mapsource",
            minzoom: 0,
            maxzoom: 18,
        },
    ],
    maxZoom: 15.45,
    minZoom: 0,
};
let tileUrl = `${Host}/owner/openapi/heatmaps/142620935/{z}/{x}/{y}.pbf?token=${token}`;
const defaultColor = [
    "rgba(23, 72, 112, 0.75)",
    "rgba(50, 140, 138, 0.75)",
    "rgba(20, 109, 58, 0.75)",
    "rgba(183, 163, 46, 0.75)",
    "rgba(255, 0, 0, 0.75)",
];
const heatColor1 = [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(0, 0, 255, 0)",
    0.35,
    "royalblue",
    0.6,
    "cyan",
    0.75,
    "lime",
    0.9,
    "yellow",
    1,
    "red",
];
const heatColor2 = [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(255,255,255,0)",
    0.35,
    defaultColor[0],
    0.6,
    defaultColor[1],
    0.75,
    defaultColor[2],
    0.9,
    defaultColor[3],
    1,
    defaultColor[4],
];
import Supercluster from "supercluster";
const cluster = new Supercluster({
    radius: 40,
    maxZoom: 16,
    extent: 512,
    log: true,
    initial: function () {
        return {
            sum: 0,
        };
    },
    map: function (properties) {
        return {
            sum: properties.m,
        };
    },
    reduce: function (accumulated, properties) {
        accumulated.sum += properties.sum;
    },
});
const profile = {
    city: "110099",
    lifeCycle: {
        feature: "life",
        life: {
            indicator: "times",
        },
    },
    raBusinessArea: "",
    district: "",
    customerFence: "",
    geometry: "",
};
export default {
    name: "heat-map",
    data() {
        return {
            map: null,
        };
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            const map = new maplibregl.Map({
                container: "map",
                style: geoqGray, // stylesheet location
                center: [103.81749736759753, 38.00962447538922],
                zoom: 3.5,
            });
            this.map = map;
            this.map.on("load", () => {
                this.addHeatMap();
                this.getHeatMapConfig(profile, map);
            });
            this.map.on("zoomend", () => {
                // this.getHeatMapConfig(profile, map);
                // this.changeHeatMapStyle(map);
                // console.log("zoomend", map.getBounds());
                this.changeUrlBounds()
            });
            map.on("dataloading", () => {
                // console.log("-----------data loaded----------");
                // if (!map.getSource(HEAT_MAP_SOURCE_ID)) return;
                // if (!map.getLayer(HEAT_MAP_LAYER_ID)) return;
                // var features = map.querySourceFeatures(HEAT_MAP_SOURCE_ID, {
                //     sourceLayer: HEAT_MAP_SOURCE_LAYER,
                // });
                // cluster.load(features);
                // var clusters = cluster.getClusters([-180, -85, 180, 85], 2);
                // console.log(clusters);
                this.changeHeatMapStyle(map);
                // console.log(cluster.radius)
            });
            map.on("moveend", () => {
                this.changeUrlBounds()
            });
        },
        addHeatMap() {
            var bounds = this.map.getBounds().toArray();
            tileUrl = `${tileUrl}&bounds=${JSON.stringify(bounds)}`;
            this.map.addSource(HEAT_MAP_SOURCE_ID, {
                type: "vector",
                tiles: [tileUrl],
            });
            this.map.addLayer({
                id: HEAT_MAP_LAYER_ID,
                type: "heatmap",
                source: HEAT_MAP_SOURCE_ID,
                "source-layer": HEAT_MAP_SOURCE_LAYER,
                paint: {
                    // Increase the heatmap weight based on frequency and property magnitude
                    "heatmap-weight": {
                        property: "m",
                        type: "exponential",
                        stops: [
                            [1, 0],
                            [30000, 1],
                        ],
                    },
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    "heatmap-intensity": {
                        stops: [
                            [8, 1.0],
                            [11, 3.0],
                            [16, 5],
                        ],
                    },
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    "heatmap-color": heatColor1,
                    // Adjust the heatmap radius by zoom level
                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0,
                        2,
                        15,
                        130,
                    ],
                    "heatmap-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        8,
                        0.8,
                        15,
                        0.5,
                    ],
                    // Transition from heatmap to circle layer by zoom level
                },
            });
            // this.map.addLayer({
            //     id: "clusters",
            //     type: "circle",
            //     source: HEAT_MAP_SOURCE_ID,
            //     "source-layer": HEAT_MAP_SOURCE_LAYER,
            //     paint: {
            //         "circle-color": [
            //             "step",
            //             ["get", "m"],
            //             "#51bbd6",
            //             100,
            //             "#f1f075",
            //             300000,
            //             "#f28cb1",
            //         ],
            //         "circle-radius": 5,
            //     },
            // });
            // this.map.on('mouseover','clusters',(e)=>{
            //     console.log(e.features[0].properties.m)
            // })
            this.changeHeatMapStyle(this.map);
        },
        async getHeatMapConfig(profile, map) {
            const query = gql`
                query ($profile: OwnerProfile!) {
                    configHeatmap(filter: $profile)
                }
            `;
            try {
                const result = await ownerClient.request(query, {
                    profile: profile,
                });
                // console.log(result);
                // console.log(result.configHeatmap);
                // console.log(map.getSource(HEAT_MAP_SOURCE_ID));
                if (map.getSource(HEAT_MAP_SOURCE_ID)) {
                    map.getSource(HEAT_MAP_SOURCE_ID).tiles = [
                        `${Host}/owner/openapi/heatmaps/${result.configHeatmap}/{z}/{x}/{y}.pbf`,
                    ];
                    map.style.sourceCaches[HEAT_MAP_SOURCE_ID].clearTiles();
                    map.style.sourceCaches[HEAT_MAP_SOURCE_ID].update(
                        map.transform
                    );
                }
                return this;
            } catch (error) {
                return this;
            }
        },
        changeHeatMapStyle(map) {
            if (!map.getSource(HEAT_MAP_SOURCE_ID)) return;
            if (!map.getLayer(HEAT_MAP_LAYER_ID)) return;
            var features = map.querySourceFeatures(HEAT_MAP_SOURCE_ID, {
                sourceLayer: HEAT_MAP_SOURCE_LAYER,
            });
            // console.log("features:", features);
            // cluster.load(features);
            let featureData = features.map((item) => item?.properties?.m);
            let max = 30000;
            let min = 0;
            if (featureData.length) {
                max = Math.max(...featureData);
                min = Math.min(...featureData);
            }
            console.log(`max:${max}`, `min: ${min}`);
            if (max === Infinity) return;
            if (min === Infinity) return;
            let zoom = map.getZoom();
            let radius = 90;
            console.log("zoom:", zoom);
            let paint = [
                "interpolate",
                ["linear"],
                ["get", "m"],
                0,
                0,
                max,
                radius,
            ];
            map.setPaintProperty(HEAT_MAP_LAYER_ID, "heatmap-radius", paint);
            let paitW = ["interpolate", ["linear"], ["get", "m"], 0, 0, max, 1];
            map.setPaintProperty(HEAT_MAP_LAYER_ID, "heatmap-weight", paitW);
        },
        changeUrlBounds() {
            let map = this.map;
            var bounds = map.getBounds().toArray();
            if (map.getSource(HEAT_MAP_SOURCE_ID)) {
                map.getSource(HEAT_MAP_SOURCE_ID).tiles = [
                    `${Host}/owner/openapi/heatmaps/142620935/{z}/{x}/{y}.pbf?bounds=${JSON.stringify(bounds)}&token=${token}`,
                ];
                map.style.sourceCaches[HEAT_MAP_SOURCE_ID].clearTiles();
                map.style.sourceCaches[HEAT_MAP_SOURCE_ID].update(
                    map.transform
                );
            }
        },
    },
};
</script>

<style scoped >
.map-container {
    width: 100vw;
    height: 100vh;
}
</style>
