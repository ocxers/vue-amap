/**
 * Created by ocxers on 2020/07/31.
 */

import Vue from "vue"

let filters = {
    /**
     * 格式化数字, 从个位往前, 每三位前面加`,`. eg: 123456789.01 -> 123,456,789.01
     * @param value
     */
    formatNumber(value) {
        let val = (value / 1)
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    /**
     * 格式化日期
     * @param val
     */
    formatDate(val) {
        return moment(val).format('YYYY-MM-DD')
    },
    /**
     * 格式化货币/数字, 保留两位小数, 没有小数后面补`0`
     * @param val
     */
    formatMoney(val) {
        val = val || 0
        let _val = (val / 100 + '').split('.')
        _val[1] = _val[1] ? (_val[1] + '00'.substring(2 - _val[1].length)) : '00'
        return _val.join('.')
    }
}

// 注册Filters
Object.keys(filters).forEach(function (filterName) {
    Vue.filter(filterName, filters[filterName])
})
