// Server configuration

import { Static } from 'runtypes'
import { Config } from './config-type'
import { stringToBoolean } from './utils/string-to-boolean'

let redisConnectionString: string
const redisHost = process.env.SUBWAY_REDIS_HOST || 'localhost'
const redisPort = process.env.SUBWAY_REDIS_PORT || '6379'
const redisPassword = process.env.SUBWAY_REDIS_PASSWORD || 'bogus'
if (process.env.SUBWAY_REDIS_USE_TLS === 'true') {
  redisConnectionString = `rediss://:${redisPassword}@${redisHost}:${redisPort}`
} else {
  redisConnectionString = `redis://${redisHost}:${redisPort}`
}

const bannedServiceProviderList =
  process.env.SUBWAY_BANNED_SERVICE_PROVIDERS || 'Example'
const bannedServiceProviders = bannedServiceProviderList.split(',')

const config: Static<typeof Config> = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  SSL_CERT_PATH: '',
  // set host to your public IP address to test Twilio voice calling
  host: process.env.SUBWAY_SERVER_HOST || 'localhost:8080',
  protocol: process.env.SUBWAY_SERVER_PROTOCOL || 'http',
  additionalAllowedOrigins: process.env.SUBWAY_ADDITIONAL_ALLOWED_ORIGINS || '',
  sessionSecret: process.env.SUBWAY_SESSION_SECRET || 'secret',
  sessionCookieMaxAge: parseInt(
    process.env.SUBWAY_SESSION_COOKIE_MAX_AGE || '5184000000'
  ),
  saltRounds: 10,
  smtp: {
    host: process.env.SUBWAY_SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SUBWAY_SMTP_PORT || '2525'),
    secure: (process.env.SUBWAY_SMTP_SECURE as unknown as boolean) || false,
    user: process.env.SUBWAY_SMTP_USER || '',
    password: process.env.SUBWAY_SMTP_PASSWORD || '',
  },
  sendgrid: {
    apiKey: process.env.SUBWAY_SENDGRID_API_KEY || '',
    contactTemplate: 'd-e79546f380874c58965c163f45df2ef4',
    verifyTemplate: 'd-02281875a1cf4575bd3568e674faf147',
    resetTemplate: 'd-5005d2beb2ad49a883a10364f3e14b81',
    referralProgramTemplate: 'd-7e49e80e04cc4d7fb222f383498840a4',
    openVolunteerWelcomeTemplate: 'd-0e4406696376446da0d580b9c7e9a95a',
    partnerVolunteerWelcomeTemplate: 'd-eac2fdfaa8d740c8965ba8011102986b',
    studentOnboardingWelcomeTemplate: 'd-dba390e0c99545d4b18135d869046f50',
    studentParentGuardianCreatedAccountTemplate:
      'd-8ca50eab29de43bf9703c9f48c7c0736',
    teacherOnboardingWelcomeTemplate: 'd-6a83757fc00547b09b7d75ffde103bfd',
    reportedSessionAlertTemplate: 'd-fe338f96339445279c3fa6580fabc286',
    referenceFormTemplate: 'd-122f9c9953144e62b1f66411b8e85723',
    referenceFormApologyTemplate: 'd-c58366cf25364feb8ac734da60fa298c',
    approvedNotOnboardedTemplate: 'd-2c7a974fc7084a9eaaa152f3498cc99d',
    openReadyToCoachTemplate: 'd-09ec01c51be54c108b7fae4481acfd38',
    partnerReadyToCoachTemplate: 'd-d2ba9920683b4bd4a159f496a2346583',
    customPartnerReadyToCoachTemplate: 'd-af9b19d3eef745b69709df7bf0c410c9',
    becomeAnAmbassadorTemplate: 'd-07e10d541a0c434dbbee2f704bac12ab',
    referralSignUpCelebrationTemplate: 'd-68f54c0fb96548bf9384239b531be309',
    bannedUserAlertTemplate: 'd-7be8a21a59664f99a1f540e43c79b793',
    referenceFollowupTemplate: 'd-6b0d96c0cf15469db7a5e6ec655cf37a',
    rejectedPhotoSubmissionTemplate: 'd-c6d146a9eb4e44f6acc94a29a131d50d',
    rejectedReferenceTemplate: 'd-9afea0862a264bbb93ed6a2c074fd6b4',
    waitingOnReferencesTemplate: 'd-65bf8204d28746f58ad28a4aa92407c7',
    niceToMeetYouTemplate: 'd-8afee528e5184d8797c50c109d6b631b',
    weeklyHourSummaryEmailTemplate: 'd-19a5fbe8656249d2822c8bde1c2ab086',
    weeklyHourSummaryIntroEmailTemplate: 'd-4d8394e4da3847eabdfd23f257f7a8d3',
    customWeeklyHourSummaryEmailTemplate: 'd-c07f4bcfed5f4acbba8038edb353866d',
    customWeeklyHourSummaryIntroEmailTemplate:
      'd-ada36745cc724549833b867f514435a6',
    weeklyHourSummaryApologyEmailTemplate: 'd-7def05ac77ad48269cb11f050dca4dc2',
    onboardingReminderOneTemplate: 'd-9af291b6d0e94f7ebf0133be2c7176e3',
    onboardingReminderTwoTemplate: 'd-23681dc2dc0647e0bd7a57a6f328e00b',
    onboardingReminderThreeTemplate: 'd-d7ff9f33620842508de0030c84da9425',
    studentOnboardingHowItWorksTemplate: 'd-53b05a9788d044dab4c3e0f5e8a2250b',
    rosterStudentSetPasswordTemplate: 'd-27b14fda99e04505b1540e18c58ae09b',
    meetOurVolunteersTemplate: 'd-799e0195f78d4732a5adc36216a488f7',
    studentOnboardingMissionTemplate: 'd-3167ea240a27471597d849cbae4b8437',
    studentOnboardingSurveyTemplate: 'd-c5671abc76884180b6912729190b7078',
    studentFirstSessionCongratsTemplate: 'd-8c54307ace4a498f800185f0e540b8ea',
    studentReportedRudeTemplate: 'd-aa16bc7d750144f8b42d3db0bec051ca',
    studentReportedSafetyTemplate: 'd-c7caf6b302b94a08862652dcde06535f',
    studentAbsentWarningTemplate: 'd-f27a47f3875a4dfd9f07446219ecacfc',
    studentAbsentVolunteerApologyTemplate: 'd-2e648990eaca4b5e986a5486d8fea338',
    studentUnmatchedApologyTemplate: 'd-73756dd129344032bc4ca5d1055e1b7b',
    studentOnlyLookingForAnswersTemplate: 'd-d78c20e2cfbe41968e458a93a6d5c7ac',
    volunteerQuickTipsTemplate: 'd-b85620ef95b443878a6aeca1e99c94ef',
    partnerVolunteerLowHoursSelectedTemplate:
      'd-476522cdd78e4c4ebc2af51a2086a640',
    volunteerFirstSessionCongratsTemplate: 'd-ebd561df99a7497d9401cec3f54ef23a',
    volunteerTenSessionMilestoneTemplate: 'd-0447cf80536a430881262f8f92044b73',
    volunteerGentleWarningTemplate: 'd-5f7366fbde7841beb757b8694afdc6a4',
    volunteerInactiveThirtyDaysTemplate: 'd-e2c9917e22c24d72a187ff00a5eff5e9',
    volunteerInactiveSixtyDaysTemplate: 'd-659b7e8d08754ef58d9b6e594f748e19',
    volunteerInactiveNinetyDaysTemplate: 'd-1bb491dbb4a044f5a4cd9cd926eacf38',
    volunteerInactiveBlackoutOverTemplate: 'd-132c110bcf16492b9efbbfbeb5a375e5',
    volunteerAbsentWarningTemplate: 'd-7458c9322ae747c78b90bd93e27b9269',
    volunteerAbsentStudentApologyTemplate: 'd-e45797aba9d04bb29a9745988a52fc1f',
    failedFirstAttemptedQuizTemplate: 'd-447e43ee9746482ca308e05069ba2e00',
    failedFirstAttemptedTrainingTemplate: 'd-5bf050b4faed477fb84c11557532027f',
    emailSessionRecapMessage: 'd-68bab541136540928e640c06b1cbba16',
    favoritingEmail: 'd-14d04d49145448019283306e473bbf13',
    studentReportedCoachDmTemplate: 'd-eb1e40492ed04d37add0d3bc124152ef',
    fallIncentiveEnrollmentWelcomeTemplate:
      'd-914f98ad37c3461eaacc1c2bf27f097d',
    fallIncentiveInvitedToEnrollReminderTemplate:
      'd-ea8dadbc26f64da6bcdf7932049211d4',
    fallIncentiveLeavingMoneyOnTableTemplate:
      'd-77780e77be46490d963f5ccefe1431bc',
    qualifiedForGiftCardTemplate: 'd-4a5f5e272e3d49e5abf074af32c99813',
    stillTimeForQualifyingSessionTemplate: 'd-61b7eff0a57f4a69a0e11b63c4d15fbe',
    fallIncentiveCompletedChallengeTemplate:
      'd-e7e5b09cc1444128aceaa6807981c595',
    unsubscribeGroup: {
      newsletter: 12567,
      account: 12570,
      volunteerSummary: 14543,
      incentiveProgram: 26444,
    },
    contactList: {
      students:
        process.env.SUBWAY_STUDENT_CONTACT_LIST ||
        '1111111a-111b-111c-111d-11111111111e',
      volunteers:
        process.env.SUBWAY_VOLUNTEER_CONTACT_LIST ||
        '1111111a-111b-111c-111d-11111111111e',
      teachers:
        process.env.SUBWAY_TEACHER_CONTACT_LIST ||
        '1111111a-111b-111c-111d-11111111111e',
    },
  },
  logLevel: process.env.SUBWAY_LOG_LEVEL || 'debug',
  mail: {
    senders: {
      noreply: process.env.SUBWAY_NOREPLY_EMAIL_SENDER || 'example@example.org',
      support: process.env.SUBWAY_SUPPORT_EMAIL_SENDER || 'example@example.org',
      recruitment:
        process.env.SUBWAY_RECRUITMENT_EMAIL_SENDER || 'example@example.org',
      students:
        process.env.SUBWAY_STUDENTS_EMAIL_SENDER || 'example@example.org',
      volunteerManager:
        process.env.SUBWAY_VOLUNTEER_MANAGER_EMAIL_SENDER ||
        'example@example.org',
      studentOutreachManager:
        process.env.SUBWAY_STUDENT_OUTREACH_MANAGER_EMAIL_SENDER ||
        'example@example.org',
      corporatePartnershipsManager:
        process.env.SUBWAY_CORPORATE_PARTNERSHIPS_MANAGER_EMAIL_SENDER ||
        'example@example.org',
      crisis: process.env.SUBWAY_CRISIS_EMAIL_SENDER || 'example@example.org',
      programsManager:
        process.env.SUBWAY_PROGRAMS_MANAGER_EMAIL_SENDER ||
        'example@example.org',
      supportApp:
        process.env.SUBWAY_SUPPORT_APP_EMAIL_SENDER || 'example@exampleapp.org',
      incentive: process.env.SUBWAY_INCENTIVE_SENDER || 'example@example.org',
    },
    receivers: {
      contact:
        process.env.SUBWAY_CONTACT_EMAIL_RECEIVER || 'example@example.org',
      staff: process.env.SUBWAY_STAFF_EMAIL_RECEIVER || 'example@example.org',
      support:
        process.env.SUBWAY_SUPPORT_EMAIL_RECEIVER || 'example@example.org',
      recruitment:
        process.env.SUBWAY_RECRUITMENT_EMAIL_RECEIVER || 'example@example.org',
      students:
        process.env.SUBWAY_STUDENTS_EMAIL_RECEIVER || 'example@example.org',
      volunteerManager:
        process.env.SUBWAY_VOLUNTEER_MANAGER_EMAIL_RECEIVER ||
        'example@example.org',
      studentOutreachManager:
        process.env.SUBWAY_STUDENT_OUTREACH_MANAGER_EMAIL_RECEIVER ||
        'example@example.org',
      corporatePartnershipsManager:
        process.env.SUBWAY_CORPORATE_PARTNERSHIPS_MANAGER_EMAIL_RECEIVER ||
        'example@example.org',
    },
    people: {
      volunteerManager: {
        firstName: process.env.SUBWAY_VOLUNTEER_MANAGER_FIRST_NAME || '',
        lastName: process.env.SUBWAY_VOLUNTEER_MANAGER_LAST_NAME || '',
      },
      studentOutreachManager: {
        firstName: process.env.SUBWAY_STUDENT_OUTREACH_MANAGER_FIRST_NAME || '',
        lastName: process.env.SUBWAY_STUDENT_OUTREACH_MANAGER_LAST_NAME || '',
      },
      corporatePartnershipsManager: {
        firstName:
          process.env.SUBWAY_CORPORATE_PARTNERSHIPS_MANAGER_FIRST_NAME || '',
        lastName:
          process.env.SUBWAY_CORPORATE_PARTNERSHIPS_MANAGER_LAST_NAME || '',
      },
      programsManager:
        process.env.SUBWAY_PROGRAMS_MANAGER_EMAIL_SENDER_NAME || '',
      incentiveOutreach: process.env.SUBWAY_INCENTIVE_OUTREACH_NAME || '',
    },
  },
  client: {
    host: process.env.SUBWAY_CLIENT_HOST || 'localhost:8080',
  },
  apiPort: Number(process.env.SUBWAY_API_PORT) || 3000,
  socketsPort: Number(process.env.SUBWAY_SOCKETS_PORT) || 3000,

  socketApiKey: process.env.SUBWAY_SOCKET_API_KEY || 'bogus',

  socketIOAdminUsername: process.env.SUBWAY_SOCKET_IO_ADMIN_USERNAME || 'bogus',

  socketIOAdminPassword: process.env.SUBWAY_SOCKET_IO_ADMIN_PASSWORD || 'bogus',

  socketIOAdminUIMode:
    process.env.SUBWAY_SOCKET_IO_ADMIN_UI_MODE || 'production',

  socketIOAdminUIReadOnly: stringToBoolean(
    process.env.SUBWAY_SOCKET_IO_ADMIN_UI_READONLY || 'true'
  ),

  customVolunteerPartnerOrgs: (
    process.env.SUBWAY_CUSTOM_VOLUNTEER_PARTNER_ORGS || 'big-telecom'
  ).split(','),
  priorityMatchingPartnerOrgs: (
    process.env.SUBWAY_PRIORITY_MATCHING_PARTNER_ORGS || 'bogus'
  ).split(','),
  priorityMatchingSponsorOrgs: (
    process.env.SUBWAY_PRIORITY_MATCHING_SPONSOR_ORGS || 'onlySponsorsSchools'
  ).split(','),

  corporatePartnerReports: {
    customAnalyticsReportPartnerOrgs: (
      process.env.SUBWAY_CUSTOM_ANALYTICS_PARTNER_ORGS || 'big-telecom'
    ).split(','),
    batchSize:
      Number(process.env.SUBWAY_CORPORATE_PARTNER_REPORTS_BATCH_SIZE) || 100,
  },

  clusterServerAddress:
    process.env.SUBWAY_CLUSTER_SERVER_ADDRESS || 'localhost',

  cacheKeys: {
    updateTotalVolunteerHoursLastRun: 'UPDATE_TOTAL_VOLUNTEERS_LAST_RUN',
    waitTimeHeatMapAllSubjects: 'WAIT_TIME_HEAT_MAP_ALL_SUBJECTS',
    userRoleContextPrefix: 'USER_ROLE_CONTEXT-',
  },

  // Sentry Data Source Name
  sentryDsn: process.env.SUBWAY_SENTRY_DSN || '',

  // Twilio Credentials
  accountSid: process.env.SUBWAY_TWILIO_ACCOUNT_SID || '',
  authToken: process.env.SUBWAY_TWILIO_AUTH_TOKEN || '',
  sendingNumber: process.env.SUBWAY_TWILIO_SENDING_NUMBER || '',
  twilioAccountVerificationServiceSid:
    process.env.SUBWAY_TWILIO_ACCOUNT_VERIFICATION_SERVICE_SID || '',
  twilioVerificationRateLimitUniqueName: 'userId',
  twilioVerificationRateLimitMaxRetries:
    Number(process.env.SUBWAY_TWILIO_VERIFICATION_RATELIMIT_MAX_RETRIES) || 4,
  twilioVerificationRateLimitIntervalSeconds:
    Number(process.env.SUBWAY_TWILIO_VERIFICATION_RATELIMIT_INTERVAL_SECONDS) ||
    60,
  notificationSchedule: [
    // Minute 1 (the time after a session request is made)
    1 * 60 * 1000,
    12 * 1000,
    12 * 1000,
    12 * 1000,
    12 * 1000,
    // Minute 2
    12 * 1000,
    12 * 1000,
    12 * 1000,
    12 * 1000,
    12 * 1000,
    // Minute 3
    12 * 1000,
    12 * 1000,
    12 * 1000,
    12 * 1000,
    12 * 1000,
  ],
  // voice to use to render speech
  voice: 'man',

  workerQueueName: 'main',
  redisConnectionString,
  redisHost,
  redisPort,
  redisPassword,
  postgresHost: process.env.SUBWAY_POSTGRES_HOST || 'localhost',
  postgresRoHost: process.env.SUBWAY_POSTGRES_RO_HOST || 'localhost',
  postgresAnalyticsHost:
    process.env.SUBWAY_POSTGRES_ANALYTICS_HOST || 'localhost',
  postgresPort: Number(process.env.SUBWAY_POSTGRES_PORT || 5432),
  postgresUser: process.env.SUBWAY_POSTGRES_USER || 'subway',
  postgresPassword: process.env.SUBWAY_POSTGRES_PASSWORD || 'Password123',
  postgresDatabase: process.env.SUBWAY_POSTGRES_DB || 'upchieve',
  postgresRequireSSL: stringToBoolean(
    process.env.SUBWAY_POSTGRES_REQUIRE_SSL || 'false'
  ),
  firebase: {
    projectId: process.env.SUBWAY_FIREBASE_PROJECT_ID || '123456789012',
  },
  bannedServiceProviders: bannedServiceProviders,
  awsS3: {
    accessKeyId: process.env.SUBWAY_AWS_ACCESSKEY || 'ACCESSKEY123',
    secretAccessKey:
      process.env.SUBWAY_SECRET_ACCESS_KEY || 'SECRETACCESSKEY789',
    region: process.env.SUBWAY_AWS_REGION || 'us-east-2',
    photoIdBucket: process.env.SUBWAY_PHOTO_ID_BUCKET || 'photo-id-bucket',
    sessionPhotoBucket:
      process.env.SUBWAY_SESSION_PHOTO_BUCKET || 'session-photo-bucket',
    moderatedScreenshareBucket:
      process.env.SUBWAY_MODERATED_SCREENSHARE_BUCKET ||
      'moderated-screenshare-bucket',
    moderatedSessionImageUploadBucket:
      process.env.SUBWAY_MODERATED_SESSION_IMAGE_UPLOAD_BUCKET ||
      'moderated-session-images-bucket',
    moderatedSessionWhiteboardImageUploadBucket:
      process.env.SUBWAY_MODERATED_SESSION_WHITEBOARD_IMAGE_UPLOAD_BUCKET ||
      'moderated-session-whiteboard-images-bucket',
  },
  awsModerationToolsRegion:
    process.env.SUBWAY_AWS_MODERATION_TOOLS_REGION || 'us-east-1',
  posthogToken: process.env.SUBWAY_POSTHOG_TOKEN || 'bogus',
  posthogFeatureFlagApiToken:
    process.env.SUBWAY_POSTHOG_FEATURE_FLAG_API_TOKEN || 'bogus',
  posthogPersonalApiToken:
    process.env.SUBWAY_POSTHOG_PERSONAL_API_TOKEN || 'bogus',
  posthogProjectId: process.env.SUBWAY_POSTHOG_PROJECT_ID || 'bogus',

  /**
   *
   * @note: DefaultAzureCredential() requires AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET.
   * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/identity/identity/README.md#environment-variables
   *
   * To combine multiple credential instances please see:
   * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/identity/identity/README.md#define-a-custom-authentication-flow-with-the-chainedtokencredential
   *
   **/
  azureClientId: process.env.AZURE_CLIENT_ID || 'bogus',
  azureTenantId: process.env.AZURE_TENANT_ID || 'bogus',
  azureStorageSecret: process.env.AZURE_CLIENT_SECRET || 'bogus',
  azureSubscriptionId: process.env.AZURE_SUBSCRIPTION_ID || 'bogus',
  whiteboardStorageAccountName:
    process.env.SUBWAY_WHITEBOARD_STORAGE_ACCOUNT_NAME || 'bogus',
  whiteboardStorageContainer:
    process.env.SUBWAY_WHITEBOARD_STORAGE_CONTAINER || 'bogus',
  voiceMessageStorageAppId: process.env.AZURE_CLIENT_ID || 'bogus',
  voiceMessageStorageTenantId: process.env.AZURE_TENANT_ID || 'bogus',
  voiceMessageStorageSecret: process.env.AZURE_CLIENT_SECRET || 'bogus',
  voiceMessageStorageAccountName:
    process.env.SUBWAY_VOICE_MESSAGE_STORAGE_ACCOUNT_NAME || 'bogus',
  voiceMessageStorageContainer:
    process.env.SUBWAY_VOICE_MESSAGE_STORAGE_CONTAINER || 'bogus',
  assignmentsStorageAccountName:
    process.env.SUBWAY_ASSIGNMENTS_STORAGE_ACCOUNT_NAME || 'bogus',
  assignmentsStorageContainer:
    process.env.SUBWAY_ASSIGNMENTS_STORAGE_CONTAINER || 'bogus',
  assignmentsFrontdoorHostName:
    process.env.SUBWAY_ASSIGNMENTS_FRONTDOOR_HOSTNAME || 'bogus',
  version: process.env.SUBWAY_VERSION || 'development',
  fileWorkRootPath: process.env.FILE_WORK_ROOT_PATH || `${__dirname}/tmp`,
  ipWhoIsApiKey: process.env.SUBWAY_IP_WHO_IS_API_KEY || 'bogus',
  favoriteVolunteerLimit:
    Number(process.env.SUBWAY_FAVORITE_VOLUNTEER_LIMIT) || 20,
  eligibleIncomeThreshold:
    Number(process.env.SUBWAY_ELIGIBLE_INCOME_THRESHOLD) || 60000,
  eligibleFRLThreshold:
    Number(process.env.SUBWAY_ELIGIBLE_FRL_THRESHOLD) || 0.4,
  customManualStudentPartnerOrg:
    process.env.SUBWAY_CUSTOM_MANUAL_STUDENT_PARTNER_ORG || 'college-mentors',

  // To work on localhost, add a .env file in the root dir with
  // these environment variables.
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'bogus',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'bogus',
  googleRecaptchaSecret: process.env.GOOGLE_RECAPTCHA_SECRET || 'bogus',
  googleRecaptchaThreshold: isNaN(
    Number(process.env.GOOGLE_RECAPTCHA_THRESHOLD)
  )
    ? 0.5
    : Number(process.env.GOOGLE_RECAPTCHA_THRESHOLD),

  cleverClientId: process.env.CLEVER_CLIENT_ID || 'bogus',
  cleverClientSecret: process.env.CLEVER_CLIENT_SECRET || 'bogus',

  classlinkClientId: process.env.CLASSLINK_CLIENT_ID || 'bogus',
  classlinkClientSecret: process.env.CLASSLINK_CLIENT_SECRET || 'bogus',
  classlinkRosterApiKey: process.env.CLASSLINK_ROSTER_API_KEY || 'bogus',

  minSessionLength: Number(process.env.SUBWAY_SESSION_MIN_LENGTH) || 60000,

  openAIModelId: process.env.SUBWAY_OPEN_AI_MODEL_ID || 'bogus',
  openAIApiKey: process.env.SUBWAY_OPEN_AI_API_KEY || 'bogus',
  subwayApiCredentials: process.env.SUBWAY_API_CREDENTIALS || 'bogus',
  subwayAIVisionEndpoint: process.env.SUBWAY_VISION_AI_ENDPOINT || 'bogus',
  subwayAIVisionApiKey: process.env.SUBWAY_VISION_AI_API_KEY || 'bogus',

  // Langfuse
  langfuseSecretKey: process.env.SUBWAY_LANGFUSE_SECRET_KEY || 'bogus',
  langfusePublicKey: process.env.SUBWAY_LANGFUSE_PUBLIC_KEY || 'bogus',
  langfuseBaseUrl: process.env.SUBWAY_LANGFUSE_BASEURL || 'bogus',

  // Azure Content Safety
  azureContentSafetyApiKey:
    process.env.SUBWAY_AZURE_CONTENT_SAFETY_API_KEY || 'bogus',
  azureContentSafetyBaseUrl:
    process.env.SUBWAY_AZURE_CONTENT_SAFETY_BASE_URL || 'bogus',

  // Moderation
  liveMediaBanInfractionScoreThreshold:
    Number(process.env.LIVE_MEDIA_BAN_INFRACTION_SCORE_THRESHOLD) || 10,
  imageModerationMinConfidence:
    Number(process.env.IMAGE_MODERATION_CONFIDENCE_THRESHOLD) || 70,
  minorDetectedEntityConfidenceThreshold:
    Number(process.env.MINOR_DETECTED_ENTITY_CONFIDENCE_THRESHOLD) || 70,
  toxicityModerationMinConfidence:
    Number(process.env.TOXICITY_MODERATION_CONFIDENCE_THRESHOLD) || 0.8,
  phoneNumberModerationConfidenceThreshold:
    Number(process.env.PHONE_NUMBER_MODERATION_CONFIDENCE_THRESHOLD) || 0.9,
  contextualModerationConfidenceThreshold:
    Number(process.env.CONTEXTUAL_MODERATION_CONFIDENCE_THRESHOLD) || 50,
  moderateMessageTimeLimitMs:
    Number(process.env.MODERATE_MESSAGE_TIME_LIMIT_MS) || 5 * 1000,
  contextualModerationBatchSize:
    Number(process.env.CONTEXTUAL_MODERATION_BATCH_SIZE) || 50,
  minimumModerationAddressConfidence:
    Number(process.env.MINIMUM_MODERATION_ADDRESS_CONFIDENCE) || 0.8,
  minimumModerationLinkConfidence:
    Number(process.env.MINIMUM_MODERATION_LINK_CONFIDENCE) || 0.8,

  tremendousApiKey: process.env.SUBWAY_TREMENDOUS_API_KEY || 'bogus',
  tremendousImpactStudyCampaign:
    process.env.SUBWAY_TREMENDOUS_IMPACT_STUDY_CAMPAIGN || 'bogus',
  tremendousCustomFieldsCacheExpirationSeconds:
    Number(
      process.env.SUBWAY_TREMENDOUS_CUSTOM_FIELDS_CACHE_EXPIRATION_SECONDS
    ) || 86400,
  tremendousCampaignCacheExpirationSeconds:
    Number(process.env.SUBWAY_TREMENDOUS_CAMPAIGNS_CACHE_EXPIRATION_SECONDS) ||
    86400,

  // AWS Account ID
  awsAccountId: process.env.SUBWAY_AWS_ACCOUNT_ID || 'bogus',

  // AWS Chime
  awsChimeAccessKey: process.env.SUBWAY_AWS_CHIME_ACCESS_KEY || 'bogus',
  awsChimeSecretAccessKey:
    process.env.SUBWAY_AWS_CHIME_SECRET_ACCESS_KEY || 'bogus',
  awsChimeRegion: process.env.SUBWAY_AWS_CHIME_REGION || 'us-east-1',
  awsChimeMeetingRecordingBucketArn:
    process.env.SUBWAY_AWS_CHIME_RECORDINGS_BUCKET_ARN || 'bogus',

  // AWS Bedrock
  awsBedrockAccessKey: process.env.SUBWAY_AWS_BEDROCK_ACCESS_KEY || 'bogus',
  awsBedrockSecretAccessKey:
    process.env.SUBWAY_AWS_BEDROCK_SECRET_ACCESS_KEY || 'bogus',
  awsBedrockRegion: process.env.SUBWAY_AWS_BEDROCK_REGION || 'us-east-1',
  awsBedrockHaikuId: process.env.SUBWAY_AWS_BEDROCK_HAIKU_ID || 'bogus',
  awsBedrockSonnetArnId:
    process.env.SUBWAY_AWS_BEDROCK_SONNET_ARN_ID || 'bogus',

  // Zwibbler
  zwibblerNodeUrl: process.env.ZWIBBLER_NODE_URL || 'bogus',
}
module.exports = config
export default config
