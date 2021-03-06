import { getClient, getRoClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeRequired,
  Ulid,
  getDbUlid,
  generateReferralCode,
  makeSomeOptional,
} from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { Availability } from '../Availability/types'
import { getAvailabilityForVolunteer } from '../Availability'
import { Quizzes, VolunteersForAnalyticsReport } from './types'
import config from '../../config'
import _ from 'lodash'
import { PHOTO_ID_STATUS } from '../../constants'
import { PoolClient } from 'pg'
import { getAssociatedPartnersAndSchools } from '../AssociatedPartner'
import { UniqueStudentsHelped } from '.'
import { isPgId } from '../../utils/type-utils'

export type VolunteerContactInfo = {
  id: Ulid
  email: string
  phone: string
  firstName: string
  lastName: string
  volunteerPartnerOrg?: string
}

export async function getVolunteerContactInfoById(
  userId: Ulid
): Promise<VolunteerContactInfo | undefined> {
  try {
    const result = await pgQueries.getVolunteerContactInfoById.run(
      { userId },
      getClient()
    )
    if (!result.length) return
    return makeSomeRequired(result[0], ['volunteerPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSubjectsForVolunteer(userId: Ulid) {
  try {
    const result = await pgQueries.getSubjectsForVolunteer.run(
      { userId },
      getClient()
    )
    const subjects = result.map(v => makeRequired(v).subject)
    return subjects
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerContactInfoByIds(
  userIds: Ulid[]
): Promise<VolunteerContactInfo[]> {
  try {
    const result = await pgQueries.getVolunteerContactInfoByIds.run(
      { userIds },
      getClient()
    )
    return result.map(v => makeSomeRequired(v, ['volunteerPartnerOrg']))
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
    return result.map(v => makeSomeRequired(v, ['volunteerPartnerOrg']))
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
    const volunteer = makeSomeRequired(vResult[0], ['volunteerPartnerOrg'])
    const availability = await getAvailabilityForVolunteer(userId)
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
  poolClient?: PoolClient
): Promise<VolunteerQuizMap> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getQuizzesForVolunteers.run(
      { userIds },
      client
    )
    const rows = result.map(v => makeRequired(v))
    const rowsByUser = _.groupBy(rows, v => v.userId)
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

export type VolunteerForWeeklyHourSummary = VolunteerContactInfo & {
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
    const rows = result.map(v =>
      makeSomeRequired(v, ['volunteerPartnerOrg', 'sentHourSummaryIntroEmail'])
    )
    const quizzes = await getQuizzesForVolunteers(rows.map(v => v.id))
    return rows.map(v => ({
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

export async function updateVolunteerThroughAvailability(
  userId: Ulid,
  timezone?: string,
  onboarded?: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerThroughAvailability.run(
      { userId, onboarded, timezone },
      getClient()
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
    return result.map(v => makeRequired(v).userId)
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
    const rows = result.map(v => makeRequired(v))
    const quizzes = await getQuizzesForVolunteers(rows.map(v => v.id))
    return rows.map(v => ({
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
  hasCompletedUpchieve101: boolean
  subjects: string[]
  availabilityLastModifiedAt?: Date
  country?: string
}
export async function getVolunteerForOnboardingById(
  userId: Ulid
): Promise<VolunteerForOnboarding | undefined> {
  try {
    const result = await pgQueries.getVolunteerForOnboardingById.run(
      {
        userId: isPgId(userId) ? userId : undefined,
        mongoUserId: isPgId(userId) ? undefined : userId,
      },
      getClient()
    )
    if (!result.length) return
    const volunteer = makeSomeRequired(result[0], [
      'availabilityLastModifiedAt',
      'country',
    ])
    const trainingCourses = await getVolunteerTrainingCourses(volunteer.id)

    return {
      ...volunteer,
      hasCompletedUpchieve101: !!trainingCourses['upchieve101']?.complete,
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
      getRoClient()
    )
    const rows = result.map(v => makeSomeRequired(v, ['volunteerPartnerOrg']))
    const quizzes = await getQuizzesForVolunteers(rows.map(v => v.id))
    return rows.map(v => ({
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
    return result.map(v => makeRequired(v).id)
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
    return result.map(v => makeRequired(v).userId)
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
    return makeRequired(result[0])
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
    const thirties = thirtyResult.map(v =>
      makeSomeRequired(v, ['volunteerPartnerOrg'])
    )
    const sixtyResult = await pgQueries.getInactiveVolunteers.run(
      { start: sixtyDaysAgoStartOfDay, end: sixtyDaysAgoEndOfDay },
      getClient()
    )
    const sixties = sixtyResult.map(v =>
      makeSomeRequired(v, ['volunteerPartnerOrg'])
    )
    const ninetyResult = await pgQueries.getInactiveVolunteers.run(
      { start: ninetyDaysAgoStartOfDay, end: ninetyDaysAgoEndOfDay },
      getClient()
    )
    const nineties = ninetyResult.map(v =>
      makeSomeRequired(v, ['volunteerPartnerOrg'])
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
        referenceEmail,
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
  poolClient?: PoolClient
): Promise<VolunteerTrainingCourses> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getVolunteerTrainingCourses.run(
      { userId },
      client
    )
    const map: VolunteerTrainingCourses = {}
    for (const row of result) {
      const temp = { ...makeRequired(row) }
      map[temp.trainingCourse] = { ...temp, isComplete: temp.complete }
    }
    return map
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateVolunteerTrainingById(
  userId: Ulid,
  trainingCourse: string,
  complete: boolean,
  progress: number,
  materialKey: string
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerTrainingById.run(
      {
        userId,
        trainingCourse,
        complete,
        progress,
        materialKey,
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

export async function updateVolunteerProfileById(
  userId: Ulid,
  deactivated?: boolean,
  phone?: string
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerProfileById.run(
      {
        userId,
        deactivated,
        phone,
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
    const references = result.map(v => makeRequired(v))
    const volunteers = await getVolunteerContactInfoByIds(
      references.map(v => v.userId)
    )
    const map: VolunteerTypeMap<typeof references[number][]> = _.groupBy(
      references,
      v => v.userId
    )
    return volunteers.map(v => {
      const references = []
      for (const ref of map[v.id]) {
        references.push({
          id: ref.id,
          firstName: ref.firstName,
          lastName: ref.lastName,
          email: ref.email,
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
    const references = result.map(v => makeRequired(v))
    const volunteers = await getVolunteerContactInfoByIds(
      references.map(v => v.userId)
    )
    const map: VolunteerTypeMap<typeof references[number][]> = _.groupBy(
      references,
      v => v.userId
    )
    return volunteers.map(v => {
      const references = []
      for (const ref of map[v.id]) {
        references.push({
          id: ref.id,
          firstName: ref.firstName,
          lastName: ref.lastName,
          email: ref.email,
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
  poolClient?: PoolClient
): Promise<ReferenceContactInfo[]> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getReferencesByVolunteer.run(
      { userId },
      client
    )
    return result.map(v => makeRequired(v))
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
    return result.map(v =>
      makeSomeOptional(v, ['id', 'firstName', 'lastName', 'status', 'email'])
    )
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
      { userId, email },
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
    const volunteer = makeSomeRequired(result[0], [
      'country',
      'volunteerPartnerOrg',
    ])
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

export async function updateVolunteerOnboarded(userId: Ulid): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerOnboarded.run(
      { userId },
      getClient()
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
    return result.map(v => makeSomeRequired(v, ['volunteerPartnerOrg']))
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
    return result.map(v => makeSomeRequired(v, ['volunteerPartnerOrg']))
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
    return result.map(v => makeSomeRequired(v, ['volunteerPartnerOrg']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function addVolunteerCertification(
  userId: Ulid,
  subject: string
): Promise<void> {
  try {
    const result = await pgQueries.addVolunteerCertification.run(
      { userId, subject },
      getClient()
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
  passed: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateVolunteerQuiz.run(
      { userId, quiz, passed },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getVolunteersAdminAvailability(
  subject: string
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getVolunteersAdminAvailability.run(
      { subject },
      getClient()
    )
    return result.map(v => makeRequired(v).id)
  } catch (err) {
    throw new RepoReadError(err)
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
}
export type CreatedVolunteer = VolunteerContactInfo & {
  deactivated: boolean
  testUser: boolean
  createdAt: Date
  isVolunteer: boolean
  isAdmin: boolean
  banned: boolean
}
export async function createVolunteer(
  volunteerData: CreateVolunteerPayload
): Promise<CreatedVolunteer> {
  const client = await getClient().connect()
  try {
    const partnerOrgId = volunteerData.volunteerPartnerOrg
      ? await getVolunteerPartnerOrgIdByKey(volunteerData.volunteerPartnerOrg)
      : undefined
    await client.query('BEGIN')
    const userId = getDbUlid()
    const userResult = await pgQueries.createVolunteerUser.run(
      {
        userId,
        referralCode: generateReferralCode(userId),
        ...volunteerData,
      },
      client
    )
    if (!userResult.length && makeRequired(userResult[0]).id)
      throw new Error('Insert query did not return new row')
    const user = makeRequired(userResult[0])
    const profileResult = await pgQueries.createVolunteerProfile.run(
      {
        userId: user.id,
        timezone: volunteerData.timezone,
        partnerOrgId,
      },
      client
    )
    if (!profileResult.length && makeRequired(profileResult[0]).ok)
      throw new Error('Insert query did not return new row')
    await client.query('COMMIT')
    return {
      ...user,
      volunteerPartnerOrg: volunteerData.volunteerPartnerOrg,
      isVolunteer: true,
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
    return makeSomeRequired(result[0], ['endedAt'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerPartnerOrgIdByKey(
  volunteerPartnerOrg: string,
  poolClient?: PoolClient
): Promise<Ulid | undefined> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getVolunteerPartnerOrgIdByKey.run(
      { volunteerPartnerOrg },
      client
    )
    if (!result.length) return
    return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// if partnerOrg isnt provided then remove partnerOrg entirely
// all other fields override
export type AdminUpdateVolunteer = {
  firstName: string
  lastName: string
  email: string
  volunteerPartnerOrg: string | undefined
  isVerified: boolean
  isBanned: boolean
  isDeactivated: boolean
  isApproved: boolean | undefined
}
export async function updateVolunteerForAdmin(
  userId: Ulid,
  update: AdminUpdateVolunteer
): Promise<void> {
  const client = await getClient().connect()
  try {
    const partnerOrgId = update.volunteerPartnerOrg
      ? await getVolunteerPartnerOrgIdByKey(update.volunteerPartnerOrg)
      : undefined
    await client.query('BEGIN')
    const userResult = await pgQueries.updateVolunteerUserForAdmin.run(
      {
        userId,
        firstName: update.firstName,
        lastName: update.lastName,
        email: update.email,
        isVerified: update.isVerified,
        isBanned: update.isBanned,
        isDeactivated: update.isDeactivated,
      },
      client
    )
    const profileResult = await pgQueries.updateVolunteerProfilesForAdmin.run(
      {
        userId,
        partnerOrgId,
        approved: update.isApproved,
      },
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
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoUpdateError(err)
  } finally {
    client.release()
  }
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
    return result.map(v => makeRequired(v))
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
    return result.map(v => makeRequired(v))
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
          ? backgroundInfo.occupation.map(v => ({
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
      getClient()
    )
    if (!result.length) return
    return makeSomeRequired(result[0], ['volunteerPartnerOrg'])
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
  userId: Ulid
): Promise<VolunteerForScheduleUpdate> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getVolunteerForScheduleUpdate.run(
      { userId },
      client
    )
    if (!result.length) throw new RepoReadError('Volunteer not found')
    const volunteer = makeSomeRequired(result[0], [
      'volunteerPartnerOrg',
      'subjects',
    ])
    const availability = await getAvailabilityForVolunteer(volunteer.id, client)
    return {
      ...volunteer,
      availability,
    }
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
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
    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function removeOnboardedStatusForUnqualifiedVolunteers(): Promise<
  void
> {
  try {
    await pgQueries.removeOnboardedStatusForUnqualifiedVolunteers.run(
      undefined,
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

// TODO: break out anything that uses RO client into their own repo
export async function getUniqueStudentsHelpedForAnalyticsReportSummary(
  volunteerPartnerOrg: string,
  start: Date,
  end: Date
): Promise<UniqueStudentsHelped> {
  try {
    const associatedPartners = await getAssociatedPartnersAndSchools(
      volunteerPartnerOrg
    )
    const result = await pgQueries.getUniqueStudentsHelpedForAnalyticsReportSummary.run(
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
export async function getVolunteersForAnalyticsReport(
  volunteerPartnerOrg: string,
  start: Date,
  end: Date
): Promise<VolunteersForAnalyticsReport[] | undefined> {
  try {
    const associatedPartners = await getAssociatedPartnersAndSchools(
      volunteerPartnerOrg
    )
    const result = await pgQueries.getVolunteersForAnalyticsReport.run(
      {
        volunteerPartnerOrg,
        start,
        end,
        studentPartnerOrgIds: associatedPartners.associatedStudentPartnerOrgs,
        studentSchoolIds: associatedPartners.associatedPartnerSchools,
      },
      getRoClient()
    )

    if (!result.length)
      throw new Error(
        `no volunteer partner org found with key ${volunteerPartnerOrg}`
      )

    return result.map(row => {
      const temp = makeSomeRequired(row, [
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
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}
