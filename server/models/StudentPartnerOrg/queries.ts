import { PoolClient } from 'pg'
import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  CreateUserStudentPartnerOrgInstancePayload,
  GetStudentPartnerOrgResult,
  StudentPartnerOrg,
  StudentPartnerOrgForRegistration,
} from './types'
import { School } from '../School'
import logger from '../../logger'

export async function getStudentPartnerOrgForRegistrationByKey(
  key: string
): Promise<StudentPartnerOrgForRegistration> {
  try {
    const result = await pgQueries.getStudentPartnerOrgForRegistrationByKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no student partner org found with key ${key}`)
    return makeSomeOptional(result[0], ['sites'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgByKey(
  tc: TransactionClient,
  partnerKey: string,
  partnerSite?: string
): Promise<GetStudentPartnerOrgResult | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerOrgByKey.run(
      {
        partnerKey,
        partnerSite,
      },
      tc
    )
    if (result.length) {
      return makeSomeOptional(result[0], ['siteId', 'siteName', 'schoolId'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgBySchoolId(
  tc: TransactionClient,
  schoolId: string
): Promise<GetStudentPartnerOrgResult | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerOrgBySchoolId.run(
      {
        schoolId,
      },
      tc
    )
    if (result.length) {
      if (result.length > 1)
        logger.warn(
          { schoolId },
          'Found multiple student partner orgs for this school ID. Returning the first match'
        )
      return makeSomeOptional(result[0], ['siteId', 'siteName', 'schoolId'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFullStudentPartnerOrgByKey(key: string) {
  try {
    const result = await pgQueries.getFullStudentPartnerOrgByKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no student partner org found with key ${key}`)
    return makeSomeOptional(result[0], ['sites'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgs() {
  try {
    const result = await pgQueries.getStudentPartnerOrgs.run(
      undefined,
      getClient()
    )
    const orgs: StudentPartnerOrg[] = result.map((org) => {
      const temp = makeSomeOptional(org, ['sites'])
      return {
        ...temp,
        displayName: temp.name,
      }
    })
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgKeyByCode(
  signupCode: string
): Promise<string> {
  try {
    const result = await pgQueries.getStudentPartnerOrgKeyByCode.run(
      { signupCode },
      getClient()
    )
    if (!(result.length && makeRequired(result[0])))
      throw new Error(
        `no student partner org found with signup code ${signupCode}`
      )
    return makeRequired(result[0]).key
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createUserStudentPartnerOrgInstance(
  uspoData: CreateUserStudentPartnerOrgInstancePayload,
  tc: TransactionClient
): Promise<void> {
  try {
    await pgQueries.createUserStudentPartnerOrgInstance.run(
      {
        userId: uspoData.userId,
        spoId: uspoData.studentPartnerOrgId,
        sposId: uspoData.studentPartnerOrgSiteId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function migrateExistingStudentPartnerOrgs(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingStudentPartnerOrgs.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate existing instances for student partner orgs: ${err}`
    )
  }
}

export async function migrateExistingStudentPartnerOrgRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingStudentPartnerOrgRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate existing user relationships for student partner orgs: ${err}`
    )
  }
}

// TODO: waiting on programs to get list mapping partnerSchool->partnership start date
// Will need custom mapping of school names to student_partner_orgs_upchieve_instance.created_at
// MUST BE RUN FIRST
export async function migratePartnerSchoolsToPartnerOrgs(
  schoolName: string,
  createdAt: Date,
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migratePartnerSchoolsToPartnerOrgs.run(
      { schoolName, createdAt },
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate schools to student partner orgs: ${err}`
    )
  }
}

export async function backfillStudentPartnerOrgStartDates(
  spoName: string,
  createdAt: Date,
  endedAt?: Date,
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.backfillStudentPartnerOrgStartDates.run(
      { spoName, createdAt, endedAt },
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to backfill student partner org start date: ${err}`
    )
  }
}

// must be run after migrating schools to partner orgs
export async function migrateExistingPartnerSchoolRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingPartnerSchoolRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate user-school relationship for student partner orgs: ${err}`
    )
  }
}

export async function createSchoolStudentPartnerOrg(
  schoolId: string,
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.createSchoolStudentPartnerOrg.run(
      { schoolId },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoCreateError(
      `Failed to create school partner for schoolId ${schoolId} and partner instance: ${err}`
    )
  }
}

export async function createStudentPartnerOrgUpchieveInstance(
  schoolId: string,
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.createStudentPartnerOrgInstance.run(
      { schoolId },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoCreateError(
      `Failed to create student partner org upchieve instance for school ${schoolId}`
    )
  }
}

export async function deactivateSchoolStudentPartnerOrgs(
  schoolId: string,
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.deactivateStudentPartnerOrg.run(
      { schoolId },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to deactivate student partner org(s) for school ${schoolId}: ${err}`
    )
  }
}

export async function deactivateUserStudentPartnerOrgInstance(
  tc: TransactionClient,
  userId: Ulid,
  studentPartnerOrgId: string
) {
  try {
    await pgQueries.deactivateUserStudentPartnerOrgInstance.run(
      {
        userId,
        spoId: studentPartnerOrgId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to deactivate instance of user ${userId} with student partner org ${studentPartnerOrgId}: ${err}`
    )
  }
}
