/**
 * Created by ocxers on 2020/07/31.
 */
import Vue from 'vue'

Vue.mixin({
    methods: {
        /**
         * 跳转到指定路径
         * @param _path
         */
        handleGoto(_path) {
            this.$router.push('/' + _path)
        },
        /**
         * 存储数据到localStorage
         * @param key
         * @param val
         */
        setItem(key, val) {
            localStorage.setItem(QUANT_URBAN.prefix + key, val)
        },
        /**
         * 从localStorage取数据
         * @param key
         */
        getItem(key) {
            return localStorage.getItem(QUANT_URBAN.prefix + key)
        },
        /**
         * 将数据从localStorage移除
         * @param key
         */
        removeItem(key) {
            localStorage.removeItem(QUANT_URBAN.prefix + key)
        },
        /**
         * 对象深拷贝
         * @param obj
         */
        clone(obj) {
            return JSON.parse(JSON.stringify(obj))
        },
        /**
         * 添加原生事件
         * @param element 元素
         * @param type    事件类型
         * @param handler callback函数
         */
        addHandler(element, type, handler) {
            if (element) {
                if (element.addEventListener) {
                    element.addEventListener(type, handler, false)
                } else if (element.attachEvent) {
                    element.attachEvent("on" + type, handler)
                } else {
                    element["on" + type] = handler
                }
            }
        },
        /**
         * 去掉字符串首尾空格
         * @param str
         */
        trim(str) {
            if (str) {
                return str.toString().replace(/(^\s*)|(\s*$)/g, "")
            } else {
                return str
            }
        },
        /**
         * 给字符串/数字前面补齐(0)
         * @param n      原始字符串/数字
         * @param width  补齐后的长度
         * @param z      placeholder字符, 默认为0
         */
        pad(n, width, z) {
            z = z || '0'
            n = n + ''
            width = width || 2
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
        }
    }
})
