import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import uv from './modules/uv'
import dept from './modules/dept'
import ifc from './modules/ifc'
import dir from './modules/dir'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    uv,
    dept,
    ifc,
    dir
  },
  getters
})

export default store
