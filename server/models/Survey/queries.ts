import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoDeleteError, RepoReadError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  SaveUserSurveySubmission,
  SaveUserSurvey,
  SurveyQueryResponse,
  SurveyResponseDefinition,
  SurveyQuestionDefinition,
  SurveyType,
  PostsessionSurveyGoalResponse,
} from './types'
import { USER_ROLES, USER_ROLES_TYPE } from '../../constants'
import _ from 'lodash'
import { asNumber } from '../../utils/type-utils'

export async function saveUserSurveyAndSubmissions(
  userId: Ulid,
  surveyData: SaveUserSurvey,
  submissions: SaveUserSurveySubmission[],
  tc: TransactionClient = getClient()
): Promise<void> {
  try {
    const result = await pgQueries.saveUserSurvey.run(
      {
        surveyId: surveyData.surveyId,
        userId,
        sessionId: surveyData.sessionId ?? undefined,
        progressReportId: surveyData.progressReportId ?? undefined,
        surveyTypeId: surveyData.surveyTypeId,
      },
      tc
    )
    if (!result.length) {
      throw new RepoCreateError('Error upserting user survey')
    }

    const survey = makeSomeOptional(result[0], [
      'sessionId',
      'progressReportId',
    ])
    const errors: string[] = []
    for (const submission of submissions) {
      const result = await pgQueries.saveUserSurveySubmissions.run(
        {
          userSurveyId: survey.id,
          questionId: submission.questionId,
          responseChoiceId: submission.responseChoiceId,
          openResponse: submission.openResponse
            ? submission.openResponse
            : undefined,
        },
        tc
      )
      if (!result.length && makeRequired(result[0]).ok)
        errors.push(
          `Insert query for user survey submission ${JSON.stringify(
            submission
          )} did not return ok`
        )
    }
    if (errors.length) throw new RepoReadError(errors.join('\n'))
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getStudentsPresessionGoal(
  sessionId: Ulid
): Promise<string | undefined> {
  try {
    const result = await pgQueries.getStudentsPresessionGoal.run(
      {
        sessionId,
      },
      getClient()
    )
    if (result.length) return makeSomeOptional(result[0], ['goal']).goal
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSimpleSurveyDefinition(
  surveyType: SurveyType,
  subjectName?: string
): Promise<SurveyQueryResponse> {
  try {
    const result = await pgQueries.getSimpleSurveyDefinition.run(
      { subjectName, surveyType },
      getClient()
    )
    const resultArr = result.map((v) =>
      makeSomeOptional(v, [
        'responseId',
        'responseDisplayImage',
        'responseDisplayPriority',
        'responseText',
        'rewardAmount',
      ])
    )
    return formatSurveyDefinition(resultArr)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSimpleSurveyDefinitionBySurveyId(
  surveyId: number,
  tc?: TransactionClient
): Promise<SurveyQueryResponse> {
  try {
    const result = await pgQueries.getSimpleSurveyDefinition.run(
      { surveyId },
      tc ?? getClient()
    )
    const resultArr = result.map((v) =>
      makeSomeOptional(v, [
        'responseId',
        'responseDisplayImage',
        'responseDisplayPriority',
        'responseText',
        'rewardAmount',
      ])
    )
    return formatSurveyDefinition(resultArr)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPostsessionSurveyDefinition(
  sessionId: Ulid,
  userRole: USER_ROLES_TYPE
) {
  try {
    const result = await pgQueries.getPostsessionSurveyDefinitionForSession.run(
      {
        sessionId,
        userRole,
      },
      getClient()
    )
    if (result.length) {
      return result.map((r) =>
        makeSomeOptional(r, [
          'firstReplacementColumn',
          'secondReplacementColumn',
          'responses',
        ])
      )
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SurveyDefinitionExceptReplacementColumns = {
  surveyId: number
  name?: string
  surveyTypeId: number
  displayPriority: number
  questionId: number
  questionText: string
  questionType: string
  responseId?: number
  responseText?: string
  responseDisplayImage?: string
  responseDisplayPriority?: number
  rewardAmount?: number
}

export type SurveyReplacementColumn = {
  id: number
  replacementText1?: string
  replacementText2?: string
}

export function formatSurveyDefinition(
  resultArr: SurveyDefinitionExceptReplacementColumns[]
): SurveyQueryResponse {
  const rowsByQuestion = _.groupBy(resultArr, (v) => v.questionId)
  const survey: SurveyQuestionDefinition[] = []
  for (const [question, rows] of Object.entries(rowsByQuestion)) {
    const responses: SurveyResponseDefinition[] = []
    const temp = rows[0]

    let questionText = temp.questionText
    const questionData = {
      questionId: asNumber(question),
      questionText: questionText,
      displayPriority: temp.displayPriority,
      questionType: temp.questionType,
    }

    const sortedRows = rows.sort(
      (a, b) =>
        (a.responseDisplayPriority ?? 0) - (b.responseDisplayPriority ?? 0)
    )

    for (const row of sortedRows) {
      if (row.responseId) {
        const responseItem: SurveyResponseDefinition = {
          responseId: row.responseId,
          responseText: row.responseText,
          responseDisplayPriority: row.responseDisplayPriority,
          responseDisplayImage: row.responseDisplayImage,
        }
        responses.push(responseItem)
      }
    }
    survey.push({
      ...questionData,
      responses: responses,
    })
  }
  return {
    surveyId: resultArr[0].surveyId,
    surveyTypeId: resultArr[0].surveyTypeId,
    survey: survey.sort((a, b) => a.displayPriority - b.displayPriority),
    rewardAmount: resultArr[0].rewardAmount,
  }
}
export type SimpleSurveyResponse = {
  displayLabel: string
  response: string
  score: number
  displayOrder: number
  questionId: number
  displayImage?: string
  responseId?: number
}

export async function getPresessionSurveyResponse(
  sessionId: string
): Promise<SimpleSurveyResponse[]> {
  try {
    const result = await pgQueries.getPresessionSurveyResponse.run(
      { sessionId },
      getClient()
    )
    if (result.length)
      return result.map((row) =>
        makeSomeOptional(row, ['displayImage', 'responseId'])
      )
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PostsessionSurveyResponse = {
  userRole: string
  questionText: string
  displayLabel: string
  response?: string
  displayOrder: number
  score: number
}

export async function getPostsessionSurveyResponse(
  sessionId: string,
  userRole: USER_ROLES_TYPE
): Promise<PostsessionSurveyResponse[]> {
  try {
    if (userRole === USER_ROLES.STUDENT) {
      const result = await pgQueries.getStudentPostsessionSurveyResponse.run(
        { sessionId },
        getClient()
      )
      if (result.length)
        return result.map((row) => makeSomeOptional(row, ['response']))
      return []
    } else {
      const result = await pgQueries.getVolunteerPostsessionSurveyResponse.run(
        { sessionId },
        getClient()
      )
      if (result.length)
        return result.map((row) => makeSomeOptional(row, ['response']))
      return []
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPostsessionSurveyResponsesForSessionMetrics(
  sessionId: string
): Promise<PostsessionSurveyResponse[]> {
  try {
    const studentResponses = await getPostsessionSurveyResponse(
      sessionId,
      USER_ROLES.STUDENT
    )
    const volunteerResponses = await getPostsessionSurveyResponse(
      sessionId,
      USER_ROLES.VOLUNTEER
    )
    return studentResponses.concat(volunteerResponses)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionRating(
  sessionId: string,
  userRole: USER_ROLES_TYPE
): Promise<number | undefined> {
  if (userRole === USER_ROLES.STUDENT) {
    const ratings = await pgQueries.getStudentSessionRating.run(
      { sessionId },
      getRoClient()
    )
    const result = ratings.map((rate) => rate.score)
    return result.length ? result[0] : undefined
  }
  const ratings = await pgQueries.getVolunteerSessionRating.run(
    { sessionId },
    getRoClient()
  )
  const result = ratings.map((rate) => rate.score)
  return result.length ? result[0] : undefined
}

export async function deleteDuplicateUserSurveys(): Promise<void> {
  try {
    await pgQueries.deleteDuplicateUserSurveys.run(undefined, getClient())
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function getProgressReportSurveyResponse(
  userId: Ulid,
  progressReportId: Ulid
): Promise<SimpleSurveyResponse[]> {
  try {
    const result = await pgQueries.getProgressReportSurveyResponse.run(
      { userId, progressReportId },
      getClient()
    )
    if (result.length)
      return result.map((row) =>
        makeSomeOptional(row, ['displayImage', 'responseId'])
      )
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export const getUserPostsessionSurveyResponses = async (
  userId: string
): Promise<PostsessionSurveyGoalResponse[]> => {
  try {
    const ratings =
      await pgQueries.getPostsessionSurveyResponsesForSessionsByUserId.run(
        {
          userId,
        },
        getRoClient()
      )
    return ratings.map((r) => makeRequired(r)) ?? []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getLatestUserSubmissionsForSurveyBySurveyType(
  userId: Ulid,
  surveyType: SurveyType
): Promise<SimpleSurveyResponse[]> {
  try {
    const result = await pgQueries.getLatestUserSubmissionsForSurvey.run(
      { userId, surveyType },
      getClient()
    )
    if (result.length)
      return result.map((row) => makeSomeOptional(row, ['responseId']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getLatestUserSubmissionsForSurveyBySurveyId(
  userId: Ulid,
  surveyId: number,
  tc?: TransactionClient
): Promise<SimpleSurveyResponse[]> {
  try {
    const result = await pgQueries.getLatestUserSubmissionsForSurvey.run(
      { userId, surveyId },
      tc ?? getClient()
    )
    if (result.length)
      return result.map((row) => makeSomeOptional(row, ['responseId']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSurveyIdForLatestImpactStudySurveySubmission(
  userId: Ulid
): Promise<number | undefined> {
  try {
    const result =
      await pgQueries.getSurveyIdForLatestImpactStudySurveySubmission.run(
        { userId },
        getClient()
      )
    if (result.length) return makeRequired(result[0]).surveyId
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSurveyTypeFromSurveyTypeId(
  surveyTypeId: number
): Promise<SurveyType | undefined> {
  try {
    const result = await pgQueries.getSurveyTypeFromSurveyTypeId.run(
      { surveyTypeId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).surveyType as SurveyType
  } catch (err) {
    throw new RepoReadError(err)
  }
}
