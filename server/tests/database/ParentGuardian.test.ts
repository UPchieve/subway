/**
 * @group database/parallel
 */

import { faker } from '@faker-js/faker'
import { getClient } from '../../db'
import { getDbUlid } from '../../models/pgUtils'
import {
  createParentGuardian,
  linkParentGuardianToStudent,
} from '../../models/ParentGuardian'

const client = getClient()

describe('createParentGuardian', () => {
  test('creates the parent/guardian', async () => {
    const email = faker.internet.email()
    await createParentGuardian(email, client)

    const actual = await client.query(
      'SELECT * FROM parents_guardians WHERE email = $1',
      [email]
    )
    expect(actual.rows.length).toBe(1)
  })

  test('does not create a duplicate parent/guardian if the email already exists', async () => {
    const email = faker.internet.email()

    await createParentGuardian(email, client)
    await createParentGuardian(email, client)

    const actual = await client.query(
      'SELECT * FROM parents_guardians WHERE email = $1',
      [email]
    )
    expect(actual.rows.length).toBe(1)
  })
})

describe('linkParentGuardianToStudent', () => {
  test('creates the parent/guardian and student link', async () => {
    const STUDENT_1_ID = '01919662-885c-d39a-1749-5aaf18cf5d3b'
    const parentGuardian = await createTestParentGuardian()

    await linkParentGuardianToStudent(parentGuardian.id, STUDENT_1_ID, client)

    const actual = await client.query(
      'SELECT * FROM parents_guardians_students WHERE parents_guardians_id = $1 AND students_id = $2',
      [parentGuardian.id, STUDENT_1_ID]
    )
    expect(actual.rows.length).toBe(1)
  })

  test('does not create duplicate if parent/guardian and student link already exists', async () => {
    const STUDENT_2_ID = '01919662-885c-2fca-264b-9558f5b20fe4'
    const parentGuardian = await createTestParentGuardian()

    await linkParentGuardianToStudent(parentGuardian.id, STUDENT_2_ID, client)
    await linkParentGuardianToStudent(parentGuardian.id, STUDENT_2_ID, client)

    const actual = await client.query(
      'SELECT * FROM parents_guardians_students WHERE parents_guardians_id = $1 AND students_id = $2',
      [parentGuardian.id, STUDENT_2_ID]
    )
    expect(actual.rows.length).toBe(1)
  })

  test('can create multiple student to a single parent/guardian', async () => {
    const STUDENT_1_ID = '01919662-885c-d39a-1749-5aaf18cf5d3b'
    const STUDENT_2_ID = '01919662-885c-2fca-264b-9558f5b20fe4'
    const parentGuardian = await createTestParentGuardian()

    await linkParentGuardianToStudent(parentGuardian.id, STUDENT_1_ID, client)
    await linkParentGuardianToStudent(parentGuardian.id, STUDENT_2_ID, client)

    const actual = await client.query(
      'SELECT * FROM parents_guardians_students WHERE parents_guardians_id = $1',
      [parentGuardian.id]
    )
    expect(actual.rows.length).toBe(2)
  })

  test('can create multiple parent/guardian to a single student link', async () => {
    const STUDENT_3_ID = '01919662-885c-a174-3088-998111f7cc80'
    const parentGuardian1 = await createTestParentGuardian()
    const parentGuardian2 = await createTestParentGuardian()
    const parentGuardian3 = await createTestParentGuardian()

    await linkParentGuardianToStudent(parentGuardian1.id, STUDENT_3_ID, client)
    await linkParentGuardianToStudent(parentGuardian2.id, STUDENT_3_ID, client)
    await linkParentGuardianToStudent(parentGuardian3.id, STUDENT_3_ID, client)

    const actual = await client.query(
      'SELECT * FROM parents_guardians_students WHERE students_id = $1',
      [STUDENT_3_ID]
    )
    expect(actual.rows.length).toBe(3)
  })
})

async function createTestParentGuardian() {
  const email = faker.internet.email()
  await client.query(
    'INSERT INTO parents_guardians (id, email) VALUES ($1, $2)',
    [getDbUlid(), email]
  )
  return (
    await client.query('SELECT id FROM parents_guardians WHERE email = $1', [
      email,
    ])
  ).rows[0]
}
