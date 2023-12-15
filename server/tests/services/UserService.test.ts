// test.todo('postgres migration')
/*import mongoose from 'mongoose'
import * as UserService from '../../services/UserService'
import * as VolunteerService from '../../services/VolunteerService'
import VolunteerModel from '../../models/Volunteer'
import UserActionModel from '../../models/UserAction'
import {
  PHOTO_ID_STATUS,
  REFERENCE_STATUS,
  STATUS,
  USER_ACTION,
} from '../../constants'
import {
  buildVolunteer,
  buildReference,
  buildReferenceForm,
  buildPhotoIdData,
  buildReferenceWithForm,
  buildBackgroundInfo,
} from '../generate'
import { insertVolunteer, resetDb } from '../db-utils'
jest.mock('../../services/MailService')

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

test('Flags a user for deletion', async () => {
  const volunteer = buildVolunteer()
  await insertVolunteer(volunteer)
  await UserService.flagForDeletion(volunteer)
  const userList = await UserService.getUsers(volunteer)
  expect(userList.users[0].email.includes('deactivated')).toBe(true)
})

test('Successfully adds photoIdS3Key and photoIdStatus', async () => {
  const volunteer = buildVolunteer()
  await insertVolunteer(volunteer)
  const { _id: userId } = volunteer
  const newPhotoIdS3Key = await UserService.addPhotoId(userId, '')
  // @note: UserActionCtrl methods are not being awaited in the UserService. tests can potentially
  //        fail if the test completes before the user action is stored
  const userAction = await UserActionModel.findOne({
    user: userId,
    action: USER_ACTION.ACCOUNT.ADDED_PHOTO_ID,
  })

  const updatedVolunteer = await VolunteerModel.findOne({
    _id: userId,
  })
    .select('photoIdS3Key photoIdStatus')
    .lean()
    .exec()

  const expectedUserAction = {
    user: userId,
    action: USER_ACTION.ACCOUNT.ADDED_PHOTO_ID,
  }

  expect(newPhotoIdS3Key).toMatch(/^[a-f0-9]{64}$/)
  expect(updatedVolunteer!.photoIdS3Key).toEqual(newPhotoIdS3Key)
  expect(updatedVolunteer!.photoIdStatus).toEqual(PHOTO_ID_STATUS.SUBMITTED)
  expect(updatedVolunteer!.photoIdStatus).not.toEqual(PHOTO_ID_STATUS.EMPTY)
  expect(userAction).toMatchObject(expectedUserAction)
})

test('Should add a reference', async () => {
  const volunteer = buildVolunteer()
  await insertVolunteer(volunteer)
  const { _id: userId } = volunteer
  const reference = buildReference()
  const input = {
    userId,
    referenceFirstName: reference.firstName,
    referenceLastName: reference.lastName,
    referenceEmail: reference.email,
    ip: '',
  }

  await UserService.addReference(input)

  const updatedVolunteer = await VolunteerModel.findOne({
    _id: userId,
  })
    .select('references')
    .lean()
    .exec()
  const userAction = await UserActionModel.findOne({
    user: volunteer._id,
    action: USER_ACTION.ACCOUNT.ADDED_REFERENCE,
  })

  const expectedReference = {
    firstName: input.referenceFirstName,
    lastName: input.referenceLastName,
    email: input.referenceEmail,
    status: REFERENCE_STATUS.UNSENT,
  }
  const expectedUserAction = {
    user: volunteer._id,
    action: USER_ACTION.ACCOUNT.ADDED_REFERENCE,
    referenceEmail: input.referenceEmail,
  }

  expect(updatedVolunteer!.references[0]).toMatchObject(expectedReference)
  expect(updatedVolunteer!.references.length).toEqual(1)
  expect(userAction).toMatchObject(expectedUserAction)
})

test('Should delete a reference', async () => {
  const referenceOne = buildReference()
  const referenceTwo = buildReference()
  const references = [referenceOne, referenceTwo]
  const volunteer = buildVolunteer({ references })
  await insertVolunteer(volunteer)

  const { _id: userId } = volunteer

  await UserService.deleteReference(userId, referenceOne.email, '')

  const updatedVolunteer = await VolunteerModel.findOne({
    _id: userId,
  })
    .select('references')
    .lean()
    .exec()
  const userAction = await UserActionModel.findOne({
    user: userId,
    action: USER_ACTION.ACCOUNT.DELETED_REFERENCE,
  })

  const remainingReference = {
    firstName: referenceTwo.firstName,
    lastName: referenceTwo.lastName,
    email: referenceTwo.email,
    status: REFERENCE_STATUS.UNSENT,
  }
  const removedReference = {
    firstName: referenceOne.firstName,
    lastName: referenceOne.lastName,
    email: referenceOne.email,
  }
  const expectedUserAction = {
    user: userId,
    action: USER_ACTION.ACCOUNT.DELETED_REFERENCE,
    referenceEmail: referenceOne.email,
  }

  expect(updatedVolunteer!.references.length).toEqual(1)
  expect(updatedVolunteer!.references).not.toContainEqual(
    expect.objectContaining({ ...removedReference })
  )
  expect(updatedVolunteer!.references[0]).toMatchObject(remainingReference)
  expect(userAction).toMatchObject(expectedUserAction)
})

test('Should save reference form data', async () => {
  const reference = buildReference()
  const references = [reference]
  const volunteer = buildVolunteer({ references })
  await insertVolunteer(volunteer)
  const { _id: userId } = volunteer

  const form = buildReferenceForm()
  await UserService.saveReferenceForm(
    userId,
    reference._id,
    reference.email,
    form,
    ''
  )

  const foundVolunteer = await VolunteerModel.findOne({
    _id: userId,
  })
    .select('references')
    .lean()
    .exec()
  const updatedReferences = foundVolunteer!.references
  const userAction = await UserActionModel.findOne({
    user: userId,
    action: USER_ACTION.ACCOUNT.SUBMITTED_REFERENCE_FORM,
  })

  const [updatedReference] = updatedReferences
  const expectedUserAction = {
    user: userId,
    action: USER_ACTION.ACCOUNT.SUBMITTED_REFERENCE_FORM,
    referenceEmail: reference.email,
  }

  expect(updatedReference).toMatchObject(form)
  expect(userAction).toMatchObject(expectedUserAction)
})

test.todo('Admin should get pending volunteers')

// TODO: these test should be in volunteerservice tests
describe('Volunteer tests', () => {
  test('Pending volunteer should not be approved after being rejected', async () => {
    const references = [buildReferenceWithForm(), buildReferenceWithForm()]
    const options = {
      references,
      ...buildPhotoIdData(),
    }
    const volunteer = buildVolunteer(options)
    await insertVolunteer(volunteer)

    await VolunteerService.updatePendingVolunteerStatus(
      volunteer._id,
      PHOTO_ID_STATUS.REJECTED,
      [REFERENCE_STATUS.APPROVED, REFERENCE_STATUS.REJECTED]
    )
    const updatedVolunteer = await VolunteerModel.findOne({
      _id: volunteer._id,
    })
      .lean()
      .select('photoIdStatus references.status isApproved')
      .exec()
    const accountApprovedUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.APPROVED,
    })
    const rejectedReferenceUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.REJECTED_REFERENCE,
    })
    const rejectedPhotoIdUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.REJECTED_PHOTO_ID,
    })

    const expectedVolunteer = {
      photoIdStatus: PHOTO_ID_STATUS.REJECTED,
      references: [
        { status: REFERENCE_STATUS.APPROVED },
        { status: REFERENCE_STATUS.REJECTED },
      ],
      isApproved: false,
    }
    const expectedRejectedReferenceUserAction = {
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.REJECTED_REFERENCE,
      referenceEmail: references[1].email,
    }
    const expectedRejectedPhotoIdUserAction = {
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.REJECTED_PHOTO_ID,
    }

    expect(updatedVolunteer).toMatchObject(expectedVolunteer)
    expect(accountApprovedUserAction).toBeNull()
    expect(rejectedReferenceUserAction).toMatchObject(
      expectedRejectedReferenceUserAction
    )
    expect(rejectedPhotoIdUserAction).toMatchObject(
      expectedRejectedPhotoIdUserAction
    )
  })

  test('Pending volunteer should be approved after approval', async () => {
    const options = {
      references: [buildReferenceWithForm(), buildReferenceWithForm()],
      ...buildPhotoIdData(),
      ...buildBackgroundInfo(),
    }
    const volunteer = buildVolunteer(options)
    await insertVolunteer(volunteer)

    await VolunteerService.updatePendingVolunteerStatus(
      volunteer._id,
      PHOTO_ID_STATUS.APPROVED,
      [REFERENCE_STATUS.APPROVED, REFERENCE_STATUS.APPROVED]
    )
    const updatedVolunteer = await VolunteerModel.findOne({
      _id: volunteer._id,
    })
      .lean()
      .select('photoIdStatus references.status isApproved')
      .exec()
    const userAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.APPROVED,
    })

    const expectedVolunteer = {
      photoIdStatus: PHOTO_ID_STATUS.APPROVED,
      references: [
        { status: REFERENCE_STATUS.APPROVED },
        { status: REFERENCE_STATUS.APPROVED },
      ],
      isApproved: true,
    }
    const expectedUserAction = {
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.APPROVED,
    }

    expect(updatedVolunteer).toMatchObject(expectedVolunteer)
    expect(userAction).toMatchObject(expectedUserAction)
  })

  test('Open volunteer is not approved when submitting their background info', async () => {
    const volunteer = buildVolunteer({
      references: [
        buildReference({ status: STATUS.APPROVED }),
        buildReference({ status: STATUS.APPROVED }),
      ],
      photoIdStatus: STATUS.APPROVED,
    })
    await insertVolunteer(volunteer)

    const update = buildBackgroundInfo()

    await VolunteerService.addBackgroundInfo(volunteer._id, update, '')
    const updatedVolunteer = await VolunteerModel.findOne({
      _id: volunteer._id,
    })
      .lean()
      .select('isApproved')
      .exec()
    const backgroundInfoUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.COMPLETED_BACKGROUND_INFO,
    })
    const accountApprovedUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.APPROVED,
    })

    const expectedVolunteer = {
      isApproved: false,
    }
    const expectedBackgroundInfoUserAction = {
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.COMPLETED_BACKGROUND_INFO,
    }

    expect(updatedVolunteer).toMatchObject(expectedVolunteer)
    expect(backgroundInfoUserAction).toMatchObject(
      expectedBackgroundInfoUserAction
    )
    expect(accountApprovedUserAction).toBeNull()
  })

  test('Partner volunteer is approved when submitting background info', async () => {
    const volunteer = buildVolunteer({
      references: [
        buildReference({ status: STATUS.APPROVED }),
        buildReference({ status: STATUS.APPROVED }),
      ],
      photoIdStatus: STATUS.APPROVED,
      volunteerPartnerOrg: 'example',
    })
    await insertVolunteer(volunteer)

    const update = buildBackgroundInfo({ languages: [] })

    await VolunteerService.addBackgroundInfo(volunteer._id, update, '')
    const updatedVolunteer = await VolunteerModel.findOne({
      _id: volunteer._id,
    })
      .lean()
      .select('isApproved occupation experience languages country state city')
      .exec()
    const backgroundInfoUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.COMPLETED_BACKGROUND_INFO,
    })
    const accountApprovedUserAction = await UserActionModel.findOne({
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.APPROVED,
    })

    const expectedVolunteer = {
      isApproved: true,
      occupation: update.occupation,
      experience: update.experience,
      country: update.country,
      state: update.state,
      city: update.city,
      // @note: UserService.addBackgroundInfo manipulates `update` and removes a property if
      //        it contains an empty string or empty array
      languages: [],
    }
    const expectedBackgroundInfoUserAction = {
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.COMPLETED_BACKGROUND_INFO,
    }
    const expectedAccountApprovedUserAction = {
      user: volunteer._id,
      action: USER_ACTION.ACCOUNT.APPROVED,
    }

    expect(updatedVolunteer).toMatchObject(expectedVolunteer)
    expect(backgroundInfoUserAction).toMatchObject(
      expectedBackgroundInfoUserAction
    )
    expect(accountApprovedUserAction).toMatchObject(
      expectedAccountApprovedUserAction
    )
  })
})
*/
import { mocked } from 'jest-mock'
import request from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import * as UserRepo from '../../models/User/queries'
import { buildStudent } from '../mocks/generate'
import * as UserService from '../../services/UserService'

jest.mock('../../models/User/queries')

const mockUserRepo = mocked(UserRepo)
const mockGetUser = () => buildStudent()
const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
const agent = request.agent(app)
describe('UserService', () => {
  describe('updateUserProfile', () => {
    beforeEach(async () => {
      jest.resetAllMocks()
    })

    it.each([
      {
        deactivated: false,
        smsConsent: true,
      },
      {
        deactivated: false,
        smsConsent: true,
        phone: '+8608880001',
      },
    ])('Should call the user repo with the correct data', async req => {
      await UserService.updateUserProfile('123', req)
      expect(mockUserRepo.updateUserProfileById).toHaveBeenCalledWith(
        '123',
        req
      )
    })
  })
})
