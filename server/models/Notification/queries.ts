import { Notification } from './types'
import { RepoReadError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, makeSomeRequired, makeRequired } from '../pgUtils'

export async function getNotificationsByVolunteerId(
  userId: Ulid
): Promise<Notification[]> {
  try {
    const result = await pgQueries.getNotificationsByVolunteerId.run(
      { userId },
      getClient()
    )
    return result.map(v =>
      makeSomeRequired(v, ['sentAt', 'messageId', 'wasSuccessful'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SessionNotification = {
  volunteer: {
    // old firstName for legacy compatibility
    firstname: string
    volunteerPartnerOrg: string
  }
} & Notification

export async function getSessionNotificationsWithSessionId(
  sessionId: Ulid
): Promise<SessionNotification[]> {
  try {
    const result = await pgQueries.getSessionNotificationsWithSessionId.run(
      { sessionId },
      getClient()
    )
    return result.map(v => {
      const row: any = makeSomeRequired(v, [
        'sentAt',
        'messageId',
        'wasSuccessful',
        'volunteerPartnerOrg',
      ])
      row.volunteer = {
        firstname: row.firstName,
        volunteerPartnerOrg: row.volunteerPartnerOrg
          ? row.volunteerPartnerOrg
          : '',
      }
      delete row.firstName
      delete row.volunteerPartnerOrg
      return row as SessionNotification
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type GentleWarning = {
  id: Ulid
  totalNotifications: number
  firstName: string
  email: string
}
export async function getNotificationsForGentleWarning(
  sessionId: Ulid
): Promise<GentleWarning[]> {
  try {
    const result = await pgQueries.getNotificationsForGentleWarning.run(
      { sessionId },
      getClient()
    )
    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
