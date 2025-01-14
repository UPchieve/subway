import { getClient, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as UserRepo from '../models/User'
import { UserRole } from '../models/User'

export async function getUserRolesById(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  const roles = await UserRepo.getUserRolesById(userId, tc)
  return {
    userType: getUserTypeFromRoles(roles, userId),
    isAdmin: roles.includes('admin') ?? false,
    // TODO: Remove once no longer any references.
    isVolunteer: roles.includes('volunteer'),
  }
}

export function getUserTypeFromRoles(roles: UserRole[] = [], userId: Ulid) {
  const userTypes = roles.filter(r => r !== 'admin')
  // For now, we assume all users have one role, not including admin.
  if (!userTypes.length) {
    throw new Error(`User with id ${userId} has no roles.`)
  } else if (userTypes.length > 1) {
    throw new Error(`Unexpected number of roles for user with id ${userId}.`)
  }

  return userTypes[0]
}

export function isVolunteerUserType(userType: UserRole) {
  return userType === 'volunteer'
}

export function isStudentUserType(userType: UserRole) {
  return userType === 'student'
}

export function isTeacherUserType(userType: UserRole) {
  return userType === 'teacher'
}
