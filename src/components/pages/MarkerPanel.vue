<style src="~/styles/layer.scss"
       lang="sass"></style>
<template>
    <div class="layer-container" :class="{collapse: collapses}">
        <div class="layer layer-select">
            <header>
                <h3>框选Marker</h3>
                <el-tooltip class="item"
                            effect="dark"
                            content="点击使用圆形框选Marker"
                            placement="bottom"><span
                        class="shape"
                        :class="{active: currShape === 'circle'}"
                        @click="selectShape('circle')"></span>
                </el-tooltip>
                <el-tooltip class="item"
                            effect="dark"
                            content="点击使用长方形框选Marker"
                            placement="bottom"><span
                        class="shape rectangle"
                        :class="{active: currShape === 'rectangle'}"
                        @click="selectShape('rectangle')"></span></el-tooltip>
                <el-tooltip class="item"
                            effect="dark"
                            content="折叠面板"><span><i class="el-icon-caret-bottom"
                                                    @click="handleCollapse('markers')"></i></span>
                </el-tooltip>
            </header>
            <div class="layer-content">
                <ul v-if="selectedMarkers.length">
                    <li v-for="(item, idx) in selectedMarkers"
                        :class="{selected: item.getPosition().join(',')===selectedLngLat}"
                        :key="idx"
                        @mouseover="handleMouseoverMarker(item)"
                        @mouseout="handleMouseoutMarker(item)"
                        @click="handleMarkerClick(item)">{{item.w.name}}
                    </li>
                </ul>
                <span v-else
                      class="nothing">没有选中Marker</span>
            </div>
            <footer>
                <el-button size="mini"
                           @click="clearSelect">清除
                </el-button>
                <el-button size="mini"
                           @click="exportToGEOJSON">导出
                </el-button>
                <span v-if="selectedMarkers.length">({{selectedMarkers.length}})</span>
            </footer>
        </div>
        <div class="layer layer-select-collapse">
            <div class="collapse-icon"
                 @click="handleCollapse('markers')">
                <el-tooltip class="item"
                            effect="dark"
                            content="展开面板">
                    <el-badge :value="selectedMarkers.length"
                              class="item"
                              :hidden="!selectedMarkers.length"><i
                            class="el-icon-location"></i>
                    </el-badge>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'MarkerPanel',
        data() {
            return {
                collapses: false,                           // 是否折叠面板
                currShape: '',                              // 当前框选所选的方式
                selectOptions: ['circle', 'rectangle'],     // 框选方式: circle, rectangle
                selectedLngLat: ''                          // 被点击的marker的经纬度
            }
        },
        props: ['shape', 'selectedMarkers'],
        methods: {
            /**
             * 点击`框选marker`列表中的某一个marker
             * @param marker
             */
            handleMarkerClick(marker) {
                if (marker) {
                    this.selectedLngLat = marker.getPosition().join(',')
                    // 将被点击事件emit到父组件
                    this.$emit('markerClick', marker)
                }
            },
            handleMouseoverMarker(marker) {
                this.$emit('markerMouseover', marker)
            },
            handleMouseoutMarker(marker) {
                this.$emit('markerMouseout', marker)
            },
            /**
             * 折叠/展开面板
             */
            handleCollapse() {
                this.collapses = !this.collapses
            },
            /**
             * 清除框选的选取状态
             */
            clearSelect() {
                this.$emit('clearSelect')
            },
            /**
             * 导出选中的marker到.geojson文件
             */
            exportToGEOJSON() {
                if (this.selectedMarkers.length) {
                    function downloadObjectAsJson(exportObj, exportName) {
                        if (navigator.msSaveBlob) { // IE10+
                            let blob = new Blob([JSON.stringify(exportObj)], {type: 'application/json'})
                            return navigator.msSaveBlob(blob, exportName + ".geojson")
                        }
                        let dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj))
                        let downloadAnchorNode = document.createElement('a')
                        downloadAnchorNode.setAttribute("href", dataStr)
                        downloadAnchorNode.setAttribute("download", exportName + ".geojson")
                        downloadAnchorNode.innerText = exportName
                        document.body.appendChild(downloadAnchorNode) // required for firefox
                        downloadAnchorNode.click()
                        downloadAnchorNode.remove()
                    }

                    // 生成导出数据
                    let exportBody = {
                        "type": "FeatureCollection",
                        "features": []
                    }

                    this.selectedMarkers.map(marker => {
                        exportBody.features.push({
                            "type": "Feature",
                            "properties": {"name": marker.w.name || marker.w.label},
                            "geometry": {"type": "Point", "coordinates": marker.getPosition()}
                        })
                    })
                    downloadObjectAsJson(exportBody, "data")
                } else {
                    this.$notify.error({
                        title: '错误',
                        message: '没有可以导出的Marker!',
                        position: 'bottom-right'
                    })
                }
            },
            /**
             * 切换框选方式: circle, rectangle
             * @param shape
             */
            selectShape(shape) {
                this.currShape = shape
                this.$emit('shapeChanged', shape)
            }
        },
        created() {
            // 捕获全局事件
            this.Bus.$on('selected.marker.cleared', () => {
                // 当被点击的marker被取消以后, 重置`被点击的marker的经纬度`
                this.selectedLngLat = ''
            })
            // 初始化框选方式
            this.currShape = this.shape
        },
        watch: {
            /**
             * 监听框选方式
             */
            shape() {
                this.currShape = this.shape
            }
        }
    }
</script>