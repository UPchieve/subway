import mongoose from 'mongoose'
import {
  resetDb,
  insertSession,
  insertNotificationMany,
  insertVolunteerMany
} from '../../db-utils'
import emailGentleWarning from '../../../worker/jobs/volunteer-emails/emailGentleWarning'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { buildNotification, buildVolunteer } from '../../generate'
import { Notification } from '../../../models/Notification'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

const createNotifications = (amount, volunteerId): Notification[] => {
  const notifications = []
  for (let i = 0; i < amount; i++) {
    notifications.push(buildNotification({ volunteer: volunteerId }))
  }

  return notifications
}

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

describe('Volunteer gentle warning email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send gentle warning email to volunteer who has not picked up a tutoring session and has received 5 text notifications', async () => {
    const plato = buildVolunteer()
    const kant = buildVolunteer()
    const sartre = buildVolunteer({
      pastSessions: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
    })
    const platoNotifications = createNotifications(5, plato._id)
    const kantNotification = buildNotification({ volunteer: kant._id })
    await insertNotificationMany([...platoNotifications, kantNotification])
    const { session } = await insertSession({
      notifications: [platoNotifications[1]._id, kantNotification]
    })
    await insertVolunteerMany([plato, kant, sartre])
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailVolunteerGentleWarning,
      data: {
        sessionId: session._id
      }
    }

    await emailGentleWarning(job)
    expect(MailService.sendVolunteerGentleWarning).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${plato._id}`
    )
    expect(logger.info).not.toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${kant._id}`
    )
    expect(logger.info).not.toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${sartre._id}`
    )
  })

  test('Should catch error when sending email', async () => {
    const plato = buildVolunteer()
    const kant = buildVolunteer()
    const sartre = buildVolunteer({
      pastSessions: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
    })
    const platoNotifications = createNotifications(5, plato._id)
    const kantNotification = buildNotification({ volunteer: kant._id })
    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendVolunteerGentleWarning = rejectionFn
    await insertNotificationMany([...platoNotifications, kantNotification])
    const { session } = await insertSession({
      notifications: [platoNotifications[1]._id, kantNotification]
    })
    await insertVolunteerMany([plato, kant, sartre])
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      name: Jobs.EmailVolunteerGentleWarning,
      data: {
        sessionId: session._id
      }
    }

    await emailGentleWarning(job)
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to send ${job.name} to volunteer ${plato._id}: ${errorMessage}`
    )
  })
})