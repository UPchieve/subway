const { createApp } = require('@unleash/proxy')
import { initialize } from 'unleash-client'
import config from '../config'

/**
 * This creates a proxy server that the frontend can hit.
 * We were hitting rate limit issues from all of our users' browsers
 * hitting our Gitlab Unleash service, so we now cache flags on our server
 * and serve up the requests from there. The token is only for the paid
 * Unleash service, which we don't use, but it's a required parameter.
 */
export const unleashProxy = createApp({
  unleashUrl: config.unleashUrl,
  unleashInstanceId: config.unleashId,
  environment: config.unleashName,
  unleashAppName: config.unleashName,
  logLevel: 'debug',
  refreshInterval: 1000,
  unleashApiToken: 'notused',
  clientKeys: [config.featureFlagClientKey],
  port: config.featureFlagPort,
})

/**
 * This is the server itself (and the worker) reaching out to
 * the Gitlab Unleash instance. It only reaches out 1/s, so we're only
 * hitting Gitlab 1/s for as many web/worker instances we have.
 * We could theoretically hit the proxy above using the proxy client
 * in the node server (essentially reaching out to itself as a middle step)
 * but that felt like overengineering.
 */
export const initializeUnleash = (): void => {
  if (config.unleashId)
    initialize({
      url: config.unleashUrl,
      appName: config.unleashName,
      environment: config.unleashName,
      instanceId: config.unleashId,
      refreshInterval: 1000,
    })
}
