import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config'
import appModule from './modules/app'
import productFlagsModule from './modules/product-flags'
import userModule from './modules/user'

Vue.use(Vuex)

// Vue devtools need to be set before initializing store and router
if (config.devtools) {
  Vue.config.devtools = true
}

export const storeOptions = {
  modules: {
    app: appModule,
    user: userModule,
    productFlags: productFlagsModule
  }
}

export default new Vuex.Store(storeOptions)
