/**
 * Created by ocxers on 2020/07/31.
 */

import Vue from "vue"

let bus = new Vue()

Vue.mixin({
    data() {
        return {
            Bus: bus
        }
    }
})