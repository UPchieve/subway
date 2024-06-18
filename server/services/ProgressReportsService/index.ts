import { Ulid } from '../../models/pgUtils'
import logger, { logError } from '../../logger'
import { TransactionClient, runInTransaction } from '../../db'
import {
  ProgressReportAnalysisTypes,
  insertProgressReport,
  insertProgressReportSession,
  insertProgressReportSummary,
  insertProgressReportSummaryDetail,
  insertProgressReportConcept,
  insertProgressReportConceptDetail,
  updateProgressReportStatus,
  ProgressReportSummaryRow,
  ProgressReportConceptRow,
  ProgressReportFocusAreas,
  ProgressReportInfoTypes,
  getProgressReportSummariesForMany,
  getProgressReportConceptsByReportId,
  getProgressReportInfoBySessionId,
  getProgressReportByReportId,
  ProgressReportInfo,
  getProgressReportSessionsForSubjectByPagination,
  getLatestProgressReportIdBySubject,
  updateProgressReportsReadAtByReportIds,
  getAllProgressReportIdsByUserIdAndSubject,
  getLatestProgressReportOverviewSubjectByUserId,
  getProgressReportOverviewUnreadStatsByUserId,
  getActiveSubjectPromptBySubjectName,
} from '../../models/ProgressReports'
import {
  UserSessionsWithMessages,
  getUserSessionsByUserId,
  getMessagesForFrontend,
  MessageForFrontend,
  UserSessionsFilter,
  getSessionById,
} from '../../models/Session'
import { captureEvent } from '../AnalyticsService'
import { EVENTS, TOOL_TYPES } from '../../constants'
import moment from 'moment'
import {
  ProgressReport,
  ProgressReportDetail,
  ProgressReportSummary,
  ProgressReportConcept,
  ProgressReportSessionFilter,
  ProgressReportOverviewSubjectStat,
  ProgressReportPromptTemplateVariables,
  SaveProgressReportOptions,
} from './types'
import { openai } from '../BotsService'
import QueueService from '../QueueService'
import { Jobs } from '../../worker/jobs'
export * from './types'
import { ProgressReportNotFoundError } from '../Errors'
import {
  getProgressReportVisionAIFeatureFlag,
  getProgressReportsFeatureFlag,
} from '../FeatureFlagService'
import { PROGRESS_REPORT_JSON_INSTRUCTIONS } from '../../constants'
import { Student, getStudentProfileByUserId } from '../../models/Student'
import { SubjectAndTopic, getSubjectAndTopic } from '../../models/Subjects'
import Delta from 'quill-delta'
import { convertBase64ToImage } from '../../utils/convert-base-to-image'
import { getTextFromImageAnalysis } from '../VisionService'
import * as LangfuseService from '../LangfuseService'

function formatTranscriptMessage(
  message: MessageForFrontend,
  userType: string
): string {
  return `${moment(message.createdAt).format('hh:mm:ss')} ${userType}: ${
    message.contents
  }\n`
}

async function formatTranscriptAndEditor(
  session: UserSessionsWithMessages
): Promise<string> {
  let transcript = ''
  for (const message of session.messages) {
    const userType = message.user === session.studentId ? 'Student' : 'Tutor'
    transcript += formatTranscriptMessage(message, userType)
  }
  const quillDoc = removeImageInsertsFromQuillDoc(session.quillDoc)
  /**
   *
   * Note: This should be optimized since we will be extracting texts from
   * images that we've processed before when making group progress reports
   *
   **/
  let imageText = ''
  const isVisionActive = await getProgressReportVisionAIFeatureFlag(
    session.studentId
  )
  if (isVisionActive && session.quillDoc) {
    const docImages = await getDocumentEditorImages(session.quillDoc)
    if (docImages.length > 0)
      imageText = await getProgressReportImageText(docImages)
  }

  return `
    Session:
    ${transcript}

    Editor:
    ${quillDoc}

    Image Text:
    ${imageText}
    `
}

export function removeImageInsertsFromQuillDoc(
  quillDoc: string | undefined
): string {
  if (!quillDoc) return ''
  const document: Delta = JSON.parse(quillDoc)
  const filteredOps = document.ops.filter(
    op => op.insert && typeof op.insert === 'string'
  )
  document.ops = filteredOps
  return JSON.stringify(document)
}

function extractBase64ImagesFromQuillDoc(quillDoc: string): string[] {
  const document: Delta = JSON.parse(quillDoc)
  const base64Images: string[] = document.ops
    .filter(
      op => op.insert && typeof op.insert === 'object' && 'image' in op.insert
    )
    .map(op => (op.insert as { image: string }).image)
    .filter(src => src.startsWith('data:image'))
  return base64Images
}

async function getDocumentEditorImages(quillDoc: string): Promise<Buffer[]> {
  const imageBuffers = []
  const base64Images: string[] = extractBase64ImagesFromQuillDoc(quillDoc)
  for (const base64Image of base64Images) {
    const outputBuffer = await convertBase64ToImage(base64Image)
    imageBuffers.push(outputBuffer)
  }
  return imageBuffers
}

async function getProgressReportImageText(
  imageBuffers: Buffer[]
): Promise<string> {
  let imageText = ''
  for (const image of imageBuffers) {
    imageText += await getTextFromImageAnalysis(image)
  }
  return imageText
}

function replaceSubjectPromptVariables(
  template: string,
  variables: ProgressReportPromptTemplateVariables
): string {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (key in variables) {
      const value =
        variables[key as keyof ProgressReportPromptTemplateVariables]
      return String(value)
    }
    return match
  })
}

function buildVariablesForTemplateReplacement(
  student: Partial<Student>,
  subjectDisplayName: string
): ProgressReportPromptTemplateVariables {
  return {
    responseInstructions: PROGRESS_REPORT_JSON_INSTRUCTIONS,
    subjectDisplayName,
    gradeLevel: student.gradeLevel,
  }
}

async function getActiveSubjectPrompt(
  subject: string,
  variables: ProgressReportPromptTemplateVariables
) {
  const subjectPrompt = await getActiveSubjectPromptBySubjectName(subject)
  return {
    ...subjectPrompt,
    prompt: replaceSubjectPromptVariables(subjectPrompt.prompt, variables),
  }
}

export async function getActiveSubjectPromptWithTemplateReplacement(
  userId: Ulid,
  subject: SubjectAndTopic
) {
  const studentProfile = await getStudentProfileByUserId(userId)
  const variables = buildVariablesForTemplateReplacement(
    studentProfile,
    subject.subjectDisplayName
  )
  return await getActiveSubjectPrompt(subject.subjectName, variables)
}

export async function hasActiveSubjectPrompt(
  subject: string
): Promise<boolean> {
  try {
    const activePrompt = await getActiveSubjectPromptBySubjectName(subject)
    return !!activePrompt.prompt
  } catch {
    return false
  }
}

async function formatSessionsForBotPrompt(
  sessions: UserSessionsWithMessages[],
  toolType: TOOL_TYPES
): Promise<string> {
  if (toolType === TOOL_TYPES.DOCUMENT_EDITOR) {
    const results = await Promise.allSettled(
      sessions.map(formatTranscriptAndEditor)
    )
    const formattedSessions = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<string>).value)
      .join('\n')
    return formattedSessions
  } else return ''
}

export async function saveProgressReport({
  userId,
  sessionIds,
  data,
  analysisType,
  promptId,
}: SaveProgressReportOptions) {
  let reportId: Ulid = ''
  try {
    if (!data.summary || !Object.keys(data.summary).length)
      throw new Error(
        `No progress report summary created for user ${userId} on session ${sessionIds.join(
          ','
        )}`
      )
    if (!data.concepts || !data.concepts.length)
      throw new Error(
        `No progress report concepts created for user ${userId} on session ${sessionIds.join(
          ','
        )}`
      )

    reportId = await insertProgressReport(userId, 'pending', promptId)

    await runInTransaction(async (tc: TransactionClient) => {
      for (const sessionId of sessionIds) {
        await insertProgressReportSession(reportId, sessionId, analysisType, tc)
      }

      const reportSummaryId = await insertProgressReportSummary(
        reportId,
        data.summary,
        tc
      )
      for (const detail of data.summary.details) {
        await insertProgressReportSummaryDetail(reportSummaryId, detail, tc)
      }

      for (const concept of data.concepts) {
        const reportConceptId = await insertProgressReportConcept(
          reportId,
          concept,
          tc
        )
        for (const detail of concept.details) {
          await insertProgressReportConceptDetail(reportConceptId, detail, tc)
        }
      }
      await updateProgressReportStatus(reportId, 'complete')
    })
    return reportId
  } catch (error) {
    logError(error as Error)
    if (reportId) await updateProgressReportStatus(reportId, 'error')
    throw error
  }
}

export async function getSessionsToAnalyzeForProgressReport(
  userId: Ulid,
  filter: UserSessionsFilter
): Promise<UserSessionsWithMessages[]> {
  const sessions = await getUserSessionsByUserId(userId, filter)
  const sessionsWithMessages: UserSessionsWithMessages[] = []
  for (const session of sessions) {
    try {
      if (!session.volunteerId) continue
      const messages = await getMessagesForFrontend(session.id)
      sessionsWithMessages.push({ ...session, messages })
    } catch (error) {
      logError(error as Error)
    }
  }
  return sessionsWithMessages
}

export async function generateProgressReportForUser(
  userId: Ulid,
  filter: ProgressReportSessionFilter
): Promise<ProgressReport> {
  const subjectData = await getSubjectAndTopic(filter.subject)
  if (!subjectData)
    throw new Error(
      `generateProgressReportForUser: No subject named ${filter.subject} found`
    )
  const sessions = await getSessionsToAnalyzeForProgressReport(userId, filter)
  const botPrompt = await formatSessionsForBotPrompt(
    sessions,
    subjectData.toolType as TOOL_TYPES
  )
  const subjectPrompt = await getActiveSubjectPromptWithTemplateReplacement(
    userId,
    subjectData
  )
  const botReport = await generateProgressReport(
    userId,
    subjectPrompt.prompt,
    botPrompt
  )
  captureEvent(userId, EVENTS.PROGRESS_REPORT_ANALYSIS_COMPLETED, {
    response: botReport,
    debug: botReport,
  })
  const sessionIds = sessions.map(s => s.id)
  const reportId = await saveProgressReport({
    userId,
    sessionIds,
    data: botReport,
    analysisType: filter.analysisType,
    promptId: subjectPrompt.id,
  })
  if (!reportId)
    throw new Error(
      `Failed to save a progress report for sessions ${sessionIds.join(
        ','
      )} for user ${userId}`
    )
  const report = await getProgressReportForReport(reportId)
  return report
}

const LF_TRACE_NAME = 'progressReport'
const LF_GENERATION_NAME = 'getProgressReportResult'
const MODEL = 'gpt-4o'
export async function generateProgressReport(
  userId: Ulid,
  systemPrompt: string,
  botPrompt: string
): Promise<ProgressReport> {
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    userId,
  })

  const gen = t.generation({
    name: LF_GENERATION_NAME,
    model: MODEL,
    input: botPrompt,
  })
  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: botPrompt,
      },
    ],
  })
  gen.end({ output: completion })

  const response = completion.choices[0].message.content
  logger.info(
    `User: ${userId} received ProgressReport completion ${completion} with response ${response}`
  )
  return response ? JSON.parse(response) : { summary: {}, concepts: [] }
}

export async function queueGenerateProgressReportForUser(
  sessionId: Ulid
): Promise<void> {
  const session = await getSessionById(sessionId)
  const isSubjectPromptActive = await hasActiveSubjectPrompt(session.subject)
  const isProgressReportsActive = await getProgressReportsFeatureFlag(
    session.studentId
  )
  if (!isSubjectPromptActive || !isProgressReportsActive) return
  await QueueService.add(
    Jobs.GenerateProgressReport,
    { sessionId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

function transformProgressReportSummaryRows(
  rows: ProgressReportSummaryRow[]
): ProgressReportSummary[] {
  const summaries: Record<Ulid, ProgressReportSummary> = {}

  for (const row of rows) {
    if (!summaries[row.id]) {
      summaries[row.id] = {
        id: row.id,
        summary: row.summary,
        overallGrade: row.overallGrade,
        details: [],
        createdAt: row.createdAt,
        reportId: row.reportId,
        reportReadAt: row.reportReadAt,
        sessionCreatedAt: row.sessionCreatedAt,
      }
    }

    const detail: ProgressReportDetail = {
      id: row.detailId,
      content: row.content,
      focusArea: row.focusArea as ProgressReportFocusAreas,
      infoType: row.infoType as ProgressReportInfoTypes,
    }

    summaries[row.id].details.push(detail)
  }

  return Object.values(summaries)
}

function transformProgressReportConceptRows(
  rows: ProgressReportConceptRow[]
): ProgressReportConcept[] {
  const concepts: Record<Ulid, ProgressReportConcept> = {}

  for (const row of rows) {
    if (!concepts[row.id]) {
      concepts[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description,
        grade: row.grade,
        details: [],
        createdAt: row.createdAt,
        reportId: row.reportId,
        reportReadAt: row.reportReadAt,
      }
    }

    const detail: ProgressReportDetail = {
      id: row.detailId,
      content: row.content,
      focusArea: row.focusArea as ProgressReportFocusAreas,
      infoType: row.infoType as ProgressReportInfoTypes,
    }

    concepts[row.id].details.push(detail)
  }

  return Object.values(concepts)
}

export async function getProgressReportSummary(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportSummary> {
  const summaryRows = await getProgressReportSummariesForMany([reportId], tc)
  const summaries = transformProgressReportSummaryRows(summaryRows)
  if (!summaries.length)
    throw new Error(`No summary found for report ${reportId}`)
  return summaries[0]
}

export async function getProgressReportConcepts(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<ProgressReportConcept[]> {
  const conceptRows = await getProgressReportConceptsByReportId(reportId, tc)
  const concepts = transformProgressReportConceptRows(conceptRows)
  if (!concepts.length)
    throw new Error(`No concepts found for report ${reportId}`)
  return concepts
}

export async function getProgressReportSummaryAndConcepts(
  reportId: Ulid,
  tc?: TransactionClient
): Promise<Pick<ProgressReport, 'summary' | 'concepts'>> {
  const summary = await getProgressReportSummary(reportId, tc)
  const concepts = await getProgressReportConcepts(reportId, tc)
  return { summary, concepts }
}

export async function getProgressReportDataAndDetails(
  getReportData: () => Promise<ProgressReportInfo | undefined>,
  tc: TransactionClient
): Promise<ProgressReport> {
  const reportData = await getReportData()
  if (!reportData?.id) {
    throw new ProgressReportNotFoundError('No report found')
  }
  const summaryAndConcepts = await getProgressReportSummaryAndConcepts(
    reportData.id,
    tc
  )
  return { ...reportData, ...summaryAndConcepts }
}

export async function getProgressReportForUserSession(
  userId: Ulid,
  sessionId: Ulid
): Promise<ProgressReport> {
  return await runInTransaction(async (tc: TransactionClient) => {
    return getProgressReportDataAndDetails(
      () => getProgressReportInfoBySessionId(userId, sessionId, 'single', tc),
      tc
    )
  })
}

export async function getProgressReportForReport(
  reportId: Ulid
): Promise<ProgressReport> {
  return await runInTransaction(async (tc: TransactionClient) => {
    return getProgressReportDataAndDetails(
      () => getProgressReportByReportId(reportId, tc),
      tc
    )
  })
}

// TODO: Use cursor pagination
export async function getProgressReportsForSubjectPaginated(
  userId: Ulid,
  subject: string,
  page: number
) {
  const limit = 5
  const offset = (page - 1) * limit
  const data = {
    subject,
    analysisType: 'single' as ProgressReportAnalysisTypes,
    limit,
    offset,
  }
  const sessions = await getProgressReportSessionsForSubjectByPagination(
    userId,
    data
  )

  const isLastPage = sessions.length < limit
  return { sessions, page, isLastPage }
}

export async function getProgressReportSummaries(
  reportIds: Ulid[],
  tc?: TransactionClient
): Promise<ProgressReportSummary[]> {
  const summaryRows = await getProgressReportSummariesForMany(reportIds, tc)
  const summaries = transformProgressReportSummaryRows(summaryRows)
  return summaries
}

export async function getProgressReportSummariesBySubject(
  userId: Ulid,
  subject: string
): Promise<ProgressReportSummary[]> {
  const data = await runInTransaction(async (tc: TransactionClient) => {
    const reportIds = await getAllProgressReportIdsByUserIdAndSubject(
      userId,
      subject,
      'group',
      tc
    )
    const summaries = await getProgressReportSummaries(reportIds, tc)
    return summaries
  })
  return data
}

export async function getLatestProgressReportSummaryBySubject(
  userId: Ulid,
  subject: string
): Promise<ProgressReport> {
  return await runInTransaction(async (tc: TransactionClient) => {
    return getProgressReportDataAndDetails(
      () => getLatestProgressReportIdBySubject(userId, subject, 'group', tc),
      tc
    )
  })
}

export async function readProgressReportsByIds(
  reportIds: Ulid[]
): Promise<void> {
  await updateProgressReportsReadAtByReportIds(reportIds)
}

export async function getProgressReportOverviewSubjectStats(
  userId: Ulid
): Promise<ProgressReportOverviewSubjectStat[]> {
  const stats = []
  const unreadStats = await getProgressReportOverviewUnreadStatsByUserId(userId)
  for (const unread of unreadStats) {
    const report = await getLatestProgressReportIdBySubject(
      userId,
      unread.subject,
      'group'
    )
    if (!report) continue
    const summary = await getProgressReportSummary(report.id)
    const data: ProgressReportOverviewSubjectStat = {
      ...unread,
      overallGrade: summary.overallGrade,
      latestReportCreatedAt: report.createdAt,
    }
    stats.push(data)
  }
  return stats.sort((a, b) =>
    b.latestReportCreatedAt > a.latestReportCreatedAt ? 1 : -1
  )
}

export async function getLatestProgressReportOverviewSubject(
  userId: Ulid
): Promise<string | undefined> {
  return await getLatestProgressReportOverviewSubjectByUserId(userId)
}
