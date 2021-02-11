import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import VueRouter from 'vue-router'
import VueHeadful from 'vue-headful'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'
import vSelect from 'vue-select'
import VueStarRating from 'vue-star-rating'
import ToggleButton from 'vue-js-toggle-button'
import Socket from 'queued-socket.io'
import moment from 'moment'
import App from './components/App'
import PortalService from './services/PortalService'
import router from './router'
import store from './store'
import config from './config'
import posthog from 'posthog-js'
import { initialize } from 'unleash-client'

if (config.posthogToken) {
  posthog.init(`${config.posthogToken}`, {
    api_host: 'https://app.posthog.com'
  })
}

if (config.devtools) {
  Vue.config.devtools = true
}

if (config.unleashId) {
  initialize({
    url: config.unleashUrl,
    appName: config.unleashName,
    instanceId: config.unleashId
  })
}

// Prevent production tip on startup
Vue.config.productionTip = false

// Set up SocketIO
const socket = Socket.connect(config.socketAddress, {
  autoConnect: false
})
Vue.use(VueSocketIO, socket)

Vue.prototype.$queuedSocket = Socket

// Set up Vue Router
Vue.use(VueRouter)

// Set up PortalGun (connection to native app)
PortalService.listen()

const handlePortalData = data => {
  // TODO: don't route immediately if push is received while app is open.
  // can detect with `if (data._isPush && data._original?.additionalData?.foreground)`
  // and show own UI for notification
  if (data && data.path) {
    router.push(data.path)
  }
}

// Has data when app is opened w/ cold start from push notification
PortalService.call('top.getData').then(handlePortalData)

// Called any time app is running (warm start) & push notification is received
PortalService.call('top.onData', handlePortalData)

// Set up Sentry error tracking
Sentry.init({
  // Our Sentry project is configured to only accept calls from app.upchieve.org
  dsn: 'https://0300061759f44def9726bcd3c0ed5611@sentry.io/1819161',
  integrations: [
    new Integrations.Vue({ Vue, attachProps: true, logErrors: true })
  ],
  environment: process.env.NODE_ENV
})

// Set up vue-headful
Vue.component('vue-headful', VueHeadful)

// Set up vue-select
Vue.component('v-select', vSelect)

// Set up vue-star-rating
Vue.component('vue-star-rating', VueStarRating)

// Set up vue-js-toggle-button
Vue.use(ToggleButton)

// Filter for formatting times
Vue.filter('formatTime', value => {
  if (value) {
    return moment(value).format('h:mm a')
  }
})

// Create Vue instance
const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// allow e2e tests to see Vuex store
if (window.Cypress) {
  window.app = app
}
