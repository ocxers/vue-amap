/**
 * Created by ocxers on 2020/07/31.
 */

(function (quantUrban) {
    quantUrban.menuManage = {

    }

    quantUrban.dev = location.href.indexOf('127.0.0.1:8903') > -1 || location.href.indexOf('localhost:8903')

    // 全局前缀, 主要用于给localStorage已经其它需要使用的地方
    quantUrban.prefix = 'QUANT_URBAN_COM_'

    if (quantUrban.dev) {
        quantUrban.APIHost = ''
    } else {
        quantUrban.APIHost = ''
    }
})(window.QUANT_URBAN = window.QUANT_URBAN || {})

export default {
    post: QUANT_URBAN.APIHost,
    get: QUANT_URBAN.APIHost
}