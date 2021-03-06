/*
import bcrypt from 'bcrypt'
import UserModel from '../models/User'
import VolunteerModel, { Volunteer } from '../models/Volunteer'
import StudentModel, { Student } from '../models/Student'
import UserActionModel, { UserAction } from '../models/UserAction'
import SessionModel, { Session } from '../models/Session'
import NotificationModel, { Notification } from '../models/Notification'
import FeedbackModel, {
  FeedbackVersionOne,
  FeedbackVersionTwo,
  Feedback,
} from '../models/Feedback'
import config from '../config'
import AvailabilitySnapshotModel, {
  AvailabilitySnapshot,
} from '../models/Availability/Snapshot'
import AvailabilityHistoryModel, {
  AvailabilityHistory,
} from '../models/Availability/History'
import {
  buildNotification,
  buildSession,
  buildStudent,
  buildVolunteer,
  buildAvailabilitySnapshot,
  buildAvailabilityHistory,
  buildUserAction,
  buildFeedback,
} from './generate'
import { FEEDBACK_VERSIONS } from '../constants'

const hashPassword = async function(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.saltRounds)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

export const resetDb = async (): Promise<void> => {
  await NotificationModel.deleteMany({})
  await SessionModel.deleteMany({})
  await UserModel.deleteMany({})
  await VolunteerModel.deleteMany({})
  await UserActionModel.deleteMany({})
  await AvailabilitySnapshotModel.deleteMany({})
}

export const insertVolunteer = async (
  overrides: Partial<Volunteer> = {}
): Promise<Volunteer> => {
  const volunteer = buildVolunteer(overrides)
  const hashedPassword = await hashPassword(volunteer.password)
  const createdVolunteer = await VolunteerModel.create({
    ...volunteer,
    password: hashedPassword,
  })
  // Return volunteer with non-hashed password
  return { ...createdVolunteer.toObject(), password: volunteer.password }
}

export const insertVolunteerMany = async (
  volunteers: Volunteer[]
): Promise<any> => {
  // @note: Reasons for using collection.insertMany is because Mongoose casts each document in insertMany()
  // this bypasses the overhead and speeds up the test
  return VolunteerModel.collection.insertMany(volunteers)
}

export const insertStudent = async (
  overrides: Partial<Student> = {}
): Promise<Student> => {
  const student = buildStudent(overrides)
  const hashedPassword = await hashPassword(student.password)
  const createdStudent = await StudentModel.create({
    ...student,
    password: hashedPassword,
  })
  // Return student with non-hashed password
  return { ...createdStudent.toObject(), password: student.password }
}

export const insertSession = async (
  overrides: Partial<Session> = {},
  studentOverrides: Partial<Student> = {}
): Promise<{
  session: Session
  student: Student
}> => {
  const student = await insertStudent(studentOverrides)
  const session = buildSession({
    student: student._id, // created student can be overridden
    ...overrides,
  })
  const createdSession = await SessionModel.create(session)
  // Return the session and the student
  return { session: createdSession.toObject(), student }
}

export const insertSessionMany = async (sessions: Session[]): Promise<any> => {
  return SessionModel.collection.insertMany(sessions)
}

// TODO: make the student and volunteer configurable
export const insertSessionWithVolunteer = async (
  overrides = {}
): Promise<{
  session: Session
  student: Student
  volunteer: Volunteer
}> => {
  const student = await insertStudent()
  const volunteer = await insertVolunteer()
  const session = buildSession({
    student: student._id,
    volunteer: volunteer._id,
    volunteerJoinedAt: new Date(),
    ...overrides,
  })
  const createdSession = await SessionModel.create(session)
  // Return the session and the student
  return { session: createdSession.toObject(), student, volunteer }
}

export const insertNotification = async (
  volunteer = buildVolunteer(),
  overrides = {}
): Promise<{
  notification: Notification
  volunteer: Partial<Volunteer>
}> => {
  const notification = buildNotification({
    volunteer: volunteer._id,
    ...overrides,
  })
  const createdNotification = await NotificationModel.create(notification)
  // Return the notification and the volunteer
  return { notification: createdNotification.toObject(), volunteer }
}

export const insertNotificationMany = async (
  notifications: Notification[]
): Promise<any> => {
  return NotificationModel.collection.insertMany(notifications)
}

export const getStudent = async (
  query: any,
  projection = {}
): Promise<Partial<Student>> => {
  const student = await StudentModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
  if (student) return student
  else return {}
}

export const getVolunteer = async (
  query: any,
  projection = {}
): Promise<Partial<Volunteer>> => {
  const volunteer = await VolunteerModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
  if (volunteer) return volunteer
  else return {}
}

export const getSession = async (
  query: any,
  projection = {}
): Promise<Partial<Session>> => {
  const session = await SessionModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
  if (session) return session
  else return {}
}

export const insertAvailabilitySnapshot = async (
  overrides = {}
): Promise<AvailabilitySnapshot> => {
  const snapshot = buildAvailabilitySnapshot(overrides)
  const createdSnapshot = await AvailabilitySnapshotModel.create(snapshot)
  return { ...createdSnapshot.toObject() }
}

export const insertAvailabilityHistory = async (
  overrides: Partial<AvailabilityHistory> = {}
): Promise<AvailabilityHistory> => {
  const availabilityHistory = buildAvailabilityHistory(overrides)
  const createdAvailabilityHistory = await AvailabilityHistoryModel.create(
    availabilityHistory
  )
  return { ...createdAvailabilityHistory.toObject() }
}

export const insertUserAction = async (
  overrides: Partial<UserAction> = {}
): Promise<UserAction> => {
  const userAction = buildUserAction(overrides)
  const createdUserAction = await UserActionModel.create(userAction)
  return createdUserAction.toObject()
}

export const insertFeedback = async (
  overrides: Partial<FeedbackVersionOne | FeedbackVersionTwo> & {
    versionNumber: FEEDBACK_VERSIONS
  }
): Promise<FeedbackVersionOne | FeedbackVersionTwo> => {
  const feedback = buildFeedback(overrides)
  const createdFeedback = await FeedbackModel.create(feedback)
  return createdFeedback.toObject() as FeedbackVersionOne | FeedbackVersionTwo
}

export const insertFeedbackMany = async (
  feedback: Feedback[]
): Promise<any> => {
  return FeedbackModel.collection.insertMany(feedback)
}
*/
