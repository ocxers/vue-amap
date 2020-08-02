import Vue from 'vue'

import './configs/system.config'

// // Moment
// import moment from 'moment'
// window.moment = moment

// import echarts from 'echarts'
// window.echarts = echarts

// import elementui
import ElementUI from 'element-ui'
import "element-ui/lib/theme-chalk/index.css"
import 'element-ui/lib/theme-chalk/display.css'

// Vue router
import routerConfig from './routers/routers'
import store from './stores/store'
import {sync} from 'vuex-router-sync'

sync(store, routerConfig)

// Vue filter
import './filters/vue.filters'

// Vue directive
import './directives/vue.directives'

// mixin
import './mixins/mixin.data'
import './mixins/mixin.methods'
import './mixins/mixin.components'

import './ajax/sandBox'

// // Lodash
// import _ from 'lodash'
// window._ = _

// import $ from "./plugins/jquery-3.3.1.min"
// window.$ = $

Vue.use(ElementUI)

import VueAMap from 'vue-amap'

Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
    key: "7f830faede215411ee860f614568ec3e",
    plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor'],   //插件
    v: "1.4.4"  //版本号，默认高德sdk版本为1.4.4，可自行修改
})

import App from './App.vue'

let vue = new Vue({
    el: '#app',
    router: routerConfig,
    store,
    created() {
        sandBox._vue = this
    },
    render: h => h(App)
})
