/**
 * Created by ocxers on 2020/07/31.
 */
import Vue from 'vue'
import Router from 'vue-router'

import Index from '~/components/Index.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [{
        path: '/',
        name: '量城科技',
        component: Index
    }]
    .concat([{path: '*', name: '量城科技', component: Index}])
})