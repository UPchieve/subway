import config from './config'

// really great csp docs: https://content-security-policy.com/
// helmet docs: https://helmetjs.github.io/

// script sources
const googleUrls = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
]
const cdnUrl = 'https://cdn.upchieve.org'
const mathJaxScriptUrl = 'https://cdnjs.cloudflare.com'
const newrelicUrls = [
  'https://js-agent.newrelic.com',
  'https://bam.nr-data.net',
]
const gleapScriptUrl = 'https://widget.gleap.io'

// connect sources
const posthogUrl = 'https://p.upchieve.org'
const unleashUrl = 'https://gitlab.com'
const sentryUrl = 'https://*.ingest.sentry.io'
const mathJaxFetchUrl = 'https://api.cdnjs.com'
const gleapConnectUrls = [
  'https://uptime.gleap.io',
  'https://api.gleap.io',
  gleapScriptUrl,
]

// img srcs
const s3PhotoConnectUrls = [
  `${config.awsS3.photoIdBucket}.s3.us-east-2.amazonaws.com`,
  `${config.awsS3.sessionPhotoBucket}.s3.us-east-2.amazonaws.com`,
]

const s3PhotoImageUrls = [
  `${config.awsS3.photoIdBucket}.s3.amazonaws.com`,
  `${config.awsS3.photoIdBucket}.s3.us-east-2.amazonaws.com`,
  `${config.awsS3.sessionPhotoBucket}.s3.amazonaws.com`,
  `${config.awsS3.sessionPhotoBucket}.s3.us-east-2.amazonaws.com`,
]

const adminEduUrls = [
  'https://code.jquery.com',
  'https://stackpath.bootstrapcdn.com',
  'https://cdn.jsdelivr.net',
]

// default srcs
const vimeoUrl = 'https://player.vimeo.com'
const googleDocsUrl = 'https://docs.google.com'
const trainingMaterialsS3 =
  'https://upc-training-materials.s3.us-east-2.amazonaws.com'

export const scriptSrc = [
  "'self'",
  `https://${config.host}`,
  ...googleUrls,
  cdnUrl,
  mathJaxScriptUrl,
  posthogUrl,
  ...newrelicUrls,
  ...adminEduUrls,
  gleapScriptUrl,
  "'unsafe-eval'",
  "'unsafe-inline'",
  'blob:',
]

export const imgSrc = [
  "'self'",
  ...googleUrls,
  ...s3PhotoImageUrls,
  cdnUrl,
  'data:',
  'blob:',
  `https://${config.host}`,
]

export const connectSrc = [
  "'self'",
  posthogUrl,
  unleashUrl,
  sentryUrl,
  mathJaxFetchUrl,
  ...s3PhotoConnectUrls,
  ...newrelicUrls,
  ...googleUrls,
  ...gleapConnectUrls,
  config.vueAppUnleashUrl,
  `wss://${config.host}`,
  `https://${config.host}`,
]

if (config.NODE_ENV !== 'production') {
  connectSrc.push('http://localhost:3000')
  connectSrc.push('http://localhost:3001')
  connectSrc.push('ws://localhost:3001')
  connectSrc.push('http://localhost:3002')
}

export const defaultSrc = [
  "'self'",
  `https://${config.host}`,
  "'unsafe-inline'",
  vimeoUrl,
  googleDocsUrl,
  trainingMaterialsS3,
]

// the rest are defaults
export const baseUri = ["'self'"]
export const blockAllMixedContent: string[] = []
export const fontSrc = ["'self'", 'https:', 'data:']
export const frameAncestors = ["'self'", 'http://localhost']
export const objectSrc = ["'none'"]
export const scriptSrcAttr = ["'none'"]
export const styleSrc = ["'self'", 'https:', "'unsafe-inline'"]
export let upgradeInsecureRequests: string[] | null
if (config.NODE_ENV === 'production') {
  upgradeInsecureRequests = []
} else {
  upgradeInsecureRequests = null
}
