import mongoose from 'mongoose'
import {
  resetDb,
  insertVolunteer,
  insertSessionMany,
  insertFeedback,
  insertFeedbackMany
} from '../../db-utils'
import emailTenSessionMilestone from '../../../worker/jobs/partner-volunteer-emails/emailTenSessionMilestone'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { buildFeedback, buildSession } from '../../generate'
import { SESSION_FLAGS } from '../../../constants'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Partner volunteer ten session milestone email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email to partner volunteer', async () => {
    const volunteer = await insertVolunteer()
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes })
    ]
    await insertSessionMany(sessions)
    await insertFeedback({
      sessionId: sessions[2]._id,
      volunteerId: volunteer._id,
      responseData: {
        'session-rating': {
          rating: 4
        }
      }
    })

    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg
      }
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test('Should not send email to partner volunteer who has left more than 2 low session ratings', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example'
    })
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes })
    ]
    await insertSessionMany(sessions)
    await insertFeedback()
    const feedback = [
      buildFeedback({
        sessionId: sessions[1]._id,
        volunteerId: volunteer._id,
        responseData: {
          'session-rating': {
            rating: 1
          }
        }
      }),
      buildFeedback({
        sessionId: sessions[2]._id,
        volunteerId: volunteer._id,
        responseData: {
          'session-rating': {
            rating: 2
          }
        }
      }),
      buildFeedback({
        sessionId: sessions[6]._id,
        volunteerId: volunteer._id,
        responseData: {
          'session-rating': {
            rating: 1
          }
        }
      })
    ]
    await insertFeedbackMany(feedback)

    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg
      }
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalled()
  })

  test(`Should not send email to partner volunteer who has sessions flags with ${SESSION_FLAGS.ABSENT_USER}`, async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example'
    })
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({
        volunteer: volunteer._id,
        timeTutored: twentyMinutes,
        flags: [SESSION_FLAGS.ABSENT_USER]
      }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes })
    ]
    await insertSessionMany(sessions)
    const feedback = [
      buildFeedback({
        sessionId: sessions[1]._id,
        volunteerId: volunteer._id,
        responseData: {
          'session-rating': {
            rating: 1
          }
        }
      }),
      buildFeedback({
        sessionId: sessions[2]._id,
        volunteerId: volunteer._id,
        responseData: {
          'session-rating': {
            rating: 2
          }
        }
      }),
      buildFeedback({
        sessionId: sessions[6]._id,
        volunteerId: volunteer._id,
        responseData: {
          'session-rating': {
            rating: 1
          }
        }
      })
    ]
    await insertFeedbackMany(feedback)

    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg
      }
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalled()
  })

  test('Should not send email to partner volunteer who has 5 sessions with one of a duration less than 15 minutes', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example'
    })
    const tenMinutes = 1000 * 60 * 10
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: tenMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes })
    ]
    await insertSessionMany(sessions)

    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg
      }
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalled()
  })

  test('Should catch error when sending email', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example'
    })
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes })
    ]
    await insertSessionMany(sessions)
    await insertFeedback({
      sessionId: sessions[2]._id,
      volunteerId: volunteer._id,
      responseData: {
        'session-rating': {
          rating: 4
        }
      }
    })
    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendPartnerVolunteerTenSessionMilestone = rejectionFn
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg
      }
    }
    await emailTenSessionMilestone(job)
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
    )
  })
})