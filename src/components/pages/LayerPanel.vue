<style src="~/styles/layer.scss"
       lang="sass"></style>
<template>
    <div class="layer-container" :class="{collapse: collapses}">
        <div class="layer layer-add">
            <header>
                <h3>图层管理</h3>
                <el-tooltip class="item" effect="dark" content="点击添加图层" placement="bottom"><span><i
                        class="el-icon-circle-plus-outline"><input v-if="renderFileInput" type="file"
                                                                   accept="application/json"
                                                                   class="choose-file"
                                                                   @change="readGEOJSON" name="files"/></i></span>
                </el-tooltip>
                <span><i class="el-icon-caret-bottom" @click="handleCollapse('layers')"></i></span></header>
            <div class="layer-content">
                <ul v-if="layerList.length" @dragover.stop.prevent>
                    <li v-for="layer in layerList"
                        :key="layer.key"
                        :layer-key="layer.key"
                        @mouseover="handleMouseOverLayer(layer)"
                        @mouseout="handleMouseOutLayer(layer)"
                        draggable
                        @dragstart="handleDragStart(layer)"
                        @drop="handleDrop">
                        <span :layer-key="layer.key">{{layer.name}}</span>
                        <i class="el-icon-view"
                           :class="{'icon-hide': !layer.visible}"
                           @click="toggleLayer(layer)"></i>
                        <div class="delete">
                            <el-popconfirm title="确定要删除该图层吗?"
                                           @onConfirm="handleDeleteLayer(layer)"
                            ><i class="el-icon-delete"
                                slot="reference"></i></el-popconfirm>
                        </div>
                    </li>
                </ul>
                <span v-else class="nothing">没有图层!</span>
            </div>
        </div>
        <div class="layer layer-add-collapse">
            <div class="collapse-icon"
                 @click="handleCollapse('layers')">
                <el-tooltip class="item"
                            effect="dark"
                            content="展开面板">
                    <el-badge :value="layerList.length"
                              class="item"
                              :hidden="!layerList.length"><i
                            class="el-icon-files"></i>
                    </el-badge>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                renderFileInput: true,      // 判断是否渲染input file元素, 通过控制该参数的true/false, 每次上传文件后, 重新渲染input元素
                collapses: false,           // 舒服折叠面板
                dragDrop: {                 // 拖拽
                    from: null,             // 被拖拽图层
                    to: null                // 目标图层
                },
                layers: {},                 // 所有载入图层的集合, 转化为key, value的object方式, 方便检索, 初始值为父组件传入
                layerList: []               // 所有载入图层的列表, Array, 包含原始数据和格式化后的数据, 初始值为父组件传入
            }
        },
        props: ['layerObj', 'layerItems'],
        methods: {
            /**
             * 拖拽: 开始拖动图层
             * @param layer
             */
            handleDragStart(layer) {
                this.dragDrop.from = layer
            },
            /**
             * 拖拽: 释放图层
             * @param event
             */
            handleDrop(event) {
                let layer_key = event.target.getAttribute('layer-key')
                if (layer_key && layer_key !== this.dragDrop.from.key) {
                    let idx = -1
                    this.layerList.map((layer, index) => {
                        if (layer.key.toString() === layer_key) {
                            idx = index
                            // 通过layer-key来找到目标图层
                            this.dragDrop.to = layer
                        }
                    })

                    if (idx !== -1) {
                        this.layerList.splice(this.dragDrop.from.order, 1)
                        this.layerList.splice(this.dragDrop.to.order, 0, this.dragDrop.from)

                        // drop后, 清除选中的markers
                        this.clearSelect()

                        // 重置拖拽对象
                        this.dragDrop = {
                            from: null,
                            to: null
                        }

                        // 拖拽完成后, 刷新图层列表
                        this.$emit('refreshLayer', this.layerList)
                    }
                }
            },
            /**
             * 清除框选的选取状态
             */
            clearSelect() {
                this.$emit('clearSelect')
            },
            /**
             * 折叠/展开面板
             */
            handleCollapse() {
                this.collapses = !this.collapses
            },
            /**
             * 向父组件emit鼠标mouseover在左边的`图层管理`的图层列表上事件
             * @param layer
             */
            handleMouseOverLayer(layer) {
                this.$emit('mouseOverLayer', layer)
            },
            /**
             * 向父组件emit鼠标离开左边的`图层管理`的图层列表事件
             * @param layer
             */
            handleMouseOutLayer(layer) {
                this.$emit('mouseOutLayer', layer)
            },
            /**
             * 判断新载入的文件是否已经存在, 如果已经存在, 则提醒用户
             * @param newGEOJSON
             */
            checkExists(newGEOJSON) {
                let exists = false
                this.layerList.map(layer => {
                    if (JSON.stringify(layer.geoJSON) === JSON.stringify(newGEOJSON)) {
                        // 该文件已经存在
                        exists = true
                    }
                })

                return exists
            },
            /**
             * 从本地载入.geojson文件
             * @param event
             */
            readGEOJSON(event) {
                let self = this
                let file = event.target.files[0]
                let reader = new FileReader()

                self.renderFileInput = false

                reader.onload = (() => {
                    return function (e) {
                        let geoJSON = JSON.parse(e.target.result)
                        if (!self.checkExists(geoJSON)) {
                            self.layerList.unshift({
                                key: Date.now(),
                                name: '图层' + file.name.split('.')[0],       // 图层名称
                                markers: geoJSON.features.map(feature => {   // 格式载入的数据
                                    return {
                                        lnglat: feature.geometry.coordinates,
                                        name: feature.properties.name
                                    }
                                }),
                                rendered: false,    // 标记该图层是否已经添加过
                                visible: true,      // 标记该图层是否显示
                                order: 0,           // 该图层在`图层管理`面板中列表的序号
                                geoJSON: geoJSON    // 载入的原始数据
                            })
                            self.$notify.success({
                                title: '成功',
                                message: '成功添加图层到地图上!',
                                position: 'bottom-right'
                            })
                        } else {
                            self.$notify.error({
                                title: '错误',
                                message: '该文件已上传过了!',
                                position: 'bottom-right'
                            })
                        }

                        self.clearSelect()
                        setTimeout(() => {
                            self.renderFileInput = true
                        }, 100)
                    }
                })(file)

                // 读取文件为text格式.
                reader.readAsText(file)
            },
            /**
             * 向父组件emit`删除一个指定的图层`事件
             * @param layer
             */
            handleDeleteLayer(layer) {
                this.$emit('deleteLayer', layer)
            },
            /**
             * 切换图层在地图上显示/隐藏
             * @param layer
             */
            toggleLayer(layer) {
                layer.visible = !layer.visible
                if (this.layers[layer.key].visible) {
                    this.layers[layer.key].visible = false
                    this.layers[layer.key].layer.hide()
                } else {
                    this.layers[layer.key].visible = true
                    this.layers[layer.key].layer.show()
                }
            }
        },
        created() {
            // 初始化
            this.layers = this.layerObj
            this.layerList = this.layerItems
        },
        watch: {
            /**
             * 监听父组件的layerObj是否发生变化, 如果变化, 就将新的值赋给layers
             */
            layerObj() {
                this.layers = this.layerObj
            },
            /**
             * 监听父组件的layerItems是否发生变化, 如果变化, 就将新值赋给layerItems
             */
            layerItems() {
                this.layerList = this.layerItems
            }
        }
    }
</script>