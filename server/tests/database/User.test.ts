import faker from 'faker'
import { getClient } from '../../db'
import {
  createUser,
  deleteUserPhoneInfo,
  getUserIdByEmail,
  upsertUser,
} from '../../models/User'

const client = getClient()

test('Make a connection', async () => {
  const result = await getUserIdByEmail('student@upchieve.org')
  expect(result).toBeUndefined()
})

test('createUser', async () => {
  const user = {
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'McTest',
    password: 'Pass123',
    referralCode: '999',
  }

  await createUser(user, client)

  const actual = await client.query('SELECT * FROM users WHERE email = $1', [
    user.email,
  ])
  expect(actual.rows.length).toBe(1)
})

test('deleteUserPhoneInfo', async () => {
  const user = {
    email: faker.internet.email().toLowerCase(),
    firstName: 'Test',
    lastName: 'McTest',
    phone: faker.phone.phoneNumber('+###########'),
    phoneVerified: true,
    password: 'Pass123',
  }
  await createUser(user, client)
  await client.query(`UPDATE users SET sms_consent = true WHERE email = $1`, [
    user.email,
  ])
  var getUserResult = await client.query(
    'SELECT * FROM users WHERE email = $1',
    [user.email]
  )
  expect(getUserResult.rows[0]).toEqual(
    expect.objectContaining({
      email: user.email,
      phone: user.phone,
      phone_verified: user.phoneVerified,
      sms_consent: true,
    })
  )
  await deleteUserPhoneInfo(getUserResult.rows[0].id)
  getUserResult = await client.query('SELECT * FROM users WHERE email = $1', [
    user.email,
  ])
  expect(getUserResult.rows[0]).toEqual(
    expect.objectContaining({
      email: user.email,
      phone: null,
      phone_verified: false,
      sms_consent: false,
    })
  )
})

describe('upsertUser', () => {
  test('creates the user if did not exist', async () => {
    const user = {
      email: 'create@upsert.com',
      firstName: 'Create',
      lastName: 'Upsert',
      password: 'Pass123',
      referralCode: '999',
    }

    const before = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(before.rows.length).toBe(0)

    const returned = await upsertUser(user, client)
    expect(returned.isCreated).toBe(true)

    const after = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(after.rows.length).toBe(1)
  })

  test('updates the user if did exist', async () => {
    const user = {
      email: 'update@upsert.com',
      firstName: 'Update',
      lastName: 'Upsert',
      password: 'Pass123',
      phone: '1111111111',
    }
    await createUser(user, client)
    const before = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(before.rows.length).toBe(1)

    const updatedUser = {
      ...user,
      firstName: 'New First Name',
      lastName: 'New Last Name',
      password: '123Pass',
      phone: '9999999999',
    }

    const returned = await upsertUser(updatedUser, client)
    expect(returned.isCreated).toBe(false)

    const after = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(after.rows.length).toBe(1)
    expect(after.rows[0].first_name).toBe(updatedUser.firstName)
    expect(after.rows[0].last_name).toBe(updatedUser.lastName)
    expect(after.rows[0].password).toBe(updatedUser.password)
    expect(after.rows[0].phone).toBe(updatedUser.phone)
  })
})
