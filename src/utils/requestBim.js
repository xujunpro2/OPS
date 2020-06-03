//封装了axios工具类
import axios from 'axios'
import {Message} from 'element-ui'
import store from '@/store'

//axios.defaults.withCredentials = true
// create an axios instance
const bimAxios = axios.create({
    baseURL: store.state.uv.bimServer
    //timeout: 5000 // request timeout
})

// request interceptor
bimAxios.interceptors.request.use(
    //访问bim服务器增加token，访问网络爬虫攻击
    config => {
        config.headers['Authorization']='bimi';
        return config
    }, 
    error => {
        console.log(error) // for debug
        Promise.reject(error)
    }
)

// respone interceptor
bimAxios.interceptors.response.use(
   
    //拦截回应，根据code判断是返回myResponse.data，还是直接Promise.reject处理了
    response => {
        const jsonData = response.data;
        return jsonData;
    },
    error => {
        return Promise.reject(error)
    })

export default bimAxios;