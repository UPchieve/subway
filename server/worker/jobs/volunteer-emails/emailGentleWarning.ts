import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getNotificationsWithPipeline } from '../../../services/NotificationService'
import { getSessionsWithPipeline } from '../../../services/SessionService'

interface GentleWarningAggregation {
  _id: string | Types.ObjectId
  totalNotifications: number
  firstName: string
  email: string
}

/**
 *
 * conditions for sending email:
 * - Volunteer received 5 texts and completed 0 tutoring sessions
 *
 */
export default async (
  job: Job<{
    sessionId: string
  }>
): Promise<void> => {
  const {
    data: { sessionId },
    name: currentJob
  } = job
  const documentsWithVolunteerIds = await getSessionsWithPipeline([
    {
      $match: {
        _id: Types.ObjectId(sessionId)
      }
    },
    {
      $lookup: {
        from: 'notifications',
        foreignField: '_id',
        localField: 'notifications',
        as: 'notifications'
      }
    },
    { $unwind: '$notifications' },
    {
      $project: {
        isSessionsVolunteer: {
          $eq: ['$volunteer', '$notifications.volunteer']
        },
        volunteerId: '$notifications.volunteer'
      }
    },
    {
      $match: {
        // Exclude from sending the email to the volunteer who joined this session
        isSessionsVolunteer: false
      }
    },
    {
      $group: {
        _id: '$volunteerId'
      }
    }
  ])

  if (documentsWithVolunteerIds.length === 0) return

  const volunteerIds = documentsWithVolunteerIds.map(doc => doc._id)

  // @todo: properly type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volunteerNotifications: any = await getNotificationsWithPipeline([
    {
      $match: {
        volunteer: { $in: volunteerIds },
        priorityGroup: { $ne: 'follow-up' }
      }
    },
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'volunteer',
        as: 'volunteer'
      }
    },
    { $unwind: '$volunteer' },
    {
      $match: {
        'volunteer.pastSessions': { $size: 0 }
      }
    },
    {
      $group: {
        _id: '$volunteer._id',
        totalNotifications: { $sum: 1 },
        firstName: { $first: '$volunteer.firstname' },
        email: { $first: '$volunteer.email' }
      }
    }
  ])

  for (const volunteer of volunteerNotifications as GentleWarningAggregation[]) {
    if (volunteer.totalNotifications === 5) {
      const { firstName, email, _id } = volunteer
      const contactInfo = { firstName, email }
      try {
        await MailService.sendVolunteerGentleWarning(contactInfo)
        logger.info(`Sent ${currentJob} to volunteer ${_id}`)
      } catch (error) {
        logger.error(
          `Failed to send ${currentJob} to volunteer ${_id}: ${error}`
        )
      }
    }
  }
}