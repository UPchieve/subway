/**
 * @group database/parallel
 */

import * as Repo from '../../models/School'
import { getClient } from '../../db'
import { getDbUlid } from '../../models/pgUtils'
import { insertSingleRow } from '../db-utils'
import {
  buildSchool,
  buildStudentPartnerOrg,
  buildStudentPartnerOrgUpchieveInstance,
} from '../mocks/generate'
import * as SchoolService from '../../services/SchoolService'
import { schoolSearch } from '../../models/School'

const client = getClient()

describe('getFilteredSchools', () => {
  test('gets the partner schools if isPartner is true', async () => {
    const data = {
      isPartner: true,
    }
    const result = await Repo.getFilteredSchools(data, 15, 0, client)
    expect(result.length).toBeTruthy()
    for (const r of result) {
      expect(r.isPartner).toBe(true)
    }
  })

  test('gets non-partner schools if isPartner is false', async () => {
    const data = {
      isPartner: false,
    }
    const result = await Repo.getFilteredSchools(data, 15, 0, client)
    expect(result.length).toBeTruthy()
    for (const r of result) {
      expect(r.isPartner).toBe(false)
    }
  })

  test('gets all schools if isPartner is not set', async () => {
    const data = {}
    const result = await Repo.getFilteredSchools(data, 15, 0, client)
    expect(result.length).toBeTruthy()
  })

  test('filters by the school with the NCES ID', async () => {
    const data = {
      ncesId: '111222333',
    }
    const school = await insertSingleRow(
      'schools',
      buildSchool({
        name: 'School with NCES ID',
        cityId: 1,
      }),
      client
    )
    const schoolMetadata = await insertSingleRow(
      'school_nces_metadata',
      {
        schoolId: school.id,
        ncessch: data.ncesId,
      },
      client
    )

    const result = await Repo.getFilteredSchools(data, 15, 0, client)
    expect(result.length).toBe(1)
    expect(result[0].ncesId).toBe(data.ncesId)
  })
})

describe('getPartnerSchools', () => {
  test('gets the schools', async () => {
    const result = await Repo.getPartnerSchools(client)

    expect(result?.length).toBeTruthy()

    const approvedSchool = result?.find(
      (r) => r.schoolName === 'Approved Partner School'
    )
    expect(approvedSchool?.schoolId).toBe(
      '01919662-87fb-d63d-788d-7417e752f5d0'
    )
    expect(approvedSchool?.partnerKey).toBe('approved-partner-school')
    expect(approvedSchool?.partnerSites?.length).toBe(0)
    const anotherApprovedSchool = result?.find(
      (r) => r.schoolName === 'Another Approved Partner School'
    )
    expect(anotherApprovedSchool?.schoolId).toBe(
      '01919662-87fb-6ad2-8227-c1e38adf0907'
    )
    expect(anotherApprovedSchool?.partnerKey).toBe(
      'another-approved-partner-school'
    )
    expect(anotherApprovedSchool?.partnerSites?.length).toBe(0)
  })

  test('gets the schools with sites if applicable', async () => {
    // Insert a new school student partner org with sites.
    const schoolId = (
      await client.query(
        'INSERT INTO schools (id, name, approved, partner) VALUES ($1, $2, $3, $4) RETURNING id',
        [getDbUlid(), 'School with Sites', 'true', 'true']
      )
    ).rows[0].id
    const spoId = (
      await client.query(
        'INSERT INTO student_partner_orgs (id, key, name, high_school_signup, school_signup_required, school_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [
          getDbUlid(),
          'school-with-sites',
          'School with Sites',
          true,
          true,
          schoolId,
        ]
      )
    ).rows[0].id
    await client.query(
      'INSERT INTO student_partner_org_sites (student_partner_org_id, id, name) VALUES($1, $2, $3), ($1, $4, $5)',
      [spoId, getDbUlid(), 'Phoenix', getDbUlid(), 'Tuscon']
    )

    const result = await Repo.getPartnerSchools(client)

    expect(result).toBeTruthy()
    const schoolWithSites = result?.find((r) => r.schoolId === schoolId)
    expect(schoolWithSites?.schoolName).toBe('School with Sites')
    expect(schoolWithSites?.partnerKey).toBe('school-with-sites')
    expect(schoolWithSites?.partnerSites?.length).toBe(2)
    const sites = new Set(schoolWithSites!.partnerSites)
    expect(sites.has('Phoenix')).toBe(true)
    expect(sites.has('Tuscon')).toBe(true)
  })

  describe('updateIsPartner', () => {
    const createSchoolForTest = async (
      isPartnerSchool: boolean
    ): Promise<string> => {
      const cityId = 1
      const result = await client.query(
        'INSERT INTO schools (id, name, partner, approved, city_id) VALUES ($1, $2, $3, true, $4) RETURNING id',
        [
          getDbUlid(),
          `TEST ${isPartnerSchool ? 'PARTNER' : ''} SCHOOL`,
          isPartnerSchool,
          cityId,
        ]
      )
      return result.rows[0].id
    }

    test('Deactivating a school partner', async () => {
      const schoolId = await createSchoolForTest(true)
      const spo = await insertSingleRow(
        'student_partner_orgs',
        buildStudentPartnerOrg({
          schoolId,
        }),
        client
      )
      await insertSingleRow(
        'student_partner_orgs_upchieve_instances',
        buildStudentPartnerOrgUpchieveInstance({
          studentPartnerOrgId: spo.id,
        }),
        client
      )
      await SchoolService.updateIsPartner(schoolId, false)

      const schoolResult = await client.query(
        'SELECT * FROM schools WHERE id = $1',
        [schoolId]
      )
      expect(schoolResult.rows.length).toEqual(1)
      expect(schoolResult.rows[0].partner).toBe(false)
      const spoInstances = (
        await client.query(
          'SELECT * FROM student_partner_orgs_upchieve_instances'
        )
      ).rows.filter((row) => row.student_partner_org_id === spo.id)
      expect(spoInstances.length).toEqual(1)
      expect(spoInstances[0].deactivated_on).not.toBeNull()
    })

    test('Deactivates all SPOs if the school has multiple', async () => {
      const schoolId = await createSchoolForTest(true)
      const spo1 = await insertSingleRow(
        'student_partner_orgs',
        buildStudentPartnerOrg({
          schoolId,
        }),
        client
      )
      const spo2 = await insertSingleRow(
        'student_partner_orgs',
        buildStudentPartnerOrg({
          schoolId,
        }),
        client
      )
      await insertSingleRow(
        'student_partner_orgs_upchieve_instances',
        buildStudentPartnerOrgUpchieveInstance({
          studentPartnerOrgId: spo1.id,
        }),
        client
      )
      await insertSingleRow(
        'student_partner_orgs_upchieve_instances',
        buildStudentPartnerOrgUpchieveInstance({
          studentPartnerOrgId: spo2.id,
        }),
        client
      )
      // Precondition: Both SPOs have active instances
      const spoInstancesBefore = await client.query(
        `SELECT * FROM student_partner_orgs_upchieve_instances WHERE student_partner_org_id IN ($1, $2)`,
        [spo1.id, spo2.id]
      )
      expect(spoInstancesBefore.rows.length).toEqual(2)
      spoInstancesBefore.rows.forEach((instance) => {
        expect(instance.deactivated_on).toBeNull()
      })

      await SchoolService.updateIsPartner(schoolId, false)

      // Postcondition: Both SPOs are now deactivated
      const spoInstancesAfter = await client.query(
        `SELECT * FROM student_partner_orgs_upchieve_instances WHERE student_partner_org_id IN ($1, $2)`,
        [spo1.id, spo2.id]
      )
      expect(spoInstancesAfter.rows.length).toEqual(2)
      spoInstancesAfter.rows.forEach((instance) => {
        const deactivatedDate = new Date(instance.deactivated_on)
        expect(deactivatedDate.getDate()).toEqual(new Date().getDate())
      })
    })

    test('Activating a school partner', async () => {
      const schoolId = await createSchoolForTest(false)
      await SchoolService.updateIsPartner(schoolId, true)

      const schoolResult = await client.query(
        'SELECT * FROM schools WHERE id = $1',
        [schoolId]
      )
      expect(schoolResult.rows.length).toEqual(1)
      expect(schoolResult.rows[0].partner).toBe(true)
      const spoResults = await client.query(
        'SELECT * FROM student_partner_orgs WHERE school_id = $1',
        [schoolId]
      )
      expect(spoResults.rows.length).toEqual(1)
      const spo = spoResults.rows[0]
      const spoInstances = (
        await client.query(
          'SELECT * FROM student_partner_orgs_upchieve_instances'
        )
      ).rows.filter((row) => row.student_partner_org_id === spo.id)
      expect(spoInstances.length).toEqual(1)
      expect(spoInstances[0].deactivated_on).toBeNull()
    })

    test('Reactivating a school partner', async () => {
      // Initial state: The school is a deactivated partner school
      const schoolId = await createSchoolForTest(true)
      const spo = await insertSingleRow(
        'student_partner_orgs',
        buildStudentPartnerOrg({
          schoolId,
        }),
        client
      )
      await insertSingleRow(
        'student_partner_orgs_upchieve_instances',
        buildStudentPartnerOrgUpchieveInstance({
          studentPartnerOrgId: spo.id,
          deactivatedOn: new Date(),
        }),
        client
      )
      await SchoolService.updateIsPartner(schoolId, true)

      const schoolResult = await client.query(
        'SELECT * FROM schools WHERE id = $1',
        [schoolId]
      )
      expect(schoolResult.rows.length).toEqual(1)
      expect(schoolResult.rows[0].partner).toBe(true)
      const spoResults = await client.query(
        'SELECT * FROM student_partner_orgs WHERE school_id = $1',
        [schoolId]
      )
      expect(spoResults.rows.length).toEqual(1)
      const spoInstances = (
        await client.query(
          'SELECT * FROM student_partner_orgs_upchieve_instances'
        )
      ).rows.filter(
        (row) => row.student_partner_org_id === spoResults.rows[0].id
      )
      expect(
        spoInstances.filter((instance) => instance.deactivated_on === null)
          .length
      ).toEqual(1)
    })
  })
})

describe('schoolSearch', () => {
  let schools: any[] = []
  beforeAll(async () => {
    const school1 = await insertSingleRow(
      'schools',
      buildSchool({
        name: "St. Malzie's School of Cats",
      }),
      client
    )
    const school2 = await insertSingleRow(
      'schools',
      buildSchool({
        name: 'St Malzies School of Cats',
      }),
      client
    )
    const school3 = await insertSingleRow(
      'schools',
      buildSchool({
        name: 'St Malzies School of Hippopotami',
      }),
      client
    )
    const school4 = await insertSingleRow(
      'schools',
      buildSchool({
        name: 'School for dogs',
      }),
      client
    )
    schools = [school1, school2, school3, school4]
  })

  it('Returns the most exact match first', async () => {
    const results = await schoolSearch(schools[0].name)
    expect(results[0]).toEqual(
      expect.objectContaining({
        id: schools[0].id,
        name: schools[0].name,
      })
    )
  })

  it('Returns fuzzy matches within the similarity threshold', async () => {
    const results = await schoolSearch('St Malzies')
    expect(results.length).toEqual(3)
    expect(new Set(results.map((r) => r.name))).toEqual(
      new Set([schools[0].name, schools[1].name, schools[2].name])
    )
  })

  it('Returns no match when outside of the similarity threshold', async () => {
    const results = await schoolSearch('water')
    expect(results.length).toEqual(0)
  })
})
