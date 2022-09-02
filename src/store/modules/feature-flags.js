import { FEATURE_FLAGS } from '@/consts'
import config from '@/config'
import { UnleashClient } from 'unleash-proxy-client'
import * as Sentry from '@sentry/browser'

/**
 * featureFlagRoot is just localhost:3002 locally, but
 * in k8s environments, Ambassador translates /unleash-proxy path
 * to port 3002
 */
function createClient() {
  return new Promise((resolve, reject) => {
    try {
      const unleash = new UnleashClient({
        url: `${config.featureFlagRoot}`,
        appName: config.unleashName,
        environment: config.unleashName,
        refreshInterval: 30,
        clientKey: config.featureFlagClientKey,
        bootstrap: [],
        bootstrapOverride: false
      })
      resolve(unleash)
    } catch (err) {
      reject(`error creating unleash client: ${err}`)
    }
  })
}

/**
 * We hit a race condition in the initUnleash store
 * action below. So we create a global variable here.
 * Then initUnleash calls createClient with await,
 * to make sure that the unleash client exists before
 * we call unleash.on or unleash.start
 */
let unleash

/**
 *
 * This is to ensure reactivity for our feature flags by intercepting
 * unleash's polling response and saving the flags as application state
 *
 * Feature flags that have a default state of `true` and do not need to be toggled
 * again can likely be removed once cleanup of the related feature flag code has taken place.
 *
 */
export default {
  namespaced: true,
  state: {
    flags: {
      [FEATURE_FLAGS.REFER_FRIENDS]: false,
      [FEATURE_FLAGS.DASHBOARD_REDESIGN]: false,
      [FEATURE_FLAGS.DOWNTIME_BANNER]: false,
      [FEATURE_FLAGS.CHATBOT]: false,
      [FEATURE_FLAGS.POSTSESSION_SURVEY]: false,
      [FEATURE_FLAGS.DASHBOARD_BANNER]: false,
    },
  },
  mutations: {
    setFeatureFlags: (state) => {
      Object.keys(FEATURE_FLAGS).forEach(key => {
        state.flags[FEATURE_FLAGS[key]] = unleash.isEnabled(FEATURE_FLAGS[key])
      })
    }
  },
  actions: {
    async initUnleash({ commit }) {
      try {
        unleash = await createClient()
        unleash.on('update', () => {
          commit('setFeatureFlags')
        })
        await unleash.start()
      } catch (err) {
        Sentry.captureException(err)
      }
    },
  },
  getters: {
    isReferFriendsActive: state => state.flags[FEATURE_FLAGS.REFER_FRIENDS],
    isDashboardRedesignActive: state =>
      state.flags[FEATURE_FLAGS.DASHBOARD_REDESIGN],
    isDowntimeBannerActive: state => state.flags[FEATURE_FLAGS.DOWNTIME_BANNER],
    isChatbotActive: state => state.flags[FEATURE_FLAGS.CHATBOT],
    isDashboardBannerActive: state => state.flags[FEATURE_FLAGS.DASHBOARD_BANNER],
    isPostsessionSurveyActive: state => state.flags[FEATURE_FLAGS.POSTSESSION_SURVEY]
  },
}
