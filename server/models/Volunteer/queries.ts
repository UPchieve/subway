import {
  getAnalyticsClient,
  getClient,
  getRoClient,
  runInTransaction,
  TransactionClient,
} from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeOptional,
  Ulid,
  getDbUlid,
  generateReferralCode,
  makeSomeRequired,
  Uuid,
} from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { Availability } from '../Availability/types'
import { getAvailabilityForVolunteer } from '../Availability'
import {
  Quizzes,
  Sponsorship,
  UserTrainingCourse,
  VolunteersForAnalyticsReport,
  VolunteerSubject,
} from './types'
import config from '../../config'
import _ from 'lodash'
import { PHOTO_ID_STATUS, USER_BAN_TYPES, USER_ROLES } from '../../constants'
import { PoolClient } from 'pg'
import {
  AssociatedPartnersAndSchools,
  getAssociatedPartnersAndSchools,
} from '../AssociatedPartner'
import { UniqueStudentsHelped } from '.'
import { isPgId } from '../../utils/type-utils'
import { insertUserRoleByUserId, UserRole } from '../User'
import { getVolunteerPartnerOrgIdByKey } from '../VolunteerPartnerOrg'
import { ReportNoDataFoundError } from '../../services/ReportService'

export type VolunteerContactInfo = {
  id: Ulid
  email: string
  phone: string
  firstName: string
  lastName: string
  volunteerPartnerOrg?: string
}

export async function getVolunteerContactInfoById(
  userId: Ulid,
  filters?: {
    banned?: boolean
    deactivated?: boolean
    testUser?: boolean
  }
): Promise<VolunteerContactInfo | undefined> {
  try {
    const banned = filters?.banned ?? null
    const deactivated = filters?.deactivated ?? null
    const testUser = filters?.testUser ?? null
    const result = await pgQueries.getVolunteerContactInfoById.run(
      { userId, banned, deactivated, testUser },
      getClient()
    )
    if (!result.length) return
    const ret = makeSomeOptional(result[0], ['volunteerPartnerOrg'])
    ret.email = ret.email.toLowerCase()
    return ret
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSubjectsForVolunteer(
  userId: Ulid,
  tc?: TransactionClient
) {
  try {
    const result = await pgQueries.getSubjectsForVolunteer.run(
      { userId },
      tc ?? getClient()
    )
    const subjects = result.map((v) => makeRequired(v).subject)
    return subjects
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerContactInfoByIds(
  userIds: Ulid[],
  client?: TransactionClient
): Promise<VolunteerContactInfo[]> {
  const dbClient = client ?? getClient()
  try {
    const result = await pgQueries.getVolunteerContactInfoByIds.run(
      { userIds },
      dbClient
    )
    return result.map((v) => {
      const ret = makeSomeOptional(v, ['volunteerPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersForBlackoutOver(
  startDate: Date
): Promise<VolunteerContactInfo[]> {
  try {
    const result = await pgQueries.getVolunteersForBlackoutOver.run(
      { startDate },
      getClient()
    )
    return result.map((v) => {
      const ret = makeSomeOptional(v, ['volunteerPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerContactAndAvailability = VolunteerContactInfo & {
  availability: Availability
}
export async function getVolunteerForQuickTips(
  userId: Ulid
): Promise<VolunteerContactAndAvailability | undefined> {
  try {
    const vResult = await pgQueries.getVolunteerForQuickTips.run(
      {
        userId: isPgId(userId) ? userId : undefined,
        mongoUserId: isPgId(userId) ? undefined : userId,
      },
      getClient()
    )
    if (!vResult.length) return
    const volunteer = makeSomeOptional(vResult[0], ['volunteerPartnerOrg'])
    const availability = await getAvailabilityForVolunteer(userId)
    volunteer.email = volunteer.email.toLowerCase()
    return {
      ...volunteer,
      availability,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPartnerVolunteerForLowHours(
  userId: Ulid
): Promise<VolunteerContactAndAvailability | undefined> {
  try {
    const vResult = await pgQueries.getPartnerVolunteerForLowHours.run(
      {
        userId: isPgId(userId) ? userId : undefined,
        mongoUserId: isPgId(userId) ? undefined : userId,
      },
      getClient()
    )
    if (!vResult.length) return
    const volunteer = makeRequired(vResult[0]) // volunteerPartnerOrg must exist
    volunteer.email = volunteer.email.toLowerCase()
    const availability = await getAvailabilityForVolunteer(userId)
    return {
      ...volunteer,
      availability,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerTypeMap<T> = {
  [key: Ulid]: T
}
export type VolunteerQuizMap = VolunteerTypeMap<Quizzes>
export async function getQuizzesForVolunteers(
  userIds: Ulid[],
  dbClient?: TransactionClient
): Promise<VolunteerQuizMap> {
  const client = dbClient ? dbClient : getClient()
  try {
    const result = await pgQueries.getQuizzesForVolunteers.run(
      { userIds },
      client
    )
    const rows = result.map((v) => makeRequired(v))
    const rowsByUser = _.groupBy(rows, (v) => v.userId)
    const map: VolunteerQuizMap = {}
    for (const user of userIds) {
      const temp: Quizzes = {}
      const rows = rowsByUser[user] || []
      for (const row of rows) {
        temp[row.name] = {
          passed: row.passed,
          tries: row.tries,
          lastAttemptedAt: row.lastAttemptedAt,
        }
      }
      map[user] = temp
    }
    return map
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getCertificationsForVolunteer(
  userIds: Ulid[],
  poolClient?: TransactionClient
): Promise<VolunteerQuizMap> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getCertificationsForVolunteer.run(
      { userIds },
      client
    )
    const rows = result.map((v) => makeRequired(v))
    const rowsByUser = _.groupBy(rows, (v) => v.userId)
    const map: VolunteerQuizMap = {}
    for (const user of userIds) {
      const temp: Quizzes = {}
      const rows = rowsByUser[user] || []
      for (const row of rows) {
        temp[row.name] = {
          passed: true,
          tries: 1,
          lastAttemptedAt: row.lastAttemptedAt,
        }
      }
      map[user] = temp
    }
    return map
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getActiveQuizzesForVolunteers(
  userIds: Ulid[],
  poolClient?: TransactionClient
): Promise<VolunteerQuizMap> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getActiveQuizzesForVolunteers.run(
      { userIds },
      client
    )
    const rows = result.map((v) => makeRequired(v))
    const rowsByUser = _.groupBy(rows, (v) => v.userId)
    const map: VolunteerQuizMap = {}
    for (const user of userIds) {
      const temp: Quizzes = {}
      const rows = rowsByUser[user] || []
      for (const row of rows) {
        temp[row.name] = {
          passed: row.passed,
          tries: row.tries,
          lastAttemptedAt: row.lastAttemptedAt,
        }
      }
      map[user] = temp
    }
    return map
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForWeeklyHourSummary = Omit<
  VolunteerContactInfo,
  'phone'
> & {
  sentHourSummaryIntroEmail: boolean
  quizzes: Quizzes
}

export async function getVolunteersForWeeklyHourSummary(): Promise<
  VolunteerForWeeklyHourSummary[]
> {
  try {
    const result = await pgQueries.getVolunteersForWeeklyHourSummary.run(
      undefined,
      getClient()
    )
    const rows = result.map((v) => makeSomeOptional(v, ['volunteerPartnerOrg']))
    const quizzes = await getQuizzesForVolunteers(rows.map((v) => v.id))
    return rows.map((v) => ({
      ...v,
      quizzes: quizzes[v.id],
    }))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateVolunteerHourSummaryIntroById(
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerHourSummaryIntroById.run(
      { userId },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateTimezoneByUserId(
  userId: Ulid,
  timezone?: string,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.updateTimezoneByUserId.run(
      { userId, timezone },
      tc || getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getVolunteerIdsForElapsedAvailability(): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getVolunteerIdsForElapsedAvailability.run(
      undefined,
      getClient()
    )
    return result.map((v) => makeRequired(v).userId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForTotalHours = Pick<VolunteerContactInfo, 'id'> & {
  quizzes: Quizzes
}
export async function getVolunteersForTotalHours(): Promise<
  VolunteerForTotalHours[]
> {
  try {
    const result = await pgQueries.getVolunteersForTotalHours.run(
      { targetPartnerOrgs: config.customVolunteerPartnerOrgs },
      getClient()
    )
    const rows = result.map((v) => makeRequired(v))
    const quizzes = await getQuizzesForVolunteers(rows.map((v) => v.id))
    return rows.map((v) => ({
      ...v,
      quizzes: quizzes[v.id],
    }))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForOnboarding = Pick<
  VolunteerContactInfo,
  'id' | 'email' | 'firstName'
> & {
  onboarded: boolean
  approved: boolean
  hasCompletedUpchieve101: boolean
  subjects: string[]
  availabilityLastModifiedAt?: Date
  country?: string
  volunteerPartnerOrgKey?: string
}
export async function getVolunteerForOnboardingById(
  userId: Ulid,
  tc: TransactionClient = getClient()
): Promise<VolunteerForOnboarding | undefined> {
  try {
    const result = await pgQueries.getVolunteerForOnboardingById.run(
      {
        userId,
      },
      tc
    )
    if (!result.length) return
    const volunteer = makeSomeOptional(result[0], [
      'availabilityLastModifiedAt',
      'country',
      'volunteerPartnerOrgKey',
    ])
    if (volunteer.email) {
      volunteer.email = volunteer.email.toLowerCase()
    }

    // Some users may skip the UPchieve101 training course and go straight to the quiz
    const trainingCourses = await getVolunteerTrainingCourses(volunteer.id, tc)
    const userQuizzes = (await getQuizzesForVolunteers([userId], tc))[userId]

    const upchieve101Quiz = userQuizzes.hasOwnProperty('upchieve101')
      ? userQuizzes['upchieve101']
      : null
    const completedTrainingCourse = !!trainingCourses['upchieve101']?.complete
    const passedQuiz = upchieve101Quiz
      ? (upchieve101Quiz?.passed as boolean)
      : false
    return {
      ...volunteer,
      hasCompletedUpchieve101: completedTrainingCourse || passedQuiz,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForTelecomReport = Omit<
  VolunteerForWeeklyHourSummary,
  'sentHourSummaryIntroEmail' | 'phone'
>
// TODO: break out anything that uses RO client into their own repo
export async function getVolunteersForTelecomReport(
  partnerOrg: string
): Promise<VolunteerForTelecomReport[]> {
  try {
    const result = await pgQueries.getVolunteersForTelecomReport.run(
      { partnerOrg },
      getAnalyticsClient()
    )
    const rows = result.map((v) => makeSomeOptional(v, ['volunteerPartnerOrg']))
    const quizzes = await getQuizzesForVolunteers(rows.map((v) => v.id))
    return rows.map((v) => ({
      ...v,
      quizzes: quizzes[v.id],
    }))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersNotifiedSinceDate(
  sinceDate: Date
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getVolunteersNotifiedSinceDate.run(
      { sinceDate },
      getClient()
    )
    return result.map((v) => makeRequired(v).id)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersNotifiedBySessionId(
  sessionId: Ulid
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getVolunteersNotifiedBySessionId.run(
      { sessionId },
      getClient()
    )
    return result.map((v) => makeRequired(v).userId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type VolunteerAndReference = {
  volunteerId: Ulid
  referenceEmail: string
}
export async function getVolunteerByReference(
  referenceId: Ulid
): Promise<VolunteerAndReference | undefined> {
  try {
    const result = await pgQueries.getVolunteerByReference.run(
      { referenceId },
      getClient()
    )
    if (!result.length) return
    const ret = makeRequired(result[0])
    ret.referenceEmail = ret.referenceEmail.toLowerCase()
    return ret
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type ReferenceData = {
  firstName: string
  lastName: string
  email: string
}
export async function addVolunteerReferenceById(
  volunteerId: Ulid,
  reference: ReferenceData
): Promise<void> {
  try {
    reference.email = reference.email.toLowerCase()
    const result = await pgQueries.addVolunteerReferenceById.run(
      {
        id: getDbUlid(),
        userId: volunteerId,
        ...reference,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoCreateError('Insert query did not return ok')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}

export type ReferenceSubmission = {
  affiliation: string | undefined
  relationshipLength: string | undefined
  rejectionReason: string | undefined
  additionalInfo: string | undefined
  patient: number | undefined
  positiveRoleModel: number | undefined
  agreeableAndApproachable: number | undefined
  communicatesEffectively: number | undefined
  trustworthyWithChildren: number | undefined
}
export async function updateVolunteerReferenceSubmission(
  referenceId: Ulid,
  referenceSubmission: ReferenceSubmission
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerReferenceSubmission.run(
      { referenceId, ...referenceSubmission },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type InactiveVolunteersAggregation = {
  inactiveThirtyDays: VolunteerContactInfo[]
  inactiveSixtyDays: VolunteerContactInfo[]
  inactiveNinetyDays: VolunteerContactInfo[]
}

export async function getInactiveVolunteers(
  thirtyDaysAgoStartOfDay: Date,
  thirtyDaysAgoEndOfDay: Date,
  sixtyDaysAgoStartOfDay: Date,
  sixtyDaysAgoEndOfDay: Date,
  ninetyDaysAgoStartOfDay: Date,
  ninetyDaysAgoEndOfDay: Date
): Promise<InactiveVolunteersAggregation> {
  try {
    const thirtyResult = await pgQueries.getInactiveVolunteers.run(
      { start: thirtyDaysAgoStartOfDay, end: thirtyDaysAgoEndOfDay },
      getClient()
    )
    const thirties = thirtyResult.map((v) =>
      makeSomeOptional(v, ['volunteerPartnerOrg'])
    )
    const sixtyResult = await pgQueries.getInactiveVolunteers.run(
      { start: sixtyDaysAgoStartOfDay, end: sixtyDaysAgoEndOfDay },
      getClient()
    )
    const sixties = sixtyResult.map((v) =>
      makeSomeOptional(v, ['volunteerPartnerOrg'])
    )
    const ninetyResult = await pgQueries.getInactiveVolunteers.run(
      { start: ninetyDaysAgoStartOfDay, end: ninetyDaysAgoEndOfDay },
      getClient()
    )
    const nineties = ninetyResult.map((v) =>
      makeSomeOptional(v, ['volunteerPartnerOrg'])
    )

    return {
      inactiveThirtyDays: thirties,
      inactiveSixtyDays: sixties,
      inactiveNinetyDays: nineties,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateVolunteerReferenceSentById(
  referenceId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerReferenceSentById.run(
      {
        referenceId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerReferenceStatusById(
  referenceId: Ulid,
  status: string
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerReferenceStatusById.run(
      {
        referenceId,
        status: status.toLowerCase(),
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerPending(
  userId: Ulid,
  approved: boolean,
  photoIdStatus: string
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerPending.run(
      { userId, approved, status: photoIdStatus.toLowerCase() },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function deleteVolunteerReferenceByEmail(
  userId: Ulid,
  referenceEmail: string
): Promise<void> {
  try {
    const result = await pgQueries.deleteVolunteerReferenceById.run(
      {
        userId,
        referenceEmail: referenceEmail.toLowerCase(),
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteersReadyToCoachByIds(
  userIds: Ulid[]
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteersReadyToCoachByIds.run(
      {
        userIds,
      },
      getClient()
    )
    const errors: string[] = []
    for (const row of result) {
      try {
        if (!makeRequired(row).ok)
          throw new Error('Updated row did not return ok')
      } catch (err) {
        errors.push((err as Error).message)
      }
    }
    if (errors.length) throw new RepoUpdateError(errors.join('\n'))
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerElapsedAvailabilityById(
  userId: Ulid,
  elapsedAvailability: number
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerElapsedAvailabilityById.run(
      {
        userId,
        elapsedAvailability,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerTotalHoursById(
  userId: Ulid,
  totalHours: number
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerTotalHoursById.run(
      {
        userId,
        totalHours: String(totalHours),
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export type TrainingCourse = {
  userId: Ulid
  complete: boolean
  trainingCourse: string
  progress: number
  completedMaterials: string[]
  createdAt: Date
  updatedAt: Date
  // legacy names for frontend
  isComplete: boolean
}
type VolunteerTrainingCourses = { [key: string]: TrainingCourse }
export async function getVolunteerTrainingCourses(
  userId: Ulid,
  tc?: TransactionClient
): Promise<VolunteerTrainingCourses> {
  try {
    const result = await pgQueries.getVolunteerTrainingCourses.run(
      { userId },
      tc ?? getClient()
    )
    const map: VolunteerTrainingCourses = {}
    for (const row of result) {
      const temp = { ...makeRequired(row) }
      map[temp.trainingCourse] = {
        ...temp,
        isComplete: temp.complete,
      }
    }
    return map
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateVolunteerTrainingById(
  userId: Ulid,
  trainingCourse: string,
  requiredMaterialKeys: string[],
  materialKey: string,
  tc?: TransactionClient
): Promise<UserTrainingCourse> {
  try {
    const results = await pgQueries.updateVolunteerTrainingById.run(
      {
        userId,
        trainingCourse,
        requiredMaterialKeys,
        materialKey,
      },
      tc ?? getClient()
    )
    if (!results.length)
      throw new RepoUpdateError('Update query did not return ok')
    return makeRequired(results[0])
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerPhotoIdById(
  userId: Ulid,
  key: string,
  status: PHOTO_ID_STATUS
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerPhotoIdById.run(
      {
        userId,
        key,
        status,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerSentInactive30DayEmail(
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerSentInactive30DayEmail.run(
      {
        userId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerSentInactive60DayEmail(
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerSentInactive60DayEmail.run(
      {
        userId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerSentInactive90DayEmail(
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerSentInactive90DayEmail.run(
      {
        userId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export type UnsentReference = {
  id: Ulid
  firstName: string
  lastName: string
  email: string
}
export type VolunteersForEmailReference = VolunteerContactInfo & {
  references: UnsentReference[]
}
export async function getVolunteersForEmailReference(): Promise<
  VolunteersForEmailReference[]
> {
  try {
    const result = await pgQueries.getVolunteerUnsentReferences.run(
      undefined,
      getClient()
    )
    const references = result.map((v) => makeRequired(v))
    const volunteers = await getVolunteerContactInfoByIds(
      references.map((v) => v.userId)
    )
    const map: VolunteerTypeMap<(typeof references)[number][]> = _.groupBy(
      references,
      (v) => v.userId
    )
    return volunteers.map((v) => {
      const references = []
      for (const ref of map[v.id]) {
        references.push({
          id: ref.id,
          firstName: ref.firstName,
          lastName: ref.lastName,
          email: ref.email.toLowerCase(),
        })
      }
      return {
        ...v,
        references: references,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: remove once job is executed
export async function getVolunteersForEmailReferenceApology(): Promise<
  VolunteersForEmailReference[]
> {
  try {
    const result = await pgQueries.getReferencesForReferenceFormApology.run(
      undefined,
      getClient()
    )
    const references = result.map((v) => makeRequired(v))
    const volunteers = await getVolunteerContactInfoByIds(
      references.map((v) => v.userId)
    )
    const map: VolunteerTypeMap<(typeof references)[number][]> = _.groupBy(
      references,
      (v) => v.userId
    )
    return volunteers.map((v) => {
      const references = []
      for (const ref of map[v.id]) {
        references.push({
          id: ref.id,
          firstName: ref.firstName,
          lastName: ref.lastName,
          email: ref.email.toLowerCase(),
        })
      }
      return {
        ...v,
        references: references,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type ReferenceContactInfo = {
  id: Ulid
  status: string
  email: string
  firstName: string
  lastName: string
  affiliation?: string
  additionalInfo?: string
  agreeableAndApproachable?: number
  communicatesEffectively?: number
  patient?: number
  positiveRoleModel?: number
  rejectionReason?: string
  relationshipLength?: string
  trustworthyWithChildren?: number
}

export async function getReferencesByVolunteer(
  userId: Ulid,
  poolClient?: TransactionClient
): Promise<ReferenceContactInfo[]> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getReferencesByVolunteer.run(
      { userId },
      client
    )
    return result.map((v) => {
      const ret = makeRequired(v)
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getReferencesByVolunteerForAdminDetail(
  userId: Ulid,
  poolClient?: PoolClient
): Promise<ReferenceContactInfo[]> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getReferencesByVolunteerForAdminDetail.run(
      { userId },
      client
    )
    return result.map((v) => {
      const ret = makeSomeRequired(v, [
        'id',
        'firstName',
        'lastName',
        'status',
        'email',
      ])
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type ReferenceWithUserActions = ReferenceContactInfo & {
  actions: string[]
}

export async function checkReferenceExistsBeforeAdding(
  userId: Ulid,
  email: string
): Promise<ReferenceWithUserActions | undefined> {
  try {
    const result = await pgQueries.checkReferenceExistsBeforeAdding.run(
      { userId, email: email.toLowerCase() },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForPendingStatus = VolunteerContactInfo & {
  occupations: string[]
  country?: string
  photoIdStatus: string
  approved: boolean
  onboarded: boolean
  references: ReferenceContactInfo[]
}

export async function getVolunteerForPendingStatus(
  userId: Ulid
): Promise<VolunteerForPendingStatus | undefined> {
  try {
    const result = await pgQueries.getVolunteerForPendingStatus.run(
      { userId },
      getClient()
    )
    if (!result.length) return
    const volunteer = makeSomeOptional(result[0], [
      'country',
      'volunteerPartnerOrg',
    ])
    volunteer.email = volunteer.email.toLowerCase()
    const references = await getReferencesByVolunteer(userId)
    return {
      ...volunteer,
      references,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateVolunteerReferenceStatus(
  referenceId: Ulid,
  status: string
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerReferenceStatus.run(
      { referenceId, status },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerApproved(userId: Ulid): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerApproved.run(
      { userId },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerOnboarded(
  userId: Ulid,
  tc: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerOnboarded.run(
      { userId },
      tc ?? getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getVolunteersForNiceToMeetYou(
  start: Date,
  end: Date
): Promise<VolunteerContactInfo[]> {
  try {
    const result = await pgQueries.getVolunteersForNiceToMeetYou.run(
      { start, end },
      getClient()
    )
    return result.map((v) => {
      const ret = makeSomeOptional(v, ['volunteerPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersForReadyToCoach(): Promise<
  VolunteerContactInfo[]
> {
  try {
    const result = await pgQueries.getVolunteersForReadyToCoach.run(
      undefined,
      getClient()
    )
    return result.map((v) => {
      const ret = makeSomeOptional(v, ['volunteerPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersForWaitingReferences(
  start: Date,
  end: Date
): Promise<VolunteerContactInfo[]> {
  try {
    const result = await pgQueries.getVolunteersForWaitingReferences.run(
      { start, end },
      getClient()
    )
    return result.map((v) => {
      const ret = makeSomeOptional(v, ['volunteerPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function addVolunteerCertification(
  userId: Ulid,
  subject: string,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.addVolunteerCertification.run(
      { userId, subject },
      tc ?? getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerQuiz(
  userId: Ulid,
  quiz: string,
  passed: boolean,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerQuiz.run(
      { userId, quiz, passed },
      tc ?? getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type CreateVolunteerPayload = {
  email: string
  phone: string
  firstName: string
  lastName: string
  password: string
  referredBy: Ulid | undefined
  volunteerPartnerOrg: string | undefined
  timezone: string | undefined
  signupSourceId?: number
  otherSignupSource?: string
}
export type CreatedVolunteer = Omit<VolunteerContactInfo, 'roleContext'> & {
  deactivated: boolean
  testUser: boolean
  createdAt: Date
  isVolunteer: boolean
  isAdmin: boolean
  banType?: USER_BAN_TYPES
  signupSourceId?: number
  otherSignupSource?: string
  userType: UserRole
}

export async function createVolunteerProfile(
  userId: Ulid,
  {
    timezone,
    partnerOrgId,
  }: {
    timezone: string | null
    partnerOrgId: string | null
  },
  tc?: TransactionClient
) {
  try {
    const profileResult = await pgQueries.createVolunteerProfile.run(
      {
        userId,
        timezone,
        partnerOrgId,
      },
      tc ?? getClient()
    )
    if (!profileResult.length)
      throw new Error(
        'Failed to create volunteer profile: Insert did not return new row'
      )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createVolunteer(
  volunteerData: CreateVolunteerPayload
): Promise<CreatedVolunteer> {
  const client = await getClient().connect()
  try {
    volunteerData.email = volunteerData.email.toLowerCase()
    const partnerOrg = volunteerData.volunteerPartnerOrg
      ? await getPartnerOrgByKey(volunteerData.volunteerPartnerOrg, client)
      : undefined
    await client.query('BEGIN')
    const userId = getDbUlid()
    const userResult = await pgQueries.createVolunteerUser.run(
      {
        userId,
        referralCode: generateReferralCode(userId),
        ...volunteerData,
        signupSourceId: volunteerData.signupSourceId,
        otherSignupSource: volunteerData.otherSignupSource,
      },
      client
    )
    if (!userResult.length && makeRequired(userResult[0]).id)
      throw new Error('Insert query did not return new row')
    const user = makeSomeOptional(userResult[0], ['banType'])
    await createVolunteerProfile(
      userId,
      {
        timezone: volunteerData.timezone ?? null,
        partnerOrgId: partnerOrg?.partnerId ?? null,
      },
      client
    )

    if (partnerOrg) {
      const vpoInstanceResult =
        await pgQueries.createUserVolunteerPartnerOrgInstance.run(
          {
            userId,
            vpoName: partnerOrg.partnerName,
          },
          client
        )
      if (!makeRequired(vpoInstanceResult)[0].ok)
        throw new RepoCreateError(
          'Could not create volunteer: user partner org instance creation did not return rows'
        )
    }
    await client.query('COMMIT')
    await insertUserRoleByUserId(userId, USER_ROLES.VOLUNTEER, client)
    return {
      ...user,
      volunteerPartnerOrg: volunteerData.volunteerPartnerOrg,
      isVolunteer: true,
      userType: 'volunteer',
      isAdmin: false,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoCreateError(err)
  } finally {
    client.release()
  }
}
export type VolunteerForTextResponse = {
  volunteerId: Ulid
  sessionId: Ulid
  endedAt?: Date
  volunteerJoinedAt: Date
  subject: string
  topic: string
}
export async function getVolunteerForTextResponse(
  phone: string
): Promise<VolunteerForTextResponse | undefined> {
  try {
    const result = await pgQueries.getVolunteerForTextResponse.run(
      { phone },
      getClient()
    )
    if (!result.length) return
    return makeSomeOptional(result[0], ['endedAt'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerPartnerOrgByKey = {
  partnerId: Ulid
  partnerKey: string
  partnerName: string
}

export async function getPartnerOrgByKey(
  partnerKey: string | undefined,
  client: TransactionClient
): Promise<VolunteerPartnerOrgByKey | undefined> {
  if (!partnerKey) return
  try {
    const result = await pgQueries.getPartnerOrgByKey.run(
      {
        partnerOrgKey: partnerKey,
      },
      client
    )
    return result.length ? makeRequired(result[0]) : undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// if partnerOrg isnt provided then remove partnerOrg entirely
// all other fields override
export type AdminUpdateVolunteer = {
  firstName: string | undefined
  lastName: string | undefined
  email: string
  volunteerPartnerOrg: string | undefined
  isVerified: boolean
  banType: USER_BAN_TYPES | undefined
  isDeactivated: boolean
  isApproved: boolean | undefined
}

async function adminUpdateVolunteerPartnerOrgInstance(
  volunteerId: Ulid,
  newPartnerOrgKey: string | undefined,
  client: TransactionClient
) {
  try {
    const newPartnerOrg = await getPartnerOrgByKey(newPartnerOrgKey, client)
    if (newPartnerOrgKey && !newPartnerOrg)
      throw new Error(`New partner org ${newPartnerOrgKey} does not exist`)

    const activePartnerOrgInstanceResults =
      await pgQueries.getPartnerOrgsByVolunteer.run({ volunteerId }, client)
    const activePartnerOrgInstances = activePartnerOrgInstanceResults.map((v) =>
      makeRequired(v)
    )

    // volunteers should not have more than one partner org
    if (activePartnerOrgInstances.length > 1)
      throw new Error(
        `Volunteer ${volunteerId} has more than 1 partner org; cannot update`
      )

    const activeOrgInstance = activePartnerOrgInstances[0]

    /**
     *
     * We attempt to deactive the active instance in two cases:
     * 1. We're removing a partner org and there is an active instance
     * 2. We're changing the partner org and there is an active instance
     *
     */
    if (
      (activeOrgInstance && !newPartnerOrg) ||
      (activeOrgInstance &&
        newPartnerOrg &&
        activeOrgInstance.name !== newPartnerOrg.partnerName)
    ) {
      const updateResult =
        await pgQueries.adminDeactivateVolunteerPartnershipInstance.run(
          { userId: volunteerId, vpoId: activeOrgInstance.id },
          client
        )
      if (!makeRequired(updateResult[0]).ok)
        throw new Error(
          `Deactivating active partner org instance failed for volunteer ${volunteerId}`
        )
    }

    /**
     *
     * We attempt to add a new active org instance in two cases:
     * 1. We're adding a new partner org and there is no active instance
     * 2. We're changing the partner org
     *
     */
    if (
      (!activeOrgInstance && newPartnerOrg) ||
      (activeOrgInstance &&
        newPartnerOrg &&
        activeOrgInstance.name !== newPartnerOrg.partnerName)
    ) {
      const insertResult =
        await pgQueries.createUserVolunteerPartnerOrgInstance.run(
          {
            userId: volunteerId,
            vpoName: newPartnerOrg.partnerName,
          },
          client
        )
      if (!makeRequired(insertResult[0]).ok)
        throw new Error(
          `Inserting new partner org instance failed for volunteer ${volunteerId}`
        )
    }
  } catch (err) {
    throw new RepoReadError(`Could not update volunteer partner org: ${err}`)
  }
}

export async function updateVolunteerForAdmin(
  userId: Ulid,
  update: AdminUpdateVolunteer,
  tc?: TransactionClient
): Promise<void> {
  return runInTransaction(async (client) => {
    try {
      const partnerOrgId = update.volunteerPartnerOrg
        ? await getVolunteerPartnerOrgIdByKey(
            update.volunteerPartnerOrg,
            client
          )
        : undefined
      const userResult = await pgQueries.updateVolunteerUserForAdmin.run(
        {
          userId,
          firstName: update.firstName,
          lastName: update.lastName,
          email: update.email.toLowerCase(),
          isVerified: update.isVerified,
          banType: update.banType,
          isDeactivated: update.isDeactivated,
        },
        client
      )
      const profileResult = await pgQueries.updateVolunteerProfilesForAdmin.run(
        {
          userId,
          approved: update.isApproved,
          partnerOrgId,
        },
        client
      )

      await adminUpdateVolunteerPartnerOrgInstance(
        userId,
        update.volunteerPartnerOrg,
        client
      )

      if (
        !(
          userResult.length &&
          profileResult.length &&
          makeRequired(userResult[0]).ok &&
          makeRequired(profileResult[0]).ok
        )
      )
        throw new RepoUpdateError('update query did not return ok')
    } catch (err) {
      throw new RepoUpdateError(err)
    }
  }, tc ?? getClient())
}

export type VolunteerToReview = {
  id: Ulid
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  readyForReviewAt: Date
}
export async function getVolunteersToReview(
  limit: number,
  offset: number
): Promise<VolunteerToReview[]> {
  try {
    const result = await pgQueries.getVolunteersToReview.run(
      { limit, offset },
      getClient()
    )
    return result.map((v) => {
      const ret = makeRequired(v)
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type ReferencesToEmail = {
  referenceEmail: string
  referenceFirstName: string
  referenceId: string
  referenceLastName: string
  volunteerFirstName: string
  volunteerId: string
  volunteerLastName: string
}
export async function getReferencesToFollowup(
  start: Date,
  end: Date
): Promise<ReferencesToEmail[]> {
  try {
    const result = await pgQueries.getReferencesToFollowup.run(
      { start, end },
      getClient()
    )
    return result.map((v) => {
      const ret = makeRequired(v)
      ret.referenceEmail = ret.referenceEmail.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizzesPassedForDateRange(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<number> {
  try {
    const result = await pgQueries.getQuizzesPassedForDateRange.run(
      { userId, start, end },
      getClient()
    )
    return makeRequired(result[0]).total
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type BackgroundInfo = {
  approved: boolean | undefined
  occupation: string[] | undefined
  languages: string[] | undefined
  city: string | undefined
  state: string | undefined
  country: string | undefined
  experience:
    | {
        collegeCounseling: string
        mentoring: string
        tutoring: string
      }
    | undefined
  company: string | undefined
  college: string | undefined
  linkedInUrl: string | undefined
}

export async function updateVolunteerBackgroundInfo(
  userId: Ulid,
  backgroundInfo: BackgroundInfo
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerBackgroundInfo.run(
      {
        userId,
        ...backgroundInfo,
        occupation: backgroundInfo.occupation
          ? backgroundInfo.occupation.map((v) => ({
              occupation: v,
              userId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }))
          : [],
      },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getNextVolunteerToNotify(options: {
  subject: string
  lastNotified: Date
  isPartner: boolean | undefined
  highLevelSubjects: string[] | undefined
  disqualifiedVolunteers: Ulid[] | undefined
  specificPartner: string | undefined
  favoriteVolunteers: Ulid[] | undefined
}): Promise<VolunteerContactInfo | undefined> {
  try {
    const result = await pgQueries.getNextVolunteerToNotify.run(
      options,
      getRoClient()
    )
    if (!result.length) return
    return makeSomeOptional(result[0], ['volunteerPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function checkIfVolunteerMutedSubject(
  userId: Ulid,
  subjectName: string
): Promise<boolean | undefined> {
  try {
    const result = await pgQueries.checkIfVolunteerMutedSubject.run(
      { userId, subjectName },
      getClient()
    )
    return result.length ? true : false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForScheduleUpdate = {
  id: Ulid
  volunteerPartnerOrg?: string
  onboarded: boolean
  availability: Availability
  subjects?: string[]
  passedRequiredTraining: boolean
}
export async function getVolunteerForScheduleUpdate(
  userId: Ulid,
  tc: TransactionClient
): Promise<VolunteerForScheduleUpdate> {
  try {
    const result = await pgQueries.getVolunteerForScheduleUpdate.run(
      { userId },
      tc
    )
    if (!result.length) throw new RepoReadError('Volunteer not found')
    const volunteer = makeSomeOptional(result[0], [
      'volunteerPartnerOrg',
      'subjects',
    ])
    const availability = await getAvailabilityForVolunteer(volunteer.id, tc)
    return {
      ...volunteer,
      availability,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersOnDeck(
  subject: string,
  excludedIds: Ulid[]
): Promise<VolunteerContactInfo[]> {
  try {
    const result = await pgQueries.getVolunteersOnDeck.run(
      { subject, excludedIds },
      getClient()
    )
    return result.map((v) => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: break out anything that uses RO client into their own repo
export async function getUniqueStudentsHelpedForAnalyticsReportSummary(
  volunteerPartnerOrg: string,
  start: Date,
  end: Date
): Promise<UniqueStudentsHelped> {
  try {
    const associatedPartners =
      await getAssociatedPartnersAndSchools(volunteerPartnerOrg)
    const result =
      await pgQueries.getUniqueStudentsHelpedForAnalyticsReportSummary.run(
        {
          volunteerPartnerOrg,
          start,
          end,
          studentPartnerOrgIds: associatedPartners.associatedStudentPartnerOrgs,
          studentSchoolIds: associatedPartners.associatedPartnerSchools,
        },
        getRoClient()
      )
    if (!(result.length && makeRequired(result[0])))
      throw new Error(
        `no volunteer partner org found with key ${volunteerPartnerOrg}`
      )
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: break out anything that uses RO client into their own repo

/**
 * Get the next batch of volunteers for the analytics report.
 * Uses cursor pagination on user ID (ULID).
 */
export async function getVolunteersForAnalyticsReport(
  volunteerPartnerOrg: string,
  start: Date,
  end: Date,
  associatedPartners: AssociatedPartnersAndSchools,
  pageSize: number,
  cursor: Ulid | null
): Promise<VolunteersForAnalyticsReport[]> {
  try {
    const result = await pgQueries.getVolunteersForAnalyticsReport.run(
      {
        volunteerPartnerOrg,
        start,
        end,
        studentPartnerOrgIds: associatedPartners.associatedStudentPartnerOrgs,
        studentSchoolIds: associatedPartners.associatedPartnerSchools,
        pageSize,
        cursor,
      },
      getAnalyticsClient()
    )

    if (!result.length) {
      throw new ReportNoDataFoundError('No volunteers found for partner org')
    }

    const volunteers = result.map((row) => {
      const temp = makeSomeOptional(row, [
        'state',
        'dateOnboarded',
        'availabilityLastModifiedAt',
      ])
      return {
        ...temp,
        // manually parse out incoming bigint to number
        totalPartnerTimeTutored: Number(temp.totalPartnerTimeTutored),
        totalPartnerTimeTutoredWithinRange: Number(
          temp.totalPartnerTimeTutoredWithinRange
        ),
      } as VolunteersForAnalyticsReport
    })
    return volunteers
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getActiveSponsorshipsByUserId(
  userId: Ulid,
  tc: TransactionClient = getRoClient()
): Promise<Sponsorship[]> {
  try {
    const result = await pgQueries.getActiveSponsorshipsByUserId.run(
      { userId },
      tc
    )
    return result.map((v) => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerSubjects(
  userId: Uuid,
  tc?: TransactionClient
): Promise<VolunteerSubject[]> {
  try {
    const result = await pgQueries.getVolunteerSubjects.run(
      { userId },
      tc ?? getClient()
    )
    if (result.length) return result.map((row) => makeRequired(row))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerMutedSubjects(
  userId: Uuid,
  tc?: TransactionClient
): Promise<VolunteerSubject[]> {
  try {
    const result = await pgQueries.getVolunteerMutedSubjects.run(
      { userId },
      tc ?? getClient()
    )
    if (result.length) return result.map((row) => makeRequired(row))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
