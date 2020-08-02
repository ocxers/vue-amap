<style src="~/styles/vue-amap.scss"
       lang="sass"></style>
<template>
    <div class="vue-amap-container">
        <!-- 地图控件 -->
        <el-amap vid="vueAMap"
                 @contextmenu.native="clearSelect"
                 :amap-manager="amapManager"
                 :events="amapEvents"
                 :center="center"
                 :zoom="zoom"
                 class="vue-amap"></el-amap>
        <!-- 图层管理面板 -->
        <LayerPanel :layerObj="layers"
                    :layerItems="layerList"
                    @refreshLayer="refreshLayer"
                    @mouseOverLayer="handleMouseOverLayer"
                    @mouseOutLayer="handleMouseOutLayer"
                    @deleteLayer="handleDeleteLayer"
                    @clearSelect="clearSelect"></LayerPanel>
        <!-- 框选Marker面板 -->
        <MarkerPanel :selectedMarkers="selectedMarkers"
                     :shape="currShape"
                     @markerClick="handleMarkerClick"
                     @clearSelect="clearSelect"
                     @shapeChanged="selectShape"
                     @markerMouseover="handleMarkerMouseover"
                     @markerMouseout="handleMarkerMouseout"
        ></MarkerPanel>
    </div>
</template>
<script>
    import {AMapManager} from "vue-amap"
    import POIMarker from '~/assets/img/poi-marker.png'
    import centerIcon from '~/assets/img/selected-icon.png'
    import mouseoverIcon from '~/assets/img/mouseover-icon.png'
    import LayerPanel from "~/components/pages/LayerPanel.vue"
    import MarkerPanel from "~/components/pages/MarkerPanel.vue"

    let amapManager = new AMapManager()

    export default {
        name: 'VueAMap',
        data() {
            let self = this
            return {
                defaultOpacity: 0.7,                // 加载到地图上的marker的图标默认的透明度
                clickedMarker: null,                // 在选中的marker列表中, 被点击的那个marker
                mouseoverMarker: null,              // 在选中的marker列表中, 鼠标悬停的那个marker
                icons: {                            // marker的图标集合
                    icon: {
                        image: POIMarker,           // 普通图标, 蓝色
                        clipOrigin: [282, 0],
                        clipSize: [50, 68],
                        size: [25, 34],
                        anchor: 'bottom-center',
                        angel: 0,
                        retina: true
                    },
                    selected: {                     // 选中图标, 红色
                        image: POIMarker,
                        clipOrigin: [717, 0],
                        clipSize: [50, 68],
                        size: [25, 34],
                        anchor: 'bottom-center',
                        angel: 0,
                        retina: true
                    },
                    mouseoverIcon: {                // 鼠标悬停图标, 红色
                        image: mouseoverIcon,
                        clipOrigin: [-2, -2],
                        clipSize: [313, 400],
                        size: [31.3, 40],
                        anchor: 'bottom-center',
                        angel: 0,
                        retina: true
                    },
                    centerIcon: {                   // 被点击marker的图标
                        type: 'image',
                        image: centerIcon,
                        clipOrigin: [-2, -2],
                        clipSize: [128, 128],
                        size: [48, 48],
                        anchor: 'bottom-center',
                        angel: 0,
                        retina: true
                    }
                },
                currShape: '',                      // 当前选取形状: circle, rectangle
                zoom: 11,                           // 地图默认缩放级别
                center: [114.0579, 22.5432],        // 地图默认中心坐标: 深圳
                amapManager,                        // 地图控件
                overlays: [],                       // 地图上框选的覆盖层
                overlayPath: [],                    // 地图上框选覆盖层的路径
                currLayerName: '',                  // 当前最上层图层的key值
                layers: {},                         // 所有载入图层的集合, 转化为key, value的object方式, 方便检索
                layerList: [],                      // 所有载入图层的列表, Array, 包含原始数据和格式化后的数据
                selectedMarkers: [],                // 框选后, 在框选区内部的当前图层的markers
                mouseTool: null,                    // 地图的MouseTool
                amapEvents: {                       // 地图的初始化事件
                    init(map) {
                        // 添加地图工具条插件
                        AMap.plugin([
                            'AMap.ToolBar',
                        ], () => {
                            // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
                            map.addControl(new AMap.ToolBar({
                                position: 'RB'      // 工具条控件位置: 右下角
                            }))
                        })
                        // 添加地图鼠标工具
                        AMap.plugin('AMap.MouseTool', () => {
                            self.mouseTool = new AMap.MouseTool(map)
                            // 监听框选事件
                            self.mouseTool.on('draw', (e) => {
                                map.remove(self.overlays)
                                self.overlays = []
                                self.overlays.push(e.obj)
                                let bounds = e.obj.getBounds()
                                self.overlayPath = []	//覆盖物路径

                                if (e.obj.CLASS_NAME == "AMap.Marker") {
                                    self.overlayPath.push(e.obj.getPosition())
                                } else {
                                    let southWest = bounds.getSouthWest()
                                    let northEast = bounds.getNorthEast()
                                    if (southWest.equals(northEast)) {
                                        return
                                    }
                                    self.overlayPath = e.obj.getPath()
                                }

                                // 框选结束后, 获取在选区内的markers
                                self.getSelectMarkers()

                                // 关闭鼠标事件
                                self.mouseTool.close(false)
                                // 取消选取形状设置
                                self.currShape = ''
                            })
                        })
                    }
                }
            }
        },
        computed: {
            /**
             * 获取当前图层
             */
            currLayer() {
                if (this.currLayerName) {
                    return this.layers[this.currLayerName].layer
                } else {
                    return null
                }
            },
            /**
             * 获取地图
             */
            map() {
                return amapManager.getMap()
            }
        },
        methods: {
            handleMarkerMouseover(marker) {
                if (marker) {
                    // 设置该marker的透明度为不透明
                    marker.setOpacity(1)
                    // 设置该marker的图标为被悬停图标
                    marker.setIcon(this.icons.mouseoverIcon)
                }
            },
            handleMarkerMouseout(marker) {
                if (marker) {
                    // 先还原之前被点击的marker的状态
                    // 设置marker的透明度为默认状态
                    marker.setOpacity(this.defaultOpacity)
                    // 设置marker的图标
                    if (this.clickedMarker && this.clickedMarker.getPosition().join(',') === marker.getPosition().join(',')) {
                        marker.setOpacity(1)
                        marker.setIcon(this.icons.centerIcon)
                    } else {
                        marker.setOpacity(this.defaultOpacity)
                        marker.setIcon(this.icons.selected)
                    }
                }
            },
            /**
             * 处理marker被点击事件
             */
            handleMarkerClick(marker) {
                if (this.clickedMarker) {
                    // 先还原之前被点击的marker的状态
                    // 设置marker的透明度为默认状态
                    this.clickedMarker.setOpacity(this.defaultOpacity)
                    // 设置marker的图标
                    this.clickedMarker.setIcon(marker ? this.icons.selected : this.icons.icon)
                    // 取消之前被点击的marker
                    this.clickedMarker = null
                }

                if (marker) {
                    // 重新设置地图中心为被点击的marker的坐标
                    this.map.setCenter(marker.getPosition())
                    // 设置该marker的透明度为不透明
                    marker.setOpacity(1)
                    // 设置该marker的图标为被点击图标
                    marker.setIcon(this.icons.centerIcon)
                    // 保存被点击的marker
                    this.clickedMarker = marker
                }
            },
            /**
             * 刷新图层
             * @param itemList  可选
             */
            refreshLayer(itemList) {
                if (itemList) {
                    // 如果传入了itemList(子组件有更新), 那么就更新当前的layerList
                    this.layerList = itemList
                }

                // 从地图上移除所有的图层
                this.layerList.map(layer => {
                    this.map.remove(this.layers[layer.key].layer)
                })

                // 按顺序将图层添加到地图上, 
                // 这样做是为了能够使`图层管理`列表里面, 
                // 最上面的图层总是能在地图的最上层, 
                // 以便在`框选`时, 最上层的图层的marker能被选中
                for (let i = this.layerList.length - 1; i > -1; i--) {
                    this.map.add(this.layers[this.layerList[i].key].layer)
                    this.currLayerName = this.layerList[i].key
                }
            },
            /**
             * 鼠标mouseover在左边的`图层管理`的图层列表上
             * @param layer
             */
            handleMouseOverLayer(layer) {
                let hoverLayer = this.layers[layer.key].layer
                let layerMarkers = hoverLayer.getMarkers()
                // 在地图上, 将该图层的所有的marker的透明度设置为不透明, 方便区别其它图层的marker
                layerMarkers.map(marker => {
                    marker.setOpacity(1)
                })
            },
            /**
             * 鼠标离开左边的`图层管理`的图层列表
             * @param layer
             */
            handleMouseOutLayer(layer) {
                let hoverLayer = this.layers[layer.key].layer
                let layerMarkers = hoverLayer.getMarkers()
                // 在地图上, 将该图层的所有marker的透明度设置为默认值
                layerMarkers.map(marker => {
                    marker.setOpacity(this.defaultOpacity)
                })
            },
            /**
             * 清除所有被框选的marker
             */
            clearSelectedMarkers() {
                // 清除之前, 需将marker的图标设置为普通图标
                this.selectedMarkers.map(marker => {
                    marker.setIcon(this.icons.icon)
                })

                this.selectedMarkers = []
            },
            /**
             * 清除框选的选取状态
             */
            clearSelect() {
                // 将框选覆盖层从地图上移除
                this.map.remove(this.overlays)
                this.overlays = []
                // 清除所有被框选的marker
                this.clearSelectedMarkers()
                // 将当前的框选形状设置为空
                this.currShape = ''
                this.handleMarkerClick()
                // 重置当前被点击的marker为null
                this.clickedMarker = null
                // emit全局事件'selected.marker.cleared', 通知其它组件`框选状态`已清除
                this.Bus.$emit('selected.marker.cleared')
            },
            /**
             * 获取在选取内的所有最上层图层的marker
             */
            getSelectMarkers() {
                let self = this
                if (self.currLayer) {
                    let markers = self.currLayer.getMarkers()

                    let selectedMarkers = []
                    markers.map(marker => {
                        let point = marker.getPosition()
                        // 判断marker是否在选区内
                        let isPointInRing = AMap.GeometryUtil.isPointInRing(point, self.overlayPath)
                        if (isPointInRing) {
                            selectedMarkers.push(marker)
                            marker.setIcon(this.icons.selected)
                        }
                    })

                    self.selectedMarkers = selectedMarkers
                } else {
                    self.selectedMarkers = []
                }
            },
            /**
             * 框选
             */
            draw() {
                let mouseTool = this.mouseTool
                switch (this.currShape) {
                    case 'rectangle':
                        mouseTool.rectangle({
                            fillColor: '#00b0ff',
                            strokeColor: '#80d8ff'
                        })
                        break
                    case 'circle':
                        mouseTool.circle({
                            fillColor: '#00b0ff',
                            strokeColor: '#80d8ff'
                        })
                        break
                }
            },
            /**
             * 切换框选方式: circle, rectangle
             * @param shape
             */
            selectShape(shape) {
                // 框选开始前, 先清除之前的框选状态
                this.clearSelect()
                this.currShape = shape
                this.draw()
            },
            /**
             * 重新设置图层的顺序, 以便在`图层管理`中的图层列表的顺序始终是0,1,2..., 方便在drag, drop的时候定位
             */
            resetOrders() {
                this.layerList.map((layer, idx) => {
                    layer.order = idx
                })
            },
            /**
             * 删除一个指定的图层
             * @param layer
             */
            handleDeleteLayer(layer) {
                let deleteLayer = this.layers[layer.key].layer
                if (deleteLayer) {
                    // 从地图上移除该图层
                    this.map.remove(deleteLayer)
                    // 从layers中删除该property
                    delete this.layers[layer.key]
                    // 从layerList中删除layer
                    this.layerList.splice(this.layerList.indexOf(layer), 1)
                    // 将最上层的图层为当前图层
                    if (this.layerList.length) {
                        this.currLayerName = this.layerList[0].key
                    } else {
                        this.currLayerName = ''
                    }
                    // 清除框选的选取状态
                    this.clearSelect()
                }
            },
            /**
             * 将marker添加到图层上
             * @param layer
             */
            renderMarkers(layer) {
                let positions = layer.markers
                // 创建 AMap.LabelsLayer 图层
                let newLayer = new AMap.LabelsLayer({
                    zooms: [3, 20],
                    zIndex: 111,
                    collision: false
                })

                // 将图层添加到地图
                this.map.add(newLayer)

                let markers = []

                for (let i = 0; i < positions.length; i++) {
                    let curPosition = positions[i]
                    let curData = {
                        position: curPosition.lnglat,
                        name: curPosition.name,
                        opacity: this.defaultOpacity,
                        icon: this.icons.icon,
                        text: {
                            content: curPosition.name,      // 将marker的名字添加到text中, 以便在mouseover一个marker的时候, 能在tooltip上显示该名称
                            offset: [-100000, -100000]
                        }
                    }

                    markers.push(new AMap.LabelMarker(curData))
                }

                // 将marker添加到图层上
                newLayer.add(markers)

                let normalMarker = new AMap.Marker({
                    offset: new AMap.Pixel(-65, -80),
                })

                // 为图层中的marker添加mouseover事件
                newLayer.on('mouseover', (e) => {
                    let position = e.data.data && e.data.data.position

                    if (position) {
                        normalMarker.setContent(
                            '<div class="amap-info-window">'
                            + e.data.data.txt +
                            '<div class="amap-info-sharp"></div>' +
                            '</div>')
                        normalMarker.setPosition(position)
                        this.map.add(normalMarker)
                    }
                })

                // 为图层中的marker添加mouseout事件
                newLayer.on('mouseout', () => {
                    this.map.remove(normalMarker)
                })

                // 将图层添加到layers对象中, 以备检索
                this.layers[layer.key] = {
                    visible: true,
                    layer: newLayer
                }
            },
            /**
             * 将图层渲染到地图上
             */
            renderLayers() {
                let self = this

                this.layerList.map(layer => {
                    // 将未渲染过的图层, 添加到地图上
                    if (!layer.rendered) {
                        self.renderMarkers(layer)
                        self.currLayerName = layer.key
                        layer.rendered = true
                    }
                })
            }
        },
        watch: {
            /**
             * 监听图层列表变化
             */
            layerList() {
                // 载入, 删除, drag drop后, 需要从新设置图层的顺序
                this.resetOrders()
                // 载入新图层时, 需要将新图层添加到地图上
                this.renderLayers()
            }
        },
        components: {LayerPanel, MarkerPanel}
    }
</script>