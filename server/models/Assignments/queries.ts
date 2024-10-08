import { getClient, TransactionClient } from '../../db'
import { RepoReadError, RepoCreateError, RepoUpdateError } from '../Errors'
import {
  Assignment,
  CreateAssignmentInput,
  CreateStudentAssignmentInput,
  CreateStudentAssignmentResult,
} from './types'
import * as pgQueries from './pg.queries'
import {
  Ulid,
  getDbUlid,
  makeSomeOptional,
  makeSomeRequired,
  Uuid,
  makeRequired,
} from '../pgUtils'

export async function createAssignment(
  data: CreateAssignmentInput,
  tc: TransactionClient = getClient()
): Promise<Assignment> {
  try {
    const assignment = await pgQueries.createAssignment.run(
      {
        id: getDbUlid(),
        classId: data.classId,
        description: data.description,
        dueDate: data.dueDate,
        isRequired: data.isRequired,
        minDurationInMinutes: data.minDurationInMinutes,
        numberOfSessions: data.numberOfSessions,
        startDate: data.startDate,
        subjectId: data.subjectId,
        title: data.title,
      },
      tc
    )
    if (!assignment.length) {
      throw new RepoCreateError('Unable to create assignment.')
    }
    return makeSomeRequired(assignment[0], [
      'id',
      'classId',
      'isRequired',
      'createdAt',
      'updatedAt',
    ])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getAssignmentsByClassId(
  classId: Ulid,
  tc: TransactionClient = getClient()
): Promise<Assignment[]> {
  try {
    const assignments = await pgQueries.getAssignmentsByClassId.run(
      { classId },
      tc
    )
    return assignments.map(a =>
      makeSomeOptional(a, [
        'description',
        'title',
        'numberOfSessions',
        'minDurationInMinutes',
        'dueDate',
        'startDate',
        'subjectId',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssignmentById(
  assignmentId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const assignment = await pgQueries.getAssignmentById.run(
      { assignmentId },
      tc
    )

    if (assignment.length) {
      return makeSomeOptional(assignment[0], [
        'description',
        'title',
        'numberOfSessions',
        'minDurationInMinutes',
        'dueDate',
        'startDate',
        'subjectId',
        'subjectName',
      ])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createStudentAssignment(
  userId: Ulid,
  assignmentId: Ulid,
  tc: TransactionClient = getClient()
) {
  const assignment = await pgQueries.createStudentAssignment.run(
    { userId, assignmentId },
    tc
  )
  if (!assignment.length) {
    throw new RepoCreateError('Unable to create student assignment.')
  }
  return makeSomeRequired(assignment[0], [
    'userId',
    'assignmentId',
    'createdAt',
    'updatedAt',
  ])
}

export async function createStudentAssignments(
  studentAssignments: CreateStudentAssignmentInput[],
  tc: TransactionClient = getClient()
): Promise<CreateStudentAssignmentResult[]> {
  try {
    if (!studentAssignments.length) return []
    const result = await pgQueries.createStudentAssignments.run(
      { studentAssignments },
      tc
    )
    return result.map(r => makeRequired(r))
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function markStudentAssignmentAsCompleted(
  userId: Ulid,
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.updateSubmittedAtOfStudentAssignment.run(
      { userId, assignmentId },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getAssignmentsByStudentId(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const assignments = await pgQueries.getAssignmentsByStudentId.run(
      { userId },
      tc
    )
    return assignments.map(a =>
      makeSomeRequired(a, ['classId', 'id', 'isRequired', 'assignedAt'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAllAssignmentsForTeacher(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const assignments = await pgQueries.getAllAssignmentsForTeacher.run(
      { userId },
      tc
    )
    return assignments.map(a =>
      makeSomeRequired(a, [
        'classId',
        'id',
        'isRequired',
        'createdAt',
        'updatedAt',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentAssignmentCompletion(
  assignmentId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const studentAssignments = await pgQueries.getStudentAssignmentCompletion.run(
      { assignmentId },
      tc
    )
    return studentAssignments
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentAssignmentForSession(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const studentAssignment = await pgQueries.getStudentAssignmentForSession.run(
      { sessionId },
      tc
    )
    if (!studentAssignment.length) return
    return makeSomeRequired(studentAssignment[0], [
      'id',
      'isRequired',
      'assignedAt',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function linkSessionToAssignment(
  userId: Ulid,
  sessionId: Uuid,
  assignmentId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.linkSessionToAssignment.run(
      {
        sessionId,
        userId,
        assignmentId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getSessionsForStudentAssignment(
  userId: Ulid,
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
): Promise<{ volunteerJoinedAt?: Date; endedAt?: Date }[]> {
  try {
    const sessions = await pgQueries.getSessionsForStudentAssignment.run(
      { userId, assignmentId },
      tc
    )
    return sessions.map(s =>
      makeSomeOptional(s, ['volunteerJoinedAt', 'endedAt'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}
