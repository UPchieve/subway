/**
 * @group database/sequential
 */

import {
  Availability,
  updateAvailabilityByVolunteerId,
} from '../../models/Availability'
import { DAYS } from '../../constants'
import { faker } from '@faker-js/faker'
import {
  addVolunteerCertification,
  CreatedVolunteer,
  createVolunteer,
  CreateVolunteerPayload,
  getNextVolunteerToNotify,
  getVolunteerContactInfoById,
  getVolunteerForOnboardingById,
  updateVolunteerForAdmin,
  updateVolunteerOnboarded,
  updateVolunteerTrainingById,
} from '../../models/Volunteer'
import moment from 'moment'
import { getClient } from '../../db'
import { insertSingleRow } from '../db-utils'
import {
  buildFullAvailability,
  buildNotification,
  buildSessionRow,
  buildUserQuiz,
  buildUserTrainingCourse,
} from '../mocks/generate'
import { omit } from 'lodash'
import { addFavoriteVolunteer } from '../../models/Student'

const client = getClient()
const TIMEZONE = 'EST'
let studentId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
let completedUnmatchedSession: any
const UPCHIEVE_101_QUIZ_ID = 22

describe('VolunteerRepo', () => {
  beforeAll(async () => {
    const sessionRow = await buildSessionRow({
      subjectId: 1,
      volunteerJoinedAt: undefined,
      studentId,
    })
    completedUnmatchedSession = await insertSingleRow(
      'sessions',
      sessionRow,
      client
    )
  })

  beforeEach(async () => {
    await client.query(`DELETE FROM upchieve.availabilities;`)
    await client.query(`DELETE FROM upchieve.users_certifications;`)
  })

  describe('getNextVolunteerToNotify', () => {
    it('Returns the volunteer who was not recently notified', async () => {
      const recentlyNotifiedVolunteer = await loadVolunteer()
      const expectedVolunteer = await loadVolunteer()
      await loadNotification(
        // 2 hours old notification
        recentlyNotifiedVolunteer.id,
        completedUnmatchedSession.id,
        moment().subtract(2, 'hours').toDate()
      )

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: moment().subtract(3, 'hours').toDate(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.id).toEqual(expectedVolunteer.id)
    })

    it('Returns the volunteer who is not disqualified', async () => {
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer()

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: [v1.id],
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it.each([
      ['banType', { banType: 'complete' }],
      ['unapproved', { approved: false }],
      ['onboarded', { onboarded: false }],
    ])('Returns the volunteer who is not %s', async (msg, opt) => {
      const v1 = await loadVolunteer(opt)
      const v2 = await loadVolunteer()

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it('Returns the volunteer with availability', async () => {
      const v1 = await loadVolunteer({ withFullAvailability: false })
      const v2 = await loadVolunteer()

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)

      // Make volunteer1 available every day except today
      const currentDayOfWeek = new Date().toDateString().split(' ')[0] // i.e. Mon
      const currentAvailabilityDay = DAYS.find(
        (d) => d.toLowerCase().slice(0, 3) == currentDayOfWeek.toLowerCase()
      )!
      const availability = omit(buildFullAvailability(), currentAvailabilityDay)
      await loadVolunteerAvailability(v1.id, availability as Availability)

      const result2 = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result2?.email).toEqual(v2.email)
      expect(result2?.id).toEqual(v2.id)
    })

    it('Returns the favorited volunteer', async () => {
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer()

      await addFavoriteVolunteer(studentId, v2.id)

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: [v2.id],
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it('Returns the favorited volunteer who is available', async () => {
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer()

      await addFavoriteVolunteer(studentId, v1.id)
      await addFavoriteVolunteer(studentId, v2.id)

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: [v2.id],
        specificPartner: undefined,
        favoriteVolunteers: [v1.id, v2.id],
      })
      expect(result?.email).toEqual(v1.email)
      expect(result?.id).toEqual(v1.id)
    })

    it('Returns a partner volunteer when specificPartner is provided and isPartner=true', async () => {
      const partnerKey = 'health-co'
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer({ partner: partnerKey })

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: true,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: partnerKey,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it.each([undefined, false])(
      'Does not return a partner volunteer from `specificPartner` if isPartner=%s',
      async (isPartner) => {
        // If specificPartner is passed, it must be true that isPartner = true for it to return a volunteer.
        const partnerOrg = 'health-co'
        const vol = await loadVolunteer({ partner: partnerOrg })
        const result = await getNextVolunteerToNotify({
          subject: 'prealgebra',
          lastNotified: new Date(),
          isPartner,
          highLevelSubjects: undefined,
          disqualifiedVolunteers: undefined,
          specificPartner: partnerOrg,
          favoriteVolunteers: undefined,
        })
      }
    )

    it('Does not return a volunteer if their profile is not associated to the volunteer partner org', async () => {
      const partnerOrg = 'health-co'
      const vol = await loadVolunteer({ partner: partnerOrg })
      await client.query(
        `UPDATE volunteer_profiles SET volunteer_partner_org_id = NULL where user_id = $1`,
        [vol.id]
      )
      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: true,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: partnerOrg,
        favoriteVolunteers: undefined,
      })
      expect(result).toBeUndefined()
    })

    it('Returns the volunteer with the correct certification', async () => {
      const v1 = await loadVolunteer({ certificationSubjects: ['prealgebra'] })
      const v2 = await loadVolunteer({ certificationSubjects: ['reading'] })
      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v1.email)
      expect(result?.id).toEqual(v1.id)
    })

    it('Returns the volunteer without the higher-level subject when there are other volunteers available', async () => {
      // calculusAB is the high level subject
      const v1 = await loadVolunteer({
        certificationSubjects: ['prealgebra', 'calculusAB'],
      })
      const v2 = await loadVolunteer()
      const result = await getNextVolunteerToNotify({
        subject: 'reading',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result).toBeUndefined()
    })

    it('Returns undefined when there is no suitable volunteer', async () => {
      const opts = {
        subject: 'reading',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      }
      const runQuery = async (opts: any) => getNextVolunteerToNotify(opts)

      // No certification in reading
      await loadVolunteer()
      // Certified but no availability
      await loadVolunteer({
        certificationSubjects: ['reading'],
        withFullAvailability: false,
      })
      // Must be approved, onboarded, and not banned
      await loadVolunteer({
        approved: false,
        certificationSubjects: ['reading'],
      })
      await loadVolunteer({
        onboarded: false,
        certificationSubjects: ['reading'],
      })
      await loadVolunteer({
        banType: 'complete',
        certificationSubjects: ['reading'],
      })
      expect(await runQuery(opts)).toBeUndefined()

      // No eligible volunteer who is not disqualified
      const volunteer = await loadVolunteer({
        certificationSubjects: ['reading'],
      })
      expect(
        await runQuery({ ...opts, disqualifiedVolunteers: [volunteer.id] })
      ).toBeUndefined()
    })

    // TODO: Fix flaky test.
    it.skip('Returns a random volunteer when there are multiple suitable candidates', async () => {
      // Testing randomization here. There *is* a chance that the same volunteer is selected twice randomly,
      // To mitigate the chances of that, this loads several volunteers and does multiple trials.
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      const runQuery = async () =>
        await getNextVolunteerToNotify({
          subject: 'prealgebra',
          lastNotified: new Date(),
          isPartner: false,
          highLevelSubjects: undefined,
          disqualifiedVolunteers: undefined,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        })
      const result1 = await runQuery()
      const result2 = await runQuery()
      expect(result1?.id).toBeDefined()
      expect(result2?.id).toBeDefined()
      expect(result1?.id).not.toEqual(result2?.id)
    })

    describe('Notifying for subjects with computed unlocks', () => {
      it('Should return a user who has ALL OF the needed certs for the subject with computed unlocks', async () => {
        // In computed_subject_unlocks, subject #21 (integratedMathOne) can be unlocked by having ALL OF
        // certifications 2, 3, and 16 (statistics, geometry, and algebraOne).
        // A user should have to have ALL OF these to be able to tutor in that subject.
        const runQuery = async () => {
          return await getNextVolunteerToNotify({
            subject: 'integratedMathOne',
            lastNotified: new Date(),
            isPartner: false,
            highLevelSubjects: undefined,
            disqualifiedVolunteers: undefined,
            specificPartner: undefined,
            favoriteVolunteers: undefined,
          })
        }
        const volWithOneCert = await loadVolunteer({
          certificationSubjects: ['statistics'],
        })
        const res1 = await runQuery()
        expect(res1).toBeUndefined()

        const volWithAllCerts = await loadVolunteer({
          certificationSubjects: ['statistics', 'geometry', 'algebraOne'],
        })
        const res2 = await runQuery()
        expect(res2?.id).toEqual(volWithAllCerts.id)
      })
    })
  })

  describe('getVolunteerContactInfoById', () => {
    it('Filters out volunteers based on testUser', async () => {
      const volunteer = await loadVolunteer()
      const queryForVolunteer = async () => {
        return getVolunteerContactInfoById(volunteer.id, {
          testUser: false,
        })
      }
      let volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeDefined()
      await client.query('UPDATE users SET test_user = TRUE where id = $1', [
        volunteer.id,
      ])
      volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeUndefined()
    })

    it('Filters out volunteers based on banned filter if volunteer is complete-banned', async () => {
      const volunteer = await loadVolunteer()
      const queryForVolunteer = async () => {
        return getVolunteerContactInfoById(volunteer.id, {
          banned: false,
        })
      }
      let volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeDefined()
      await client.query(
        "UPDATE users SET ban_type = 'complete' where id = $1",
        [volunteer.id]
      )
      volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeUndefined()
    })

    it('Filters out volunteers based on deactivated', async () => {
      const volunteer = await loadVolunteer()
      const queryForVolunteer = async () => {
        return getVolunteerContactInfoById(volunteer.id, {
          deactivated: false,
        })
      }
      let volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeDefined()
      await client.query('UPDATE users SET deactivated = TRUE where id = $1', [
        volunteer.id,
      ])
      volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeUndefined()
    })
  })

  describe('getVolunteerForOnboardingById', () => {
    it('Returns hasCompletedUpchieve101 = true if the user completed the training course', async () => {
      const volunteer = await loadVolunteer({
        onboarded: false,
        approved: false,
      })
      await insertSingleRow(
        'users_training_courses',
        buildUserTrainingCourse(volunteer.id, {
          complete: true,
          progress: 100,
        }),
        client
      )
      const actual = await getVolunteerForOnboardingById(volunteer.id, client)
      expect(actual?.id).toEqual(volunteer.id)
      expect(actual?.hasCompletedUpchieve101).toBeTruthy()
    })

    it('Returns hasCompletedUpchieve101 = true if the user completed the quiz but no training course', async () => {
      const volunteer = await loadVolunteer({
        onboarded: false,
        approved: false,
      })
      await insertSingleRow(
        'users_quizzes',
        buildUserQuiz(volunteer.id, {
          quizId: UPCHIEVE_101_QUIZ_ID,
          passed: true,
        }),
        client
      )
      const actual = await getVolunteerForOnboardingById(volunteer.id, client)
      expect(actual?.id).toEqual(volunteer.id)
      expect(actual?.hasCompletedUpchieve101).toBeTruthy()
    })

    it('Returns hasCompletedUpchieve101 = true if the user completed the training course AND quiz', async () => {
      const volunteer = await loadVolunteer({
        onboarded: false,
        approved: false,
      })
      await insertSingleRow(
        'users_training_courses',
        buildUserTrainingCourse(volunteer.id, {
          complete: true,
          progress: 100,
        }),
        client
      )
      await insertSingleRow(
        'users_quizzes',
        buildUserQuiz(volunteer.id, {
          quizId: UPCHIEVE_101_QUIZ_ID,
          passed: true,
        }),
        client
      )
      const actual = await getVolunteerForOnboardingById(volunteer.id, client)
      expect(actual?.id).toEqual(volunteer.id)
      expect(actual?.hasCompletedUpchieve101).toBeTruthy()
    })

    it('Returns hasCompletedUpchieve101 = false if neither the training course nor quiz is complete', async () => {
      const volunteer = await loadVolunteer({
        onboarded: false,
        approved: false,
      })

      const firstActual = await getVolunteerForOnboardingById(
        volunteer.id,
        client
      )
      expect(firstActual?.id).toEqual(volunteer.id)
      expect(firstActual?.hasCompletedUpchieve101).toBeFalsy()

      await insertSingleRow(
        'users_training_courses',
        buildUserTrainingCourse(volunteer.id, {
          complete: false,
          progress: 80,
        }),
        client
      )
      const secondActual = await getVolunteerForOnboardingById(
        volunteer.id,
        client
      )
      expect(secondActual?.id).toEqual(volunteer.id)
      expect(secondActual?.hasCompletedUpchieve101).toBeFalsy()

      await insertSingleRow(
        'users_quizzes',
        buildUserQuiz(volunteer.id, {
          quizId: UPCHIEVE_101_QUIZ_ID,
          passed: false,
        }),
        client
      )
      const thirdActual = await getVolunteerForOnboardingById(
        volunteer.id,
        client
      )
      expect(thirdActual?.id).toEqual(volunteer.id)
      expect(secondActual?.hasCompletedUpchieve101).toBeFalsy()

      // Quiz passed ==> It should be marked as complete
      await client.query(
        'UPDATE users_quizzes SET attempts = 2, passed = true WHERE quiz_id = $1 and user_id = $2',
        [UPCHIEVE_101_QUIZ_ID, volunteer.id]
      )
      const fourthActual = await getVolunteerForOnboardingById(
        volunteer.id,
        client
      )
      expect(fourthActual?.id).toEqual(volunteer.id)
      expect(fourthActual?.hasCompletedUpchieve101).toBeTruthy()
    })
  })

  describe('updateVolunteerTrainingById', () => {
    const requiredMaterials = ['7b6a76', 'jsn832', 'ps87f9', 'jgu55k', 'fj8tzq']
    const material = requiredMaterials[0]
    const upchieve101TrainingCourseId = 1

    it('Calculates progress/complete correctly when there are no completed REQUIRED materials', async () => {
      const nonRequiredMaterial = 'some-nonrequired-material'
      const volunteer = await loadVolunteer()
      const actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        nonRequiredMaterial,
        client
      )
      expect(actual.userId).toEqual(volunteer.id)
      expect(actual.trainingCourseId).toEqual(upchieve101TrainingCourseId)
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([nonRequiredMaterial])
      expect(actual.progress).toEqual(0)

      // Now add a required material
      const secondActual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[0],
        client
      )
      expect(secondActual.userId).toEqual(volunteer.id)
      expect(secondActual.trainingCourseId).toEqual(upchieve101TrainingCourseId)
      expect(secondActual.complete).toBeFalsy()
      expect(secondActual.completedMaterials).toEqual([
        nonRequiredMaterial,
        requiredMaterials[0],
      ])
      expect(secondActual.progress).toEqual(20)
    })

    it('Calculates progress/complete correctly until complete', async () => {
      const volunteer = await loadVolunteer()
      // Complete 1/5
      let actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[0],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([requiredMaterials[0]])
      expect(actual.progress).toEqual(20)
      // 2/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[1],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([
        requiredMaterials[0],
        requiredMaterials[1],
      ])
      expect(actual.progress).toEqual(40)
      // 3/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[2],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([
        requiredMaterials[0],
        requiredMaterials[1],
        requiredMaterials[2],
      ])
      expect(actual.progress).toEqual(60)
      // 4/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[3],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([
        requiredMaterials[0],
        requiredMaterials[1],
        requiredMaterials[2],
        requiredMaterials[3],
      ])
      expect(actual.progress).toEqual(80)
      // 5/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[4],
        client
      )
      expect(actual.complete).toBeTruthy()
      expect(actual.completedMaterials).toEqual(requiredMaterials)
      expect(actual.progress).toEqual(100)
    })
  })
})

const loadVolunteerAvailability = async (
  volunteerId: string,
  availability: Availability
) => {
  await updateAvailabilityByVolunteerId(
    volunteerId,
    availability,
    TIMEZONE,
    client
  )
}

const generateVolunteer = (): CreateVolunteerPayload => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    ip: '123',
    email: faker.internet.email(),
    password: 'Password!123', // pragma: allowlist secret
    phone: faker.phone.number(),
    terms: true,
    firstName,
    lastName,
    referredBy: undefined,
    timezone: TIMEZONE,
    volunteerPartnerOrg: undefined,
  } as CreateVolunteerPayload
}

const loadVolunteer = async (opts = {}): Promise<CreatedVolunteer> => {
  const options = {
    approved: true,
    onboarded: true,
    deactivated: false,
    certificationSubjects: ['prealgebra'],
    withFullAvailability: true,
    partner: undefined,
    banType: undefined,
    ...opts,
  }
  const v = generateVolunteer()
  if (options.partner) {
    v.volunteerPartnerOrg = options.partner as string
  }
  const res = await createVolunteer(v)
  if (options.onboarded) await updateVolunteerOnboarded(res.id, client)
  if (options.certificationSubjects) {
    for (let subj of options.certificationSubjects) {
      await addVolunteerCertification(res.id, subj)
    }
  }
  if (options.withFullAvailability) {
    await loadVolunteerAvailability(res.id, buildFullAvailability())
  }
  await updateVolunteerForAdmin(res.id, {
    email: res.email,
    isVerified: true,
    isApproved: options.approved,
    isDeactivated: options.deactivated,
    firstName: undefined,
    lastName: undefined,
    volunteerPartnerOrg: options.partner,
    banType: options.banType,
  })
  return res
}

const loadNotification = async (
  volunteerId: string,
  sessionId = completedUnmatchedSession.id,
  sentAt: Date = new Date()
) => {
  const notification = buildNotification({
    userId: volunteerId,
    sentAt,
    sessionId,
  })
  await insertSingleRow('notifications', notification, client)
}
