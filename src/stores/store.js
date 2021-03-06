import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        count: 0,
        menuInfo: {}
    },
    mutations: {
        increment(state) {
            state.count++
        },
        setMenuInfo(state, menuInfo) {
            state.menuInfo = menuInfo || {}
        }
    }
})
