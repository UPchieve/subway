test.todo('postgres migration')
/*import mongoose, { Aggregate } from 'mongoose'
import emailReferences from '../../worker/jobs/emailReferences'
import { insertVolunteer, resetDb } from '../db-utils'
import { buildVolunteer, buildReference } from '../generate'
import VolunteerModel, { Volunteer, Reference } from '../../models/Volunteer'
import * as MailService from '../../services/MailService'
import { REFERENCE_STATUS } from '../../constants'
jest.mock('../../services/MailService')

jest.setTimeout(15000)

// TODO: refactor test to mock out DB calls

const buildVolunteerWithReferences = (): Partial<Volunteer> => {
  return buildVolunteer({
    references: [
      buildReference({
        status: REFERENCE_STATUS.UNSENT,
      }),
      buildReference({
        status: REFERENCE_STATUS.UNSENT,
      }),
    ],
  })
}

const getReferences = (): Aggregate<Reference[]> => {
  return VolunteerModel.aggregate([
    {
      $unwind: '$references',
    },
    {
      $project: {
        status: '$references.status',
        _id: 0,
        firstName: '$references.firstName',
        lastName: '$references.lastName',
        email: '$references.email',
        createdAt: '$references.createdAt',
        sentAt: '$references.sentAt',
      },
    },
  ])
}

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Email references', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should send email references the reference form', async () => {
    await Promise.all([
      insertVolunteer(buildVolunteerWithReferences()),
      insertVolunteer(buildVolunteerWithReferences()),
    ])
    await emailReferences()

    const references = await getReferences()

    for (const reference of references) {
      expect(reference.status).toEqual(REFERENCE_STATUS.SENT)
    }
    expect((MailService.sendReferenceForm as jest.Mock).mock.calls.length).toBe(
      4
    )
  })

  test('Should not send any references the reference form', async () => {
    await Promise.all([
      insertVolunteer(buildVolunteer()),
      insertVolunteer(
        buildVolunteer({
          references: [
            buildReference({ status: REFERENCE_STATUS.SENT }),
            buildReference({ status: REFERENCE_STATUS.SUBMITTED }),
          ],
        })
      ),
    ])
    await emailReferences()

    expect((MailService.sendReferenceForm as jest.Mock).mock.calls.length).toBe(
      0
    )
  })
})
*/
