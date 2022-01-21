<template>
    <div class="map" id="map"></div>
</template>

<script>
const HostURL = "http://39.99.248.142";
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
import axios from "axios";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
var cluster = new Supercluster({ radius: 40, maxZoom: 16 });

export default {
    name: "SuperCluster",
    data() {
        return {
            map: null,
            jsonData: null,
        };
    },
    created() {
        this.getData();
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
            map.on("load", (e) => {
                this.addCulturalVillageLayer();
            });
        },
        addCulturalVillageLayer() {
            this.map.addSource("city_town_village", {
                type: "geojson",
                data: "/data/history_town.geojson",
                cluster: true,
                clusterMaxZoom: 18, // Max zoom to cluster points on
                clusterRadius: 50,
            });
            this.map.addLayer({
                id: "clusters",
                type: "circle",
                source: "city_town_village",
                filter: ["has", "point_count"],
                paint: {
                    "circle-color": [
                        "step",
                        ["get", "point_count"],
                        "#EEC591",
                        10,
                        "#EE9A00",
                        50,
                        "#FF6347",
                    ],
                    "circle-radius": [
                        "step",
                        ["get", "point_count"],
                        10,
                        5,
                        15,
                        10,
                        20,
                        20,
                        25
                    ],
                },
            });
            this.map.on("click", "clusters", (e) => {
                console.log(e.features[0]);
            });
        },
        getData() {
            // axios.get("/data/city_town_village.geojson").then(function (res) {
            //     this.jsonData = res.data;
            // });
        },
    },
    mounted() {
        this.initMap();
    },
};
</script>

<style scoped>
#map {
    width: 100%;
    height: 100%;
}
</style>
