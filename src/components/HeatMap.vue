<template>
    <div class="map-container" id="map"></div>
</template>

<script>
const Host = "http://192.168.1.150:8080";
// heatmap图层
const HEAT_MAP_SOURCE_ID = "__heat_map_source__";
const HEAT_MAP_SOURCE_LAYER = "h3";
const HEAT_MAP_LAYER_ID = "__heat_map_layer_id__"; // 1-11 显示aoi热力图
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GraphQLClient, gql } from "graphql-request";
const ownerClient = new GraphQLClient(`${Host}/owner/graphql`, {
    headers: {},
});
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
const tileUrl = `${Host}/owner/openapi/heatmaps/142620935/{z}/{x}/{y}.pbf`;
import Supercluster from "supercluster";
const cluster = new Supercluster({
    radius: 1.5,
    maxZoom: 16,
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
                this.getHeatMapConfig(profile, map);
                var features = map.querySourceFeatures(HEAT_MAP_SOURCE_ID, {
                    sourceLayer: HEAT_MAP_SOURCE_LAYER,
                });
                // console.log(features);
                cluster.load(features);
            });
        },
        addHeatMap() {
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
                    "heatmap-weight": [
                        "interpolate",
                        ["linear"],
                        ["get", "m"],
                        0,
                        0,
                        300000,
                        1,
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
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0,
                        "rgba(0, 0, 255, 0)",
                        0.1,
                        "royalblue",
                        0.3,
                        "cyan",
                        0.5,
                        "lime",
                        0.7,
                        "yellow",
                        1,
                        "red",
                    ],
                    // Adjust the heatmap radius by zoom level
                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        // ['*',,["zoom"]],
                        ["get", "m"],
                        0,
                        2,
                        20000,
                        100,
                    ],
                    // "heatmap-opacity": [
                    //     "interpolate",
                    //     ["linear"],
                    //     ["get","m"],
                    //     7,
                    //     1,
                    //     600,
                    //     0,
                    // ],
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
                console.log(result);
                console.log(result.configHeatmap);
                console.log(map.getSource(HEAT_MAP_SOURCE_ID));
                if (map.getSource(HEAT_MAP_SOURCE_ID)) {
                    map.getSource(HEAT_MAP_SOURCE_ID).tiles = [
                        `${Constant.mvtHost}/owner/openapi/heatmaps/${result.configHeatmap}/{z}/{x}/{y}.pbf`,
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
    },
};
</script>

<style scoped >
.map-container {
    width: 100vw;
    height: 100vh;
}
</style>
