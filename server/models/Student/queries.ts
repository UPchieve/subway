import { PoolClient } from 'pg'
import {
  getAnalyticsClient,
  getClient,
  runInTransaction,
  TransactionClient,
} from '../../db'
import { isPgId } from '../../utils/type-utils'
import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoTransactionError,
  RepoUpdateError,
  RepoUpsertError,
} from '../Errors'
import {
  generateReferralCode,
  getDbUlid,
  makeRequired,
  makeSomeRequired,
  makeSomeOptional,
  Ulid,
  Uuid,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import * as SchoolRepo from '../School/queries'
import { USER_BAN_TYPES, USER_ROLES } from '../../constants'
import { insertUserRoleByUserId } from '../User'
import {
  CreatedStudent,
  CreateStudentPayload,
  CreateStudentProfilePayload,
  Student,
  StudentContactInfo,
  StudentUserProfile,
} from './types'

export type StudentPartnerInfo = {
  id: Ulid
  studentPartnerOrg?: string
  approvedHighschool?: Ulid
}

export async function getStudentPartnerInfoById(
  studentId: Ulid
): Promise<StudentPartnerInfo | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerInfoById.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length)
      return makeSomeOptional(result[0], [
        'studentPartnerOrg',
        'approvedHighschool',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentContactInfoById(
  studentId: Ulid
): Promise<StudentContactInfo | undefined> {
  try {
    const result = await pgQueries.getStudentContactInfoById.run(
      {
        userId: isPgId(studentId) ? studentId : undefined,
        mongoUserId: isPgId(studentId) ? undefined : studentId,
      },
      getClient()
    )
    if (result.length) {
      const ret = makeSomeOptional(result[0], ['schoolId', 'studentPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentByEmail(
  email: string,
  tc: TransactionClient
): Promise<{ id: Ulid } | undefined> {
  try {
    const result = await pgQueries.getStudentByEmail.run(
      {
        email,
      },
      tc
    )
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isTestUser(
  studentId: Ulid,
  tc: TransactionClient = getClient()
): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run(
      {
        userId: studentId,
      },
      tc
    )
    if (result.length) return makeRequired(result[0]).testUser
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type GatesStudent = {
  id: Ulid
  studentPartnerOrg?: string
  currentGrade: string
  isPartnerSchool: boolean
  approvedHighschool: Ulid
}

export async function getGatesStudentById(
  userId: Ulid
): Promise<GatesStudent | undefined> {
  try {
    const result = await pgQueries.getGatesStudentById.run(
      { userId },
      getClient()
    )
    if (result.length) return makeSomeOptional(result[0], ['studentPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalFavoriteVolunteers(
  userId: Ulid
): Promise<number> {
  try {
    const result = await pgQueries.getTotalFavoriteVolunteers.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<boolean> {
  try {
    const result = await pgQueries.isFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )
    if (result.length && makeRequired(result[0]).volunteerId) return true
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type FavoriteVolunteer = {
  volunteerId: Ulid
  firstName: string
  numSessions: number
}

type FavoriteVolunteersResponse = {
  favoriteVolunteers: FavoriteVolunteer[]
  isLastPage: boolean
}

export type UpdateFavoriteVolunteer = {
  studentId: Ulid
  volunteerId: Ulid
}

export async function getFavoriteVolunteersByStudentId(
  studentId: Ulid
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getFavoriteVolunteersByStudentId.run(
      { studentId },
      getClient()
    )
    return result.map((row) => makeRequired(row).id)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFavoriteVolunteersPaginated(
  studentId: Ulid,
  limit: number,
  offset: number
): Promise<FavoriteVolunteersResponse> {
  try {
    const result = await pgQueries.getFavoriteVolunteersPaginated.run(
      { studentId, limit, offset },
      getClient()
    )
    return {
      favoriteVolunteers: result.map((row) => makeRequired(row)),
      isLastPage: result.length < limit,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid,
  tc?: TransactionClient
): Promise<void> {
  try {
    await pgQueries.deleteFavoriteVolunteer.run(
      { studentId, volunteerId },
      tc ?? getClient()
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function addFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid,
  tc?: TransactionClient
): Promise<{ studentId: Ulid; volunteerId: Ulid } | undefined> {
  try {
    const result = await pgQueries.addFavoriteVolunteer.run(
      { studentId, volunteerId },
      tc ?? getClient()
    )
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function deleteStudent(studentId: Ulid, email: string) {
  try {
    const result = await pgQueries.deleteStudent.run(
      { userId: studentId, email: email.toLowerCase() },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not delete student')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type StudentPartnerOrgByKey = {
  partnerId: Ulid
  partnerKey: string
  partnerName: string
  siteId?: string
  siteName?: string
  schoolId?: Ulid
}

export async function getPartnerOrgByKey(
  partnerKey: string | undefined,
  partnerSite: string | undefined,
  client: TransactionClient
): Promise<StudentPartnerOrgByKey | undefined> {
  try {
    const result = await pgQueries.getPartnerOrgByKey.run(
      {
        partnerOrgKey: partnerKey,
        partnerOrgSiteName: partnerSite,
      },
      client
    )
    return result.length
      ? makeSomeOptional(result[0], ['siteId', 'siteName', 'schoolId'])
      : undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// if partnerOrg isnt provided then remove partnerOrg entirely
// if parttnerSite isnt provided then remove partnerSite entirely
// if gates study isnt provided then dont touch it
// all other fields override
export type AdminUpdateStudent = {
  firstName: string | undefined
  lastName: string | undefined
  email: string
  studentPartnerOrg: string | undefined
  partnerSite: string | undefined
  isVerified: boolean
  banType?: USER_BAN_TYPES
  isDeactivated: boolean
  inGatesStudy: boolean | undefined
  partnerSchool: string | undefined
}

export type StudentPartnerOrgInstance = {
  name: string
  id: Ulid
  schoolId?: Ulid
  siteName?: string
}

async function adminUpdateStudentPartnerOrgInstance(
  studentId: Ulid,
  newPartnerOrgKey: string | undefined,
  newPartnerSite: string | undefined,
  schoolPartnerKey: string | undefined,
  client: TransactionClient
) {
  try {
    const newPartnerOrg = await getPartnerOrgByKey(
      newPartnerOrgKey,
      newPartnerSite,
      client
    )
    if (newPartnerOrgKey && !newPartnerOrg)
      throw new Error(`New partner org ${newPartnerOrgKey} does not exist`)

    const newSchoolOrg = await getPartnerOrgByKey(
      schoolPartnerKey,
      undefined,
      client
    )
    if (schoolPartnerKey && !newSchoolOrg)
      throw new Error(`New school org ${schoolPartnerKey} does not exist`)

    const activePartnerOrgInstanceResults =
      await pgQueries.getPartnerOrgsByStudent.run({ studentId }, client)
    const activePartnerOrgInstances = activePartnerOrgInstanceResults.map((v) =>
      makeSomeOptional(v, ['schoolId', 'siteName'])
    )

    // students may be involved with a partner org and go to a partner school
    if (activePartnerOrgInstances.length > 2)
      throw new Error(
        `Student ${studentId} has more than 2 partner orgs; cannot update`
      )

    let activePartnerInstance: StudentPartnerOrgInstance | undefined
    let activeSchoolInstance: StudentPartnerOrgInstance | undefined

    for (let org of activePartnerOrgInstances) {
      if (org.schoolId) activeSchoolInstance = org
      else activePartnerInstance = org
    }

    /**
     *
     * We attempt to deactive the active (partner org or partner school) instance in two cases:
     * 1. We're removing a partner org and there is an active instance
     * 2. We're changing the partner org OR site and there is an active instance
     *
     */
    if (
      (activePartnerInstance && !newPartnerOrg) ||
      (activePartnerInstance &&
        newPartnerOrg &&
        (activePartnerInstance.name !== newPartnerOrg.partnerName ||
          activePartnerInstance.siteName !== newPartnerOrg.siteName))
    ) {
      const updateResult =
        await pgQueries.adminDeactivateStudentPartnershipInstance.run(
          { userId: studentId, spoId: activePartnerInstance.id },
          client
        )
      if (!makeRequired(updateResult[0]).ok)
        throw new Error(
          `Deactivating active partner org instance failed for student ${studentId}`
        )
    }
    if (
      (activeSchoolInstance && !newSchoolOrg) ||
      (activeSchoolInstance &&
        newSchoolOrg &&
        activeSchoolInstance.name !== newSchoolOrg.partnerName)
    ) {
      const updateResult =
        await pgQueries.adminDeactivateStudentPartnershipInstance.run(
          { userId: studentId, spoId: activeSchoolInstance.id },
          client
        )
      if (!makeRequired(updateResult[0]).ok)
        throw new Error(
          `Deactivating active partner org instance failed for student ${studentId}`
        )
    }

    /**
     *
     * TODO: Remove once the use of `student_partner_org_id` on the `student_profile` table
     *       is no longer needed. This is legacy and is currently here to achieve dual writes
     *
     */
    await pgQueries.adminUpdateStudentProfile.run(
      {
        userId: studentId,
        partnerOrgId: newPartnerOrg ? newPartnerOrg.partnerId : undefined,
        partnerOrgSiteId: newPartnerOrg ? newPartnerOrg.siteId : undefined,
      },
      client
    )

    /**
     *
     * We attempt to add a new active org (partner org or partner school) instance in two cases:
     * 1. We're adding a new partner org and there is no active instance
     * 2. We're changing the partner org OR site
     *
     */
    if (
      (!activePartnerInstance && newPartnerOrg) ||
      (newPartnerOrg &&
        activePartnerInstance &&
        (activePartnerInstance.name !== newPartnerOrg.partnerName ||
          activePartnerInstance.siteName !== newPartnerOrg.siteName))
    ) {
      const insertResult = await pgQueries.insertStudentPartnershipInstance.run(
        {
          userId: studentId,
          partnerOrgId: newPartnerOrg.partnerId,
          partnerOrgSiteId: newPartnerOrg.siteId,
        },
        client
      )
      if (!makeRequired(insertResult[0]).ok)
        throw new Error(
          `Inserting partner org ${newPartnerOrg.partnerId} instance failed for student ${studentId}`
        )
    }

    if (
      (!activeSchoolInstance && newSchoolOrg) ||
      (newSchoolOrg &&
        activeSchoolInstance &&
        activeSchoolInstance.name !== newSchoolOrg.partnerName)
    ) {
      const insertResult = await pgQueries.insertStudentPartnershipInstance.run(
        {
          userId: studentId,
          partnerOrgId: newSchoolOrg.partnerId,
          partnerOrgSiteId: undefined,
        },
        client
      )
      if (!makeRequired(insertResult[0]).ok)
        throw new Error(
          `Inserting school partner org ${newSchoolOrg.partnerId} instance failed for student ${studentId}`
        )

      if (newSchoolOrg.schoolId) {
        const updateSchoolResult = await pgQueries.updateStudentSchool.run(
          { userId: studentId, schoolId: newSchoolOrg.schoolId },
          client
        )
        if (!makeRequired(updateSchoolResult[0]).ok)
          throw new Error(
            `Updating school ${newSchoolOrg.schoolId} failed for student profile ${studentId}`
          )
      }
    }
  } catch (err) {
    throw new RepoReadError(`Could not update student partner org: ${err}`)
  }
}

export async function adminUpdateStudent(
  studentId: Ulid,
  update: AdminUpdateStudent,
  tc?: TransactionClient
) {
  return runInTransaction(async (transactionClient) => {
    try {
      const updateStudentResult = await pgQueries.adminUpdateStudent.run(
        {
          userId: studentId,
          firstName: update.firstName,
          lastName: update.lastName,
          email: update.email.toLowerCase(),
          verified: update.isVerified,
          banType: update.banType,
          deactivated: update.isDeactivated,
        },
        transactionClient
      )

      const updateProductFlagsResult =
        await pgQueries.updateStudentInGatesStudy.run(
          { userId: studentId, inGatesStudy: update.inGatesStudy },
          transactionClient
        )

      await adminUpdateStudentPartnerOrgInstance(
        studentId,
        update.studentPartnerOrg,
        update.partnerSite,
        update.partnerSchool,
        transactionClient
      )

      if (
        !(
          updateStudentResult.length &&
          updateProductFlagsResult.length &&
          makeRequired(updateStudentResult[0]).ok &&
          makeRequired(updateProductFlagsResult[0]).ok
        )
      )
        throw new RepoUpdateError('Update query did not update the student')
    } catch (err) {
      if (err instanceof RepoUpdateError) throw err
      throw new RepoTransactionError(err)
    }
  }, tc ?? getClient())
}

export async function createStudentProfile(
  studentData: CreateStudentProfilePayload,
  tc: TransactionClient
) {
  try {
    const result = await pgQueries.createStudentProfile.run(
      {
        userId: studentData.userId,
        college: studentData.college,
        schoolId: studentData.schoolId,
        postalCode: studentData.zipCode,
        gradeLevel: studentData.gradeLevel,
        partnerOrg: studentData.studentPartnerOrgKey,
        partnerSite: studentData.studentPartnerOrgSiteName,
      },
      tc
    )
    if (!result.length)
      throw new RepoCreateError('createStudentProfile created 0 rows.')
    return makeSomeRequired(result[0], ['createdAt', 'updatedAt', 'userId'])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function upsertStudentProfile(
  studentData: CreateStudentProfilePayload,
  tc: TransactionClient
) {
  try {
    const result = await pgQueries.upsertStudentProfile.run(
      {
        userId: studentData.userId,
        college: studentData.college,
        schoolId: studentData.schoolId,
        postalCode: studentData.zipCode,
        gradeLevel: studentData.gradeLevel,
        studentPartnerOrgKey: studentData.studentPartnerOrgKey,
        studentPartnerOrgSiteName: studentData.studentPartnerOrgSiteName,
      },
      tc
    )
    if (!result.length)
      throw new RepoUpsertError('upsertStudentProfile returned 0 rows.')
    return makeSomeRequired(result[0], ['createdAt', 'updatedAt', 'userId'])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function createStudent(
  studentData: CreateStudentPayload
): Promise<CreatedStudent> {
  const transactionClient = await getClient().connect()
  try {
    const userId = getDbUlid()
    await transactionClient.query('BEGIN')
    const userResult = await pgQueries.createStudentUser.run(
      {
        userId,
        referralCode: generateReferralCode(userId),
        email: studentData.email.toLowerCase(),
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        password: studentData.password,
        referredBy: studentData.referredBy,
        signupSourceId: studentData.signupSourceId,
        otherSignupSource: studentData.otherSignupSource,
        verified: studentData.verified ?? false,
        emailVerified: studentData.emailVerified ?? false,
      },
      transactionClient
    )
    const profileResult = await pgQueries.createStudentProfile.run(
      {
        userId,
        college: studentData.college,
        partnerOrg: studentData.studentPartnerOrg,
        partnerSite: studentData.partnerSite,
        postalCode: studentData.zipCode,
        gradeLevel: studentData.currentGrade,
        schoolId: studentData.approvedHighschool,
      },
      transactionClient
    )

    if (studentData.studentPartnerOrg) {
      const partnerOrg = await getPartnerOrgByKey(
        studentData.studentPartnerOrg,
        studentData.partnerSite,
        transactionClient
      )

      if (partnerOrg) {
        const spoInstanceResult =
          await pgQueries.createUserStudentPartnerOrgInstance.run(
            {
              userId,
              spoName: partnerOrg.partnerName,
              spoSiteName: studentData.partnerSite,
            },
            transactionClient
          )
        if (!spoInstanceResult.length || !makeRequired(spoInstanceResult[0]).ok)
          throw new RepoCreateError(
            'Could not create student: user partner org instance creation did not return rows'
          )
      }
    }

    if (studentData.approvedHighschool) {
      const school = await SchoolRepo.getSchoolById(
        studentData.approvedHighschool
      )

      if (school && school.isPartner) {
        const spoInstanceResult =
          await pgQueries.createUserStudentPartnerOrgInstanceWithSchoolId.run(
            {
              userId,
              schoolId: school.id,
            },
            transactionClient
          )
        if (!spoInstanceResult.length || !makeRequired(spoInstanceResult[0]).ok)
          throw new RepoCreateError(
            'Could not create student: user school partner instance creation did not return rows'
          )
      }
    }

    if (userResult.length && profileResult.length) {
      const profile = makeSomeOptional(profileResult[0], [
        'studentPartnerOrg',
        'partnerSite',
        'college',
        'schoolId',
        'postalCode',
        'gradeLevel',
      ])
      const user = makeRequired(userResult[0])

      await transactionClient.query('COMMIT')
      await insertUserRoleByUserId(user.id, USER_ROLES.STUDENT)
      return {
        id: user.id,
        firstname: user.firstName,
        firstName: user.firstName,
        lastname: user.lastName,
        email: user.email.toLowerCase(),
        banType: user.banType,
        isDeactivated: user.deactivated,
        isTestUser: user.testUser,
        isAdmin: false,
        isVolunteer: false,
        userType: 'student',
        verified: user.verified,
        createdAt: user.createdAt,
        currentGrade: profile.gradeLevel,
        zipCode: profile.postalCode,
      }
    }
    throw new RepoCreateError(
      'could not create student, profile or user came back with 0 rows'
    )
  } catch (err) {
    await transactionClient.query('ROLLBACK')
    if (err instanceof RepoCreateError) throw err
    throw new RepoTransactionError(err)
  } finally {
    transactionClient.release()
  }
}

export type StudentSessionReportQuery = {
  highSchoolId?: Ulid
  studentPartnerOrg?: string
  studentPartnerSite?: string
  sponsorOrg?: string
  start: Date
  end: Date
}

export type SessionReportRow = {
  sessionId: Ulid
  topic: string
  subject: string
  createdAt: Date
  endedAt: Date
  firstName: string
  lastName: string
  email: string
  partnerSite?: string
  waitTimeMins?: number
  totalMessages: number
  volunteerJoined: string
  volunteerJoinedAt?: Date
  sessionRating?: number
  sponsorOrg?: string
}

// TODO: break out anything that uses RO client into their own repo
export async function getSessionReport(
  query: StudentSessionReportQuery
): Promise<SessionReportRow[] | undefined> {
  try {
    const result = await pgQueries.getSessionReport.run(
      {
        highSchoolId: query.highSchoolId ? query.highSchoolId : undefined,
        studentPartnerOrg: query.studentPartnerOrg
          ? query.studentPartnerOrg
          : undefined,
        studentPartnerSite: query.studentPartnerSite
          ? query.studentPartnerSite
          : undefined,
        sponsorOrg: query.sponsorOrg ? query.sponsorOrg : undefined,
        start: query.start,
        end: query.end,
      },
      getAnalyticsClient()
    )

    if (result.length) {
      return result.map((r) =>
        makeSomeOptional(r, [
          'partnerSite',
          'waitTimeMins',
          'volunteerJoinedAt',
          'sessionRating',
          'sponsorOrg',
        ])
      )
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentUsageReportQuery = {
  highSchoolId?: Ulid
  studentPartnerOrg?: string
  studentPartnerSite?: string
  sponsorOrg?: string
  joinedStart: Date
  joinedEnd: Date
  sessionStart: Date
  sessionEnd: Date
}

export type UsageReportRow = {
  userId: Ulid
  firstName: string
  lastName: string
  email: string
  joinDate: Date
  studentPartnerOrg?: string
  partnerSite?: string
  sponsorOrg?: string
  school?: string
  totalSessions: number
  totalSessionLengthMins: number
  rangeTotalSessions: number
  rangeSessionLengthMins: number
}

// TODO: break out anything that uses RO client into their own repo
export async function getUsageReport(
  query: StudentUsageReportQuery
): Promise<UsageReportRow[] | undefined> {
  try {
    const result = await pgQueries.getUsageReport.run(
      {
        highSchoolId: query.highSchoolId ? query.highSchoolId : undefined,
        studentPartnerOrg: query.studentPartnerOrg
          ? query.studentPartnerOrg
          : undefined,
        studentPartnerSite: query.studentPartnerSite
          ? query.studentPartnerSite
          : undefined,
        sponsorOrg: query.sponsorOrg ? query.sponsorOrg : undefined,
        joinedStart: query.joinedStart,
        joinedEnd: query.joinedEnd,
        sessionStart: query.sessionStart,
        sessionEnd: query.sessionEnd,
      },
      getAnalyticsClient()
    )

    const report = []

    if (result.length) {
      for (const row of result) {
        const session = makeSomeOptional(row, [
          'partnerSite',
          'studentPartnerOrg',
          'school',
          'sponsorOrg',
        ])
        row.email = row.email.toLowerCase()
        report.push({
          ...session,
        })
      }

      return report
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentSignupSources = {
  id: number
  name: string
}

export async function getStudentSignupSources(): Promise<
  StudentSignupSources[] | undefined
> {
  try {
    const result = await pgQueries.getStudentSignupSources.run(
      undefined,
      getClient()
    )
    if (result.length) {
      // query returns sources in a random order, but we want to make sure Other is at the end
      const res = result.map((row) => makeRequired(row))
      const otherIndex = res.findIndex((x) => x.name === 'Other')
      const other = res.splice(otherIndex, 1)[0]
      res.push(other)
      return res
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteSelfFavoritedVolunteers(): Promise<void> {
  try {
    await pgQueries.deleteSelfFavoritedVolunteers.run(undefined, getClient())
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function getActivePartnersForStudent(
  studentId: Ulid,
  tc?: TransactionClient
): Promise<StudentPartnerOrgInstance[] | undefined> {
  try {
    const result = await pgQueries.getPartnerOrgsByStudent.run(
      { studentId },
      tc ?? getClient()
    )

    if (result.length)
      return result.map((row) =>
        makeSomeOptional(row, ['schoolId', 'siteName'])
      )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentIdsForGradeLevelSgUpdate(): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getStudentsIdsForGradeLevelSgUpdate.run(
      undefined,
      getClient()
    )

    if (result.length) return result.map((row) => makeRequired(row).userId)
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function countDuplicateStudentVolunteerFavorites(): Promise<number> {
  try {
    const result = await pgQueries.countDuplicateStudentVolunteerFavorites.run(
      undefined,
      getClient()
    )
    if (
      result.length &&
      result[0].duplicates !== null &&
      makeRequired(result[0].duplicates)
    ) {
      return result[0].duplicates!
    }
    throw new RepoReadError(
      'Could not count duplicates in student_favorite_volunteer'
    )
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function deleteDuplicateStudentVolunteerFavorites(
  tc: TransactionClient
): Promise<number> {
  try {
    const result = await pgQueries.deleteDuplicateStudentVolunteerFavorites.run(
      undefined,
      tc
    )
    if (
      result.length &&
      result[0].deleted !== null &&
      makeRequired(result[0])
    ) {
      return result[0].deleted!
    }

    throw new RepoUpdateError(
      'Could not delete duplicates in student_favorite_volunteers'
    )
  } catch (error) {
    throw new RepoUpdateError(error)
  }
}

export async function getStudentProfileByUserId(
  userId: Ulid
): Promise<Student> {
  const students = await getStudentProfilesByUserIds(getClient(), [userId])
  if (students.length) return students[0] as unknown as Student
  else
    throw new RepoReadError(
      `getStudentProfileByUserId: Could not find student with user id ${userId}`
    )
}

export async function getStudentProfilesByUserIds(
  tc: TransactionClient,
  userIds: Ulid[]
): Promise<StudentUserProfile[]> {
  try {
    if (!userIds.length) return []
    const result = await pgQueries.getStudentProfilesByUserIds.run(
      { userIds },
      tc
    )
    if (result.length) {
      return result.map((r) => makeSomeOptional(r, ['gradeLevel', 'schoolId']))
    }

    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateStudentSchool(
  studentId: Ulid,
  schoolId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.updateStudentSchool.run(
      {
        userId: studentId,
        schoolId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function addStudentsToTeacherClass(
  studentIds: Ulid[],
  classId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.addStudentsToTeacherClass.run(
      {
        studentIds,
        classId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getStudentByCleverId(
  cleverStudentId: Ulid,
  tc: TransactionClient = getClient()
): Promise<{ id: Ulid } | undefined> {
  try {
    const result = await pgQueries.getStudentByCleverId.run(
      {
        cleverStudentId,
      },
      tc
    )
    if (result.length) return result[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}
