//封装了axios工具类
import axios from 'axios'
import Settings from '@/settings'
import {Message} from 'element-ui'
import {getToken} from '@/utils/auth'
import qs from 'qs'
//axios.defaults.withCredentials = true
// create an axios instance
const service = axios.create({
    baseURL: Settings.server(),
    //timeout: 10000, // request timeout开发debug阶段不要设置
})

// request interceptor
service.interceptors.request.use(
    config => {
        //如果是get请求，且params是数组类型如arr=[1,2]，则转换成arr=1&arr=2
        //springMVC通过 @RequestParam("ids") List<Integer> ids 接受
        if(config.method === 'get')
        {
            config.paramsSerializer = function(params) {
                return qs.stringify(params, {arrayFormat: 'repeat'})
            }
        }
        const token = getToken();
        if (token) {
            config.headers['Authorization']=token;
        }
        return config
    }, 
    error => {
        console.log(error) // for debug
        Promise.reject(error)
    }
)

// respone interceptor
service.interceptors.response.use(
    //拦截回应，根据code判断是返回myResponse.data，还是直接Promise.reject处理了
    response => {
        const myResponse = response.data;
        let code = myResponse.code;
        //20000是正常代码
        if (code !== 20000) 
        {
            //30000是业务错误代码
            if(code === 30000)
            {
                Message({
                    message: myResponse.error || 'Error',
                    type: 'error',
                    duration: 5 * 1000
                  });
            }
            //其他的code还没有处理
            //中断后续处理,直接返回错误
            return Promise.reject(new Error(myResponse.error || 'Error'))
        }
        return myResponse.data;
    },
    error => {
        //服务器内部异常
        if (error.response && error.response.status !== 401) 
        {
            const res = error.response.data
            let message = error.message
            if (res.responseStatus && res.responseStatus.message) 
            {
                message = res.responseStatus.message
            }
            Message({
                message: message,
                type: 'error',
                showClose: true,
                duration: 5 * 1000
            })
        }
        //网络中断
        else
        {
            Message({
                message: "网络异常",
                type: 'error',
                showClose: true,
                duration: 5 * 1000
            })
        }
        return Promise.reject(error)
    })

export default service;