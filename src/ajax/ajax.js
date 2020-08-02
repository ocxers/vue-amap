/**
 * Created by ocxers on 2020/07/31.
 */

// Ajax
import axios from "axios"
import sysConfig from "../configs/system.config"

let count = 0
axios.interceptors.request.use(function (config) {
    if (config.no_indicator) {
        
    } else {
        if (config.loading) {
            sandBox._vue.Bus.$emit('onLoading')
        }
    }
    
    if (config.loading) {
        count++
    }
    return config
})

axios.interceptors.response.use(res => {
    if (res.config.loading) {
        if (--count <= 0) {
            sandBox._vue.Bus.$emit('onLoaded')
        }
    }
    return res
}, err => {
    if (err.config.loading) {
        if (--count <= 0) {
            sandBox._vue.Bus.$emit('onLoaded')
        }
    }
    return err
})

const CancelToken = axios.CancelToken
let cancel;

(function () {
    window.sandBox = {
        _vue: null,
        postHost: sysConfig.post,
        getHost: sysConfig.get,
        host: sysConfig.get,
        get(obj, doNotLoading) {
            let that = this._vue
            let self = this
            axios.defaults.loading = !obj.doNotLoading
            
            return new Promise((resolve, reject) => {
                let _api = obj.api ? (self.getHost + obj.api) : obj.fullapi
                
                axios.get(_api, {
                    params: obj.params,
                    cancelToken: new CancelToken(function executor(c) {
                        if (obj.api === 'autocomplete') {
                            cancel = c
                        } else {
                            cancel = undefined
                        }
                    })
                }).then((response) => {
                    if (response.status !== 200) {
                        that.errMsg(that);
                        reject({
                            code: response.status,
                            message: response.data
                        })
                    } else {
                        let _data = response.data
                        if (_data.code !== 0) {
                            reject(_data)
                        } else {
                            resolve(_data, _data.totalcount)
                        }
                    }
                }, err => {
                    reject({
                        code: -100,
                        message: err.response.data
                    })
                }).catch(error => {
                    if (error && error.response && error.response.status === 401) {
                        that.Bus.$emit('onLoginFail', false)
                    } else {
                        obj.error && obj.error(error)
                    }
                    reject({
                        code: -100,
                        message: error
                    })
                    
                    if (!obj.doNotLoading) {
                        --count
                    }
                })
            })
        },
        post(obj, doNotLoading) {
            let that = this._vue;
            let self = this
            
            axios.defaults.loading = !obj.doNotLoading

            return new Promise((resolve, reject) => {
                let _api = obj.api ? (self.postHost + obj.api) : obj.fullapi
                
                axios.post(_api, obj.params).then(response => {
                    if (response.status !== 200) {
                        reject({
                            code: response.response.status,
                            message: response.response.data
                        })
                    } else {
                        let _data = response.data
                        if (_data.code !== 0) {
                            reject(_data)
                        } else {
                            resolve(_data)
                        }
                    }
                }, err => {
                    reject({
                        code: -100,
                        message: err.response.data
                    })
                }).catch(error => {
                    if (error && error.response && error.response.status === 401) {
                        that.Bus.$emit('onLoginFail', false);
                        reject({
                            code: -100,
                            message: error.response.data
                        })
                    } else if (error && error.response && error.response.data) {
                        reject({
                            code: -100,
                            message: error.response.data
                        })
                    } else {
                        reject({
                            code: -100,
                            message: error
                        })
                    }
                    
                    if (!obj.doNotLoading) {
                        --count
                    }
                })
            })
        },
        put() {},
        delete() {}
    }
}())