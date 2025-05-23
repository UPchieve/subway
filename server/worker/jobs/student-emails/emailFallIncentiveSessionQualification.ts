import { Job } from 'bull'
import * as MailService from '../../../services/MailService'
import { asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'
import { Jobs } from '..'
import { isSessionQualifiedForFallIncentive } from '../../../services/SessionService'
import config from '../../../config'
import {
  hasUserBeenSentEmail,
  createEmailNotification,
  getTotalEmailsSentToUser,
} from '../../../services/NotificationService'
import { getUserFallIncentiveData } from '../../../services/IncentiveProgramService'
import moment from 'moment'
import { log } from '../../logger'
import { captureEvent } from '../../../services/AnalyticsService'
import { EVENTS } from '../../../constants'

export interface EmailFallIncentiveSessionQualificationJobData {
  userId: Ulid
  sessionId: Ulid
}

async function processCompletedFallIncentiveChallenge(
  userId: string,
  userEmail: string,
  firstName: string
) {
  await MailService.sendFallIncentiveCompletedChallengeEmail(
    userEmail,
    firstName
  )
  await createEmailNotification({
    userId,
    emailTemplateId: config.sendgrid.fallIncentiveCompletedChallengeTemplate,
  })
  captureEvent(
    userId,
    EVENTS.STUDENT_FALL_INCENTIVE_PROGRAM_GIFT_CARD_LIMIT_REACHED,
    {},
    {
      fallIncentiveLimitReachedAt: new Date().toISOString(),
    }
  )
}

/**
 *
 * - After every session, check if the student has qualifying sessions this week.
 * - Send "qualified for gift card" emails up to the weekly limit.
 * - Do not exceed the overall maximum limit of 10 gift cards per student.
 * - Ensure only the allowed number of emails are sent per week.
 * - Only send the unqualified emails once from the time the user enrolls into the program
 *
 */
export default async (
  job: Job<EmailFallIncentiveSessionQualificationJobData>
): Promise<void> => {
  const userId = asString(job.data.userId)
  const sessionId = asString(job.data.sessionId)
  const data = await getUserFallIncentiveData(userId, true)
  if (!data) return

  const { user, productFlags, incentivePayload } = data
  const { firstName, email, proxyEmail } = user
  const userEmail = proxyEmail ?? email
  const fallIncentiveProgramStartDate = moment(
    incentivePayload.incentiveStartDate
  )
  // We're using ISO week to have the week's starting point as Monday
  const thisMonday = moment().startOf('isoWeek').utc()
  const fallIncentiveEnrollmentAt = moment(
    productFlags?.fallIncentiveEnrollmentAt
  ).utc()
  const startOfWeek = moment.max(
    thisMonday,
    fallIncentiveProgramStartDate,
    fallIncentiveEnrollmentAt
  )

  const totalQualifiedForGiftCardsSent = await getTotalEmailsSentToUser({
    userId,
    emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    start: fallIncentiveEnrollmentAt.toDate(),
  })
  const hasReceivedCompletedChallengeEmail = await hasUserBeenSentEmail({
    userId,
    emailTemplateId: config.sendgrid.fallIncentiveCompletedChallengeTemplate,
    start: fallIncentiveEnrollmentAt.toDate(),
  })
  const FALL_INCENTIVE_MAX_QUALIFIED_GIFT_CARD_LIMIT =
    incentivePayload.maxQualifiedSessionsPerUser ?? 10

  // Check if the student has reached the limit for the amount of money they can earn
  if (
    totalQualifiedForGiftCardsSent >=
    FALL_INCENTIVE_MAX_QUALIFIED_GIFT_CARD_LIMIT
  ) {
    log(
      `${Jobs.EmailFallIncentiveSessionQualification} User ${userId} has reached the maximum number of qualification for gift cards (${FALL_INCENTIVE_MAX_QUALIFIED_GIFT_CARD_LIMIT})`
    )
    if (!hasReceivedCompletedChallengeEmail)
      await processCompletedFallIncentiveChallenge(userId, userEmail, firstName)

    return
  }

  const totalQualifiedEmailsSentThisWeek = await getTotalEmailsSentToUser({
    userId,
    emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    start: startOfWeek.toDate(),
  })

  if (
    incentivePayload.maxQualifiedSessionsPerWeek &&
    totalQualifiedEmailsSentThisWeek >=
      incentivePayload.maxQualifiedSessionsPerWeek
  ) {
    log(
      `${Jobs.EmailFallIncentiveSessionQualification} User ${userId} has reached the weekly limit of qualified emails (${incentivePayload.maxQualifiedSessionsPerWeek})`
    )
    return
  }

  const isSessionQualified = await isSessionQualifiedForFallIncentive(sessionId)
  try {
    if (isSessionQualified) {
      await MailService.sendQualifiedForGiftCardEmail(userEmail, firstName)
      await createEmailNotification({
        userId,
        sessionId,
        emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
      })
      log(
        `Sent ${Jobs.EmailFallIncentiveSessionQualification} to student ${userId} gift card qualified email`
      )
      // Phase the user out of the program if we just sent their final qualified for gift card notification
      if (
        !hasReceivedCompletedChallengeEmail &&
        totalQualifiedForGiftCardsSent ===
          FALL_INCENTIVE_MAX_QUALIFIED_GIFT_CARD_LIMIT - 1
      )
        await processCompletedFallIncentiveChallenge(
          userId,
          userEmail,
          firstName
        )
    } else {
      const unqualifiedEmailSent = await hasUserBeenSentEmail({
        userId,
        emailTemplateId: config.sendgrid.stillTimeForQualifyingSessionTemplate,
        start: fallIncentiveEnrollmentAt.toDate(),
      })
      if (!unqualifiedEmailSent) {
        await MailService.sendStillTimeToHaveQualifyingSessionEmail(
          userEmail,
          firstName
        )
        await createEmailNotification({
          userId,
          sessionId,
          emailTemplateId:
            config.sendgrid.stillTimeForQualifyingSessionTemplate,
        })
        log(
          `${Jobs.EmailFallIncentiveSessionQualification} sent student ${userId} session did not qualify email`
        )
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to send ${Jobs.EmailFallIncentiveSessionQualification} to student ${userId}: ${error}`
    )
  }
}
