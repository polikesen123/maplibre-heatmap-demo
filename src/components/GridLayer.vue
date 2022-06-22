<template>
    <div class="map" id="map"></div>
</template>

<script>
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
    name:'GridLayer',
    data() {
        return {
            map:null,
        }
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
        addGridLayer(){
            this.map.addSource("ry_block.mbtiles", {
                type: "vector",
                tiles: [
                    `http://192.168.1.151:5588/ry_block.mbtiles/{z}/{x}/{y}.pbf`,
                ],
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50,
            });
            this.map.addLayer({
                id: "__ry_block_layer__",
                type: "fill",
                source: "ry_block.mbtiles",
                "source-layer": "ry_block_wkt_geojson",
                paint: {
                    "fill-color": "#b0d5df",
                    "fill-opacity": 0.8,
                    "fill-outline-color":"#0eb0c9"
                },
            });
            this.map.on('click','__ry_block_layer__',(e)=>{
                let features = e.features[0].properties;
                console.log(features)
            })
        }
    },
    mounted(){
        this.initMap();
        this.map.on('load',()=>{
            this.addGridLayer();
        })
    }
};
</script>

<style scoped lang="css">
#map {
    width: 100%;
    height: 100%;
}
</style>
