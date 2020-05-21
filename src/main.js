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



// set ElementUI lang to EN
//Vue.use(ElementUI)
Vue.use(ElementUI, { size: 'small'});

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
