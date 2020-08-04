import Vue from 'vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/icons' // svg icon
import 'video.js/dist/video-js.css' //vedio.js css

import '@/styles/index.scss' // global css
import '@/assets/css/globe.css'

import App from './App'
import store from './store'
import router from './router'



Vue.use(ElementUI, { size: 'small'});
//百度地图
import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap, {
    // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
    ak: 'kbYcYGzqdUtmRZ1eTwxf8SfXssmI7CYG'
});

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
