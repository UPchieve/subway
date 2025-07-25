import { getDbUlid, getUuid, Ulid, Uuid } from '../../models/pgUtils'
import { Student } from '../../models/Student'
import { Availability } from '../../models/Availability'
import { User, UserContactInfo, UserRole } from '../../models/User'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import createNewAvailability from '../../utils/create-new-availability'
import { VolunteerPartnerOrg } from '../../models/VolunteerPartnerOrg'
import {
  StudentPartnerOrg,
  StudentPartnerOrgUpchieveInstance,
} from '../../models/StudentPartnerOrg'
import { DAYS, GRADES, HOURS } from '../../constants'
import { AppStudent, AppUser, AppVolunteer } from '../types'
import {
  LegacySurvey,
  SurveyQuestionDefinition,
  PresessionSurveyResponseData,
  SimpleSurveyResponse,
  UserSurvey,
  UserSurveySubmission,
  PostsessionSurveyGoalResponse,
  PostsessionSurveyResponse,
} from '../../models/Survey'
import { Pool } from 'pg'
import { getSubjectIdByName } from '../db-utils'
import {
  MessageForFrontend,
  GetSessionByIdResult,
  SessionMessage,
  SessionTranscriptItem,
  UserSessions,
  VoiceMessage,
} from '../../models/Session'
import {
  ProgressReport,
  ProgressReportDetail,
  ProgressReportSummary,
  ProgressReportConcept,
  ProgressReportOverviewSubjectStat,
} from '../../services/ProgressReportsService'
import {
  ProgressReportConceptRow,
  ProgressReportOverviewUnreadStat,
  ProgressReportStatuses,
  ProgressReportSummaryRow,
} from '../../models/ProgressReports/'
import {
  UserQuiz,
  UserTrainingCourse,
  VolunteersForAnalyticsReport,
} from '../../models/Volunteer'
import { SubjectAndTopic } from '../../models/Subjects'
import { UserProductFlags } from '../../models/UserProductFlags'
import { LegacyUserModel } from '../../models/User/legacy-user'
import { SessionAudio } from '../../models/SessionAudio'
import { ModerationInfraction } from '../../models/ModerationInfractions/types'
import { SessionAudioTranscriptMessage } from '../../models/SessionAudioTranscriptMessages/types'
import { RoleContext } from '../../services/UserRolesService'
import { UserSessionMetrics } from '../../models/UserSessionMetrics'

export function getEmail(): string {
  return faker.internet.email().toLowerCase()
}
export function getPhoneNumber(): string {
  const phoneNumber = faker.string.numeric(9)
  return `+1${phoneNumber}`
}
export const getFirstName = faker.person.firstName
export const getLastName = faker.person.lastName
export const getIpAddress = faker.internet.ip
export const getSentence = faker.lorem.sentence

export const buildAvailability = (overrides = {}): Availability => {
  const availability = createNewAvailability()

  const mergedAvailability = _.merge(availability, overrides)

  return mergedAvailability
}

export const buildFullAvailability = (): Availability => {
  const fullAvailabilityDay = {}
  for (let key of HOURS) {
    Object.assign(fullAvailabilityDay, { [key]: true })
  }
  const result = {}
  for (let key of DAYS) {
    Object.assign(result, { [key]: { ...fullAvailabilityDay } })
  }
  return result as Availability
}

export const buildNotification = (overrides = {}) => {
  return {
    id: getDbUlid(),
    userId: getDbUlid(),
    sentAt: new Date(),
    sessionId: getDbUlid(),
    typeId: 2,
    methodId: 1,
    priorityGroupId: 1,
    successful: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildUserContactInfo(
  overrides: Partial<UserContactInfo> = {}
): UserContactInfo {
  return {
    id: getDbUlid(),
    email: getEmail(),
    phone: getPhoneNumber(),
    phoneVerified: false,
    smsConsent: false,
    firstName: getFirstName(),
    isVolunteer: false,
    roles: ['student'],
    roleContext: new RoleContext(['student'], 'student', 'student'),
    isAdmin: false,
    volunteerPartnerOrg: undefined,
    studentPartnerOrg: undefined,
    lastActivityAt: new Date(),
    deactivated: false,
    referralCode: faker.string.uuid(),
    ...overrides,
  }
}

// TODO: There is weird behavior with buildUserRow, it's returning the same user data across test files.
//       Noticing this behavior with other build functions when calling `insertSingleRow`
export function buildUserRow(overrides: Partial<User> = {}): User {
  return {
    id: getUuid(),
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    email: getEmail().toLowerCase(),
    phone: getPhoneNumber(),
    smsConsent: false,
    password: 'Password123',
    firstName: getFirstName(),
    lastName: getLastName(),
    testUser: false,
    deactivated: false,
    referralCode: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    banType: undefined,
    preferredLanguage: '',
    ...overrides,
  }
}

export function buildUser(overrides: Partial<AppUser> = {}): AppUser {
  const userRow = buildUserRow()
  return {
    ...userRow,
    firstName: userRow.firstName,
    lastName: userRow.lastName,
    isDeactivated: userRow.deactivated,
    isTestUser: userRow.testUser,
    isAdmin: false,
    isVolunteer: false,
    roles: ['student'] as UserRole[],
    roleContext: new RoleContext(
      overrides?.roles ?? ['student'],
      overrides?.isVolunteer ? 'volunteer' : 'student',
      overrides?.isVolunteer ? 'volunteer' : 'student'
    ),
    ...overrides,
  }
}

export function buildUserRole(userId: Ulid, role: UserRole) {
  let roleId
  switch (role) {
    case 'student':
      roleId = 1
      break
    case 'volunteer':
      roleId = 2
      break
    case 'admin':
      roleId = 3
      break
    case 'teacher':
      roleId = 4
      break
    default:
      roleId = 1
      break
  }

  return {
    userId,
    roleId,
  }
}

export function buildStudentProfile(overrides: Partial<Student> = {}): Student {
  const userId = buildUser().id
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildStudent(overrides: Partial<AppStudent> = {}): AppStudent {
  const student = {
    ...buildUser({ isVolunteer: false }),
    zipCode: '11201',
    schoolId: getUuid(),
    currentGrade: GRADES.EIGHTH,
    gradeLevel: GRADES.EIGHTH,
    signupSourceId: 1,
    studentPartnerOrg: '',
    studentPartnerSite: '',
    partnerUserId: '',
    college: 'UPchieve University',
    roles: ['student'] as UserRole[],
    ...overrides,
  }

  return student
}

export function buildVolunteer(
  overrides: Partial<AppVolunteer> = {}
): AppVolunteer {
  return {
    ...buildUser({ isVolunteer: true }),
    volunteerPartnerOrg: '',
    phone: getPhoneNumber(),
    roles: ['volunteer'] as UserRole[],
    ...overrides,
  }
}

export function buildStudentRow(overrides: Partial<Student> = {}): Student {
  const userId = buildUserRow().id
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildLegacyUser(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  const userRow = buildUserRow()
  return {
    ...userRow,
    _id: userRow.id,
    firstname: userRow.firstName,
    proxyEmail: '',
    isVolunteer: false,
    isAdmin: false,
    isBanned: false,
    banReason: undefined,
    isTestUser: false,
    isFakeUser: false,
    isDeactivated: false,
    pastSessions: [],
    lastActivityAt: undefined,
    referredBy: undefined,
    userType: 'student',
    roleContext: new RoleContext(['student'], 'student', 'student'),
    sessionStats: {},
    ...overrides,
  }
}

export function buildLegacyStudent(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  const legacyUser = buildLegacyUser()
  return {
    ...legacyUser,
    userType: 'student',
    gradeLevel: GRADES.NINTH,
    schoolName: '',
    latestRequestedSubjects: [],
    numberOfStudentClasses: 1,
    issuers: [],
    studentPartnerOrg: undefined,
    isSchoolPartner: false,
    usesClever: false,
    usesGoogle: false,
    ...overrides,
  }
}

export function buildLegacyVolunteer(
  overrides: Partial<LegacyUserModel> = {}
): LegacyUserModel {
  const legacyUser = buildLegacyUser()
  return {
    ...legacyUser,
    userType: 'volunteer',
    volunteerPartnerOrg: undefined,
    subjects: [],
    activeSubjects: [],
    mutedSubjectAlerts: [],
    totalActiveCertifications: 0,
    availability: buildAvailability(),
    certifications: {},
    availabilityLastModifiedAt: undefined,
    trainingCourses: undefined,
    occupation: [],
    country: undefined,
    timezone: undefined,
    totalVolunteerHours: 0,
    hoursTutored: 0,
    elapsedAvailability: 0,
    references: [],
    photoIdStatus: '',
    ...overrides,
  }
}

export type SessionRow = {
  id: Ulid
  studentId: Ulid
  subjectId: number
  hasWhiteboardDoc: boolean
  reviewed: boolean
  toReview: boolean
  shadowbanned: boolean
  timeTutored: number
  createdAt: Date
  updatedAt: Date
  volunteerId?: Ulid
  quillDoc?: string
  volunteerJoinedAt?: Date
  endedAt?: Date
  mongoId?: string
  endedByRoleId?: string
  endedByUserId?: string
}

export async function buildSessionRow(
  overrides: Partial<SessionRow> & { studentId: Ulid },
  client?: Pool
): Promise<SessionRow> {
  return {
    id: getDbUlid(),
    subjectId: client ? await getSubjectIdByName('algebraOne', client) : 1,
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    shadowbanned: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildSession(
  overrides: Partial<GetSessionByIdResult> & { studentId: Uuid }
): GetSessionByIdResult {
  return {
    id: getUuid(),
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    shadowbanned: false,
    subjectId: 1,
    topic: 'math',
    subject: 'algebraOne',
    reported: false,
    flags: [],
    subjectDisplayName: 'Algebra 1',
    toolType: 'whiteboard',
    ...overrides,
  }
}

export const buildUserSession = (
  overrides: Partial<UserSessions> = {}
): UserSessions => {
  const session = {
    id: getDbUlid(),
    subjectName: 'algrebraOne',
    topicName: 'math',
    studentId: getDbUlid(),
    createdAt: new Date(),
    ...overrides,
  }
  return session
}

export const buildSessionAudioRow = (
  sessionId: string,
  overrides: Partial<SessionAudio> = {}
): SessionAudio => {
  return {
    id: getDbUlid(),
    sessionId,
    updatedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  }
}

export const buildMessageForFrontend = (
  overrides: Partial<MessageForFrontend> = {}
): MessageForFrontend => {
  const message = {
    user: getDbUlid(),
    contents: faker.lorem.sentence(),
    createdAt: new Date(),
    ...overrides,
  }
  return message
}

export function buildVolunteerPartnerOrg(
  overrides: Partial<VolunteerPartnerOrg> = {}
): VolunteerPartnerOrg {
  return {
    key: 'health-co',
    name: 'Health Co',
    receiveWeeklyHourSummaryEmail: false,
    domains: [],
    deactivated: false,
    ...overrides,
  }
}

export function buildStudentPartnerOrg(
  overrides: Partial<StudentPartnerOrg> & { id?: string | Ulid } = {}
): Partial<StudentPartnerOrg> & { id: Ulid | string } {
  return {
    id: getDbUlid(),
    key: faker.string.uuid(),
    name: faker.string.uuid(),
    highSchoolSignup: false,
    schoolSignupRequired: false,
    collegeSignup: false,
    signupCode: faker.string.uuid(),
    ...overrides,
  }
}

export function buildStudentPartnerOrgUpchieveInstance(
  overrides: Partial<StudentPartnerOrgUpchieveInstance> & {
    studentPartnerOrgId: string
  }
): StudentPartnerOrgUpchieveInstance {
  return {
    id: getDbUlid(),
    studentPartnerOrgId: overrides?.studentPartnerOrgId,
    deactivatedOn: overrides?.deactivatedOn ?? null,
  } as StudentPartnerOrgUpchieveInstance
}

export function buildSchool(
  overrides: Partial<{ name: string; cityId: number }> = {}
) {
  return {
    id: getDbUlid(),
    name: 'Approved School',
    cityId: 1,
    ...overrides,
  }
}

export function buildPresessionLegacySurveyResponse(
  overrides: Partial<PresessionSurveyResponseData> = {}
): PresessionSurveyResponseData {
  return {
    'primary-goal': {
      answer: 'To finish my homework.',
    },
    'topic-understanding': {
      answer: 2,
    },
    ...overrides,
  }
}

export const buildSimpleSurveyLegacy = (
  overrides: Partial<LegacySurvey> = {}
): LegacySurvey => {
  const survey = {
    id: getDbUlid(),
    userId: getDbUlid(),
    sessionId: getDbUlid(),
    responseData: buildPresessionLegacySurveyResponse(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}

export const buildSimpleSurvey = (
  overrides: Partial<SurveyQuestionDefinition> = {}
): SurveyQuestionDefinition => {
  const survey = {
    questionId: 1,
    questionText: "What is your primary goal for today's session?",
    displayPriority: 1,
    questionType: 'multiple choice',
    responses: [
      {
        responseId: 1,
        responseText: 'Complete a homework assignment',
        responseDisplayPriority: 1,
        responseDisplayImage: '',
      },
    ],
    ...overrides,
  }

  return survey
}

export const buildSimpleSurveyResponse = (
  overrides: Partial<SimpleSurveyResponse> = {}
): SimpleSurveyResponse => {
  const survey = {
    displayLabel: 'Their goal:',
    response: 'Complete a homework assignment',
    score: 1,
    displayOrder: 10,
    questionId: 1,
    ...overrides,
  }

  return survey
}

export const buildUserSurveySubmission = (
  overrides: Partial<UserSurveySubmission> = {}
): UserSurveySubmission => {
  const survey = {
    userSurveyId: getDbUlid(),
    questionId: 1,
    responseChoiceId: 2,
    openResponse: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}

export const buildUserSurvey = (
  overrides: Partial<UserSurvey> = {}
): UserSurvey => {
  const survey = {
    id: getDbUlid(),
    userId: getDbUlid(),
    sessionId: getDbUlid(),
    surveyId: 1,
    surveyTypeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}

export const buildPostsessionSurveyGoalResponse = (
  overrides: Partial<PostsessionSurveyGoalResponse> = {}
): PostsessionSurveyGoalResponse => {
  return {
    sessionId: getDbUlid(),
    roleInSession: 'student',
    submitterUserId: getDbUlid(),
    createdAt: new Date(),
    surveyResponseChoiceId: 1,
    score: 1,
    choiceText: 'choice',
    ...overrides,
  }
}

export const buildProgressReportDetails = (
  overrides: Partial<ProgressReportDetail> = {}
): ProgressReportDetail => {
  const detail: ProgressReportDetail = {
    id: getUuid(),
    content: faker.lorem.sentence(),
    focusArea: 'practiceArea',
    infoType: 'recommendation',
    ...overrides,
  }
  return detail
}

export const buildProgressReportConcept = (
  overrides: Partial<ProgressReportConcept> = {}
): ProgressReportConcept => {
  const concept: ProgressReportConcept = {
    id: getUuid(),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    grade: 100,
    details: [],
    createdAt: new Date(),
    reportId: getUuid(),
    ...overrides,
  }
  return concept
}

export const buildProgressReportSummary = (
  overrides: Partial<ProgressReportSummary> = {}
): ProgressReportSummary => {
  const summary = {
    id: getUuid(),
    summary: faker.lorem.sentence(),
    overallGrade: 100,
    details: [],
    createdAt: new Date(),
    reportId: getUuid(),
    sessionCreatedAt: new Date(),
    ...overrides,
  }
  return summary
}

export const buildProgressReportSummaryRow = (
  overrides: Partial<ProgressReportSummaryRow> = {}
): ProgressReportSummaryRow => {
  const summaryRow = {
    id: getUuid(),
    summary: faker.lorem.sentence(),
    overallGrade: 100,
    detailId: getUuid(),
    content: faker.lorem.sentence(),
    focusArea: 'strength',
    infoType: 'reason',
    createdAt: new Date(),
    reportId: getUuid(),
    sessionCreatedAt: new Date(),
    ...overrides,
  }
  return summaryRow
}

export const buildProgressReportConceptRow = (
  overrides: Partial<ProgressReportConceptRow> = {}
): ProgressReportConceptRow => {
  const conceptRow = {
    id: getUuid(),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    grade: 100,
    detailId: getUuid(),
    content: faker.lorem.sentence(),
    focusArea: 'strength',
    infoType: 'reason',
    createdAt: new Date(),
    reportId: getUuid(),
    ...overrides,
  }
  return conceptRow
}

export const buildProgressReport = (
  overrides: Partial<ProgressReport> = {}
): ProgressReport => {
  const report = {
    id: getUuid(),
    status: 'complete' as ProgressReportStatuses,
    summary: buildProgressReportSummary(),
    concepts: [buildProgressReportConcept()],
    createdAt: new Date(),
    ...overrides,
  }
  return report
}

export const buildTestVolunteerForAnalyticsReport = (overrides = {}) => {
  return {
    userId: 'abc-123',
    firstName: 'Louise',
    lastName: 'Belcher',
    email: '1@test.co',
    isOnboarded: true,
    createdAt: new Date(),
    dateOnboarded: new Date(),
    totalQuizzesPassed: 10,
    totalNotifications: 10,
    totalNotificationsWithinRange: 5,
    totalPartnerSessions: 10,
    totalPartnerSessionsWithinRange: 5,
    totalPartnerTimeTutored: 10,
    totalPartnerTimeTutoredWithinRange: 5,
    totalSessions: 10,
    totalSessionsWithinRange: 5,
    totalUniquePartnerStudentsHelped: 10,
    totalUniquePartnerStudentsHelpedWithinRange: 5,
    totalUniqueStudentsHelped: 10,
    totalUniqueStudentsHelpedWithinRange: 5,
    ...overrides,
  } as VolunteersForAnalyticsReport
}

export function buildProgressReportOverviewUnreadStat(
  overrides: Partial<ProgressReportOverviewUnreadStat> = {}
): ProgressReportOverviewUnreadStat {
  return {
    subject: 'algebraOne',
    totalUnreadReports: 1,
    ...overrides,
  }
}

export function buildProgressReportOverviewSubjectStat(
  overrides: Partial<ProgressReportOverviewSubjectStat> = {}
): ProgressReportOverviewSubjectStat {
  return {
    ...buildProgressReportOverviewUnreadStat(),
    overallGrade: 80,
    latestReportCreatedAt: new Date(),
    ...overrides,
  }
}

export const buildSubjectAndTopic = (
  overrides: Partial<SubjectAndTopic> = {}
): SubjectAndTopic => {
  const subject = {
    subjectName: 'algebraOne',
    subjectDisplayName: 'Algebra 1',
    topicName: 'math',
    topicDisplayName: 'Math',
    toolType: 'whiteboard',
    ...overrides,
  }
  return subject
}

export const buildUserProductFlags = (
  overrides: Partial<UserProductFlags> = {}
): UserProductFlags => {
  return {
    userId: getDbUlid(),
    sentReadyToCoachEmail: false,
    sentHourSummaryIntroEmail: false,
    sentInactiveThirtyDayEmail: false,
    sentInactiveSixtyDayEmail: false,
    sentInactiveNinetyDayEmail: false,
    gatesQualified: false,
    fallIncentiveEnrollmentAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export const buildModerationInfractionRow = (
  userId: string,
  sessionId: string,
  overrides: Partial<ModerationInfraction> = {}
): ModerationInfraction => {
  return {
    id: getDbUlid(),
    userId,
    sessionId,
    active: true,
    reason: { profanity: ['test_profanity'] },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export const buildSessionMessageRow = (
  senderId: string,
  sessionId: string,
  overrides: Partial<SessionMessage> = {}
): SessionMessage => {
  return {
    id: getDbUlid(),
    senderId,
    sessionId,
    contents: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export const buildSessionAudioTranscriptMessageRow = (
  senderId: string,
  sessionId: string,
  overrides: Partial<SessionAudioTranscriptMessage> = {}
): SessionAudioTranscriptMessage => {
  return {
    id: getDbUlid(),
    userId: senderId,
    sessionId,
    message: 'Test message',
    saidAt: new Date(),
    ...overrides,
  }
}

export const buildSessionTranscriptItem = (
  userId: string,
  overrides = {}
): SessionTranscriptItem => {
  return {
    messageId: getDbUlid(),
    userId,
    createdAt: new Date(),
    message: 'Test message',
    messageType: 'session_chat',
    role: 'student',
    ...overrides,
  }
}

export const buildSessionVoiceMessage = (
  senderId: string,
  sessionId: string,
  overrides: Partial<VoiceMessage> = {}
): VoiceMessage => {
  return {
    id: getDbUlid(),
    sessionId,
    senderId,
    createdAt: new Date(),
    updatedAt: new Date(),
    transcript: 'test transcript',
    ...overrides,
  }
}

export function buildUserSessionMetrics(
  overrides: Partial<UserSessionMetrics> & { userId: Uuid }
): UserSessionMetrics {
  return {
    absentStudent: 0,
    absentVolunteer: 0,
    lowCoachRatingFromStudent: 0,
    lowSessionRatingFromStudent: 0,
    lowSessionRatingFromCoach: 0,
    reported: 0,
    onlyLookingForAnswers: 0,
    rudeOrInappropriate: 0,
    commentFromStudent: 0,
    commentFromVolunteer: 0,
    hasBeenUnmatched: 0,
    hasHadTechnicalIssues: 0,
    personalIdentifyingInfo: 0,
    gradedAssignment: 0,
    coachUncomfortable: 0,
    studentCrisis: 0,
    createdAt: new Date(),
    ...overrides,
  }
}

export function buildSurveyResponse(
  overrides?: Partial<PostsessionSurveyResponse>
): PostsessionSurveyResponse {
  return {
    userRole: '',
    questionText: '',
    response: '',
    displayLabel: '',
    displayOrder: 1,
    score: 1,
    ...overrides,
  }
}

export function buildUserTrainingCourse(
  userId: string,
  overrides = {}
): {
  userId: Ulid
  trainingCourseId: number
  complete: boolean
  progress: number
  createdAt: Date
  updatedAt: Date
  completedMaterials: string[]
} {
  return {
    userId,
    trainingCourseId: 1,
    completedMaterials: ['a', 'b', 'c', 'd', 'e'],
    complete: true,
    progress: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildUserQuiz(
  userId: string,
  overrides: Partial<UserQuiz> = {}
): UserQuiz {
  return {
    userId,
    quizId: 1,
    attempts: 1,
    passed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
