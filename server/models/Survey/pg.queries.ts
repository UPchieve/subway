/** Types generated for queries found in "server/models/Survey/surveys.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type JsonArray = (Json)[];

/** 'SaveUserSurvey' parameters type */
export interface ISaveUserSurveyParams {
  progressReportId?: string | null | void;
  sessionId?: string | null | void;
  surveyId: number;
  surveyTypeId: number;
  userId: string;
}

/** 'SaveUserSurvey' return type */
export interface ISaveUserSurveyResult {
  createdAt: Date;
  id: string;
  progressReportId: string | null;
  sessionId: string | null;
  surveyId: number;
  surveyTypeId: number;
  updatedAt: Date;
  userId: string;
}

/** 'SaveUserSurvey' query type */
export interface ISaveUserSurveyQuery {
  params: ISaveUserSurveyParams;
  result: ISaveUserSurveyResult;
}

const saveUserSurveyIR: any = {"usedParamSet":{"surveyId":true,"userId":true,"sessionId":true,"progressReportId":true,"surveyTypeId":true},"params":[{"name":"surveyId","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":165}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":179}]},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":186,"b":195}]},{"name":"progressReportId","required":false,"transform":{"type":"scalar"},"locs":[{"a":202,"b":218}]},{"name":"surveyTypeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":225,"b":238}]}],"statement":"INSERT INTO users_surveys (id, survey_id, user_id, session_id, progress_report_id, survey_type_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    :surveyId!,\n    :userId!,\n    :sessionId,\n    :progressReportId,\n    :surveyTypeId!,\n    NOW(),\n    NOW()\nON CONFLICT (survey_id,\n    user_id,\n    session_id,\n    survey_type_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        id,\n        survey_id,\n        user_id,\n        session_id,\n        progress_report_id,\n        survey_type_id,\n        created_at,\n        updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_surveys (id, survey_id, user_id, session_id, progress_report_id, survey_type_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     :surveyId!,
 *     :userId!,
 *     :sessionId,
 *     :progressReportId,
 *     :surveyTypeId!,
 *     NOW(),
 *     NOW()
 * ON CONFLICT (survey_id,
 *     user_id,
 *     session_id,
 *     survey_type_id)
 *     DO UPDATE SET
 *         updated_at = NOW()
 *     RETURNING
 *         id,
 *         survey_id,
 *         user_id,
 *         session_id,
 *         progress_report_id,
 *         survey_type_id,
 *         created_at,
 *         updated_at
 * ```
 */
export const saveUserSurvey = new PreparedQuery<ISaveUserSurveyParams,ISaveUserSurveyResult>(saveUserSurveyIR);


/** 'SaveUserSurveySubmissions' parameters type */
export interface ISaveUserSurveySubmissionsParams {
  openResponse?: string | null | void;
  questionId: number;
  responseChoiceId?: number | null | void;
  userSurveyId: string;
}

/** 'SaveUserSurveySubmissions' return type */
export interface ISaveUserSurveySubmissionsResult {
  ok: string;
}

/** 'SaveUserSurveySubmissions' query type */
export interface ISaveUserSurveySubmissionsQuery {
  params: ISaveUserSurveySubmissionsParams;
  result: ISaveUserSurveySubmissionsResult;
}

const saveUserSurveySubmissionsIR: any = {"usedParamSet":{"userSurveyId":true,"questionId":true,"responseChoiceId":true,"openResponse":true},"params":[{"name":"userSurveyId","required":true,"transform":{"type":"scalar"},"locs":[{"a":152,"b":165}]},{"name":"questionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":183}]},{"name":"responseChoiceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":190,"b":206}]},{"name":"openResponse","required":false,"transform":{"type":"scalar"},"locs":[{"a":213,"b":225}]}],"statement":"INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)\nSELECT\n    :userSurveyId!,\n    :questionId!,\n    :responseChoiceId,\n    :openResponse,\n    NOW(),\n    NOW()\nRETURNING\n    user_survey_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)
 * SELECT
 *     :userSurveyId!,
 *     :questionId!,
 *     :responseChoiceId,
 *     :openResponse,
 *     NOW(),
 *     NOW()
 * RETURNING
 *     user_survey_id AS ok
 * ```
 */
export const saveUserSurveySubmissions = new PreparedQuery<ISaveUserSurveySubmissionsParams,ISaveUserSurveySubmissionsResult>(saveUserSurveySubmissionsIR);


/** 'GetStudentsPresessionGoal' parameters type */
export interface IGetStudentsPresessionGoalParams {
  sessionId: string;
}

/** 'GetStudentsPresessionGoal' return type */
export interface IGetStudentsPresessionGoalResult {
  goal: string | null;
}

/** 'GetStudentsPresessionGoal' query type */
export interface IGetStudentsPresessionGoalQuery {
  params: IGetStudentsPresessionGoalParams;
  result: IGetStudentsPresessionGoalResult;
}

const getStudentsPresessionGoalIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":436,"b":446}]}],"statement":"SELECT\n    (\n        CASE WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS goal\nFROM\n    users_surveys\n    JOIN users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = 'What is your primary goal for today''s session?'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     (
 *         CASE WHEN src.choice_text = 'Other' THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS goal
 * FROM
 *     users_surveys
 *     JOIN users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
 *     JOIN survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id
 * WHERE
 *     users_surveys.session_id = :sessionId!
 *     AND sq.question_text = 'What is your primary goal for today''s session?'
 * ```
 */
export const getStudentsPresessionGoal = new PreparedQuery<IGetStudentsPresessionGoalParams,IGetStudentsPresessionGoalResult>(getStudentsPresessionGoalIR);


/** 'GetSimpleSurveyDefinition' parameters type */
export interface IGetSimpleSurveyDefinitionParams {
  subjectName?: string | null | void;
  surveyId?: number | null | void;
  surveyType?: string | null | void;
}

/** 'GetSimpleSurveyDefinition' return type */
export interface IGetSimpleSurveyDefinitionResult {
  displayPriority: number;
  questionId: number;
  questionText: string | null;
  questionType: string;
  responseDisplayImage: string | null;
  responseDisplayPriority: number;
  responseId: number;
  responseText: string;
  rewardAmount: number | null;
  surveyId: number;
  surveyTypeId: number;
}

/** 'GetSimpleSurveyDefinition' query type */
export interface IGetSimpleSurveyDefinitionQuery {
  params: IGetSimpleSurveyDefinitionParams;
  result: IGetSimpleSurveyDefinitionResult;
}

const getSimpleSurveyDefinitionIR: any = {"usedParamSet":{"surveyId":true,"surveyType":true,"subjectName":true},"params":[{"name":"surveyId","required":false,"transform":{"type":"scalar"},"locs":[{"a":505,"b":513},{"a":552,"b":560}]},{"name":"surveyType","required":false,"transform":{"type":"scalar"},"locs":[{"a":577,"b":587},{"a":634,"b":644}]},{"name":"subjectName","required":false,"transform":{"type":"scalar"},"locs":[{"a":662,"b":673},{"a":716,"b":727}]}],"statement":"WITH most_recent_survey AS (\n    SELECT\n        surveys.id,\n        surveys_context.subject_id,\n        surveys_context.survey_type_id,\n        subjects.display_name AS subject_display_name,\n        surveys.reward_amount,\n        surveys.created_at\n    FROM\n        surveys\n        JOIN surveys_context ON surveys.id = surveys_context.survey_id\n        JOIN survey_types ON surveys_context.survey_type_id = survey_types.id\n        LEFT JOIN subjects ON surveys_context.subject_id = subjects.id\n    WHERE (:surveyId::int IS NULL\n        OR surveys.id = :surveyId::int)\n    AND (:surveyType::text IS NULL\n        OR survey_types.name = :surveyType::text)\n    AND (:subjectName::text IS NULL\n        OR subjects.name = :subjectName::text)\nORDER BY\n    surveys.created_at DESC\nLIMIT 1\n)\nSELECT\n    sq.id::int AS question_id,\n    CASE WHEN sq.replacement_column_1 IS NOT NULL THEN\n        FORMAT(sq.question_text, most_recent_survey.subject_display_name)\n    ELSE\n        sq.question_text\n    END AS question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sub.response_id::int,\n    sub.response_text,\n    sub.response_display_priority,\n    sub.response_display_image,\n    most_recent_survey.id::int AS survey_id,\n    most_recent_survey.survey_type_id,\n    most_recent_survey.reward_amount\nFROM\n    most_recent_survey\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = most_recent_survey.id\n    JOIN survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    LEFT JOIN LATERAL (\n        SELECT\n            id AS response_id,\n            choice_text AS response_text,\n            display_priority AS response_display_priority,\n            display_image AS response_display_image\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * WITH most_recent_survey AS (
 *     SELECT
 *         surveys.id,
 *         surveys_context.subject_id,
 *         surveys_context.survey_type_id,
 *         subjects.display_name AS subject_display_name,
 *         surveys.reward_amount,
 *         surveys.created_at
 *     FROM
 *         surveys
 *         JOIN surveys_context ON surveys.id = surveys_context.survey_id
 *         JOIN survey_types ON surveys_context.survey_type_id = survey_types.id
 *         LEFT JOIN subjects ON surveys_context.subject_id = subjects.id
 *     WHERE (:surveyId::int IS NULL
 *         OR surveys.id = :surveyId::int)
 *     AND (:surveyType::text IS NULL
 *         OR survey_types.name = :surveyType::text)
 *     AND (:subjectName::text IS NULL
 *         OR subjects.name = :subjectName::text)
 * ORDER BY
 *     surveys.created_at DESC
 * LIMIT 1
 * )
 * SELECT
 *     sq.id::int AS question_id,
 *     CASE WHEN sq.replacement_column_1 IS NOT NULL THEN
 *         FORMAT(sq.question_text, most_recent_survey.subject_display_name)
 *     ELSE
 *         sq.question_text
 *     END AS question_text,
 *     ssq.display_priority,
 *     qt.name AS question_type,
 *     sub.response_id::int,
 *     sub.response_text,
 *     sub.response_display_priority,
 *     sub.response_display_image,
 *     most_recent_survey.id::int AS survey_id,
 *     most_recent_survey.survey_type_id,
 *     most_recent_survey.reward_amount
 * FROM
 *     most_recent_survey
 *     JOIN surveys_survey_questions ssq ON ssq.survey_id = most_recent_survey.id
 *     JOIN survey_questions sq ON ssq.survey_question_id = sq.id
 *     JOIN question_types qt ON qt.id = sq.question_type_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             id AS response_id,
 *             choice_text AS response_text,
 *             display_priority AS response_display_priority,
 *             display_image AS response_display_image
 *         FROM
 *             survey_questions_response_choices sqrc
 *             JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
 *         WHERE
 *             sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getSimpleSurveyDefinition = new PreparedQuery<IGetSimpleSurveyDefinitionParams,IGetSimpleSurveyDefinitionResult>(getSimpleSurveyDefinitionIR);


/** 'GetPostsessionSurveyDefinitionForSession' parameters type */
export interface IGetPostsessionSurveyDefinitionForSessionParams {
  sessionId: string;
  userRole: string;
}

/** 'GetPostsessionSurveyDefinitionForSession' return type */
export interface IGetPostsessionSurveyDefinitionForSessionResult {
  displayPriority: number;
  firstReplacementColumn: string | null;
  name: string;
  questionId: number;
  questionText: string;
  questionType: string;
  responses: JsonArray | null;
  secondReplacementColumn: string | null;
  surveyId: number;
  surveyTypeId: number;
}

/** 'GetPostsessionSurveyDefinitionForSession' query type */
export interface IGetPostsessionSurveyDefinitionForSessionQuery {
  params: IGetPostsessionSurveyDefinitionForSessionParams;
  result: IGetPostsessionSurveyDefinitionForSessionResult;
}

const getPostsessionSurveyDefinitionForSessionIR: any = {"usedParamSet":{"sessionId":true,"userRole":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1125,"b":1135}]},{"name":"userRole","required":true,"transform":{"type":"scalar"},"locs":[{"a":1155,"b":1164}]}],"statement":"SELECT\n    s.id AS survey_id,\n    st.id AS survey_type_id,\n    s.name,\n    sq.id AS question_id,\n    sq.question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sq.replacement_column_1 AS first_replacement_column,\n    sq.replacement_column_2 AS second_replacement_column,\n    array_agg(json_build_object('responseId', src.id, 'responseText', src.choice_text, 'responseDisplayPriority', sqrc.display_priority, 'responseDisplayImage', src.display_image)) AS responses\nFROM\n    surveys_context sc\n    JOIN surveys s ON s.id = sc.survey_id\n    JOIN survey_types st ON st.id = sc.survey_type_id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = s.id\n    JOIN survey_questions sq ON sq.id = ssq.survey_question_id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    JOIN survey_questions_response_choices sqrc ON sqrc.surveys_survey_question_id = ssq.id\n    JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n    JOIN subjects ON sc.subject_id = subjects.id\n    JOIN sessions sess ON sess.subject_id = subjects.id\n    JOIN user_roles ur ON ur.id = s.role_id\nWHERE\n    sess.id = :sessionId!\n    AND ur.name = :userRole!\n    AND st.name = 'postsession'\nGROUP BY\n    s.id,\n    st.id,\n    sq.id,\n    ssq.id,\n    qt.id\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     s.id AS survey_id,
 *     st.id AS survey_type_id,
 *     s.name,
 *     sq.id AS question_id,
 *     sq.question_text,
 *     ssq.display_priority,
 *     qt.name AS question_type,
 *     sq.replacement_column_1 AS first_replacement_column,
 *     sq.replacement_column_2 AS second_replacement_column,
 *     array_agg(json_build_object('responseId', src.id, 'responseText', src.choice_text, 'responseDisplayPriority', sqrc.display_priority, 'responseDisplayImage', src.display_image)) AS responses
 * FROM
 *     surveys_context sc
 *     JOIN surveys s ON s.id = sc.survey_id
 *     JOIN survey_types st ON st.id = sc.survey_type_id
 *     JOIN surveys_survey_questions ssq ON ssq.survey_id = s.id
 *     JOIN survey_questions sq ON sq.id = ssq.survey_question_id
 *     JOIN question_types qt ON qt.id = sq.question_type_id
 *     JOIN survey_questions_response_choices sqrc ON sqrc.surveys_survey_question_id = ssq.id
 *     JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
 *     JOIN subjects ON sc.subject_id = subjects.id
 *     JOIN sessions sess ON sess.subject_id = subjects.id
 *     JOIN user_roles ur ON ur.id = s.role_id
 * WHERE
 *     sess.id = :sessionId!
 *     AND ur.name = :userRole!
 *     AND st.name = 'postsession'
 * GROUP BY
 *     s.id,
 *     st.id,
 *     sq.id,
 *     ssq.id,
 *     qt.id
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getPostsessionSurveyDefinitionForSession = new PreparedQuery<IGetPostsessionSurveyDefinitionForSessionParams,IGetPostsessionSurveyDefinitionForSessionResult>(getPostsessionSurveyDefinitionForSessionIR);


/** 'GetPresessionSurveyResponse' parameters type */
export interface IGetPresessionSurveyResponseParams {
  sessionId: string;
}

/** 'GetPresessionSurveyResponse' return type */
export interface IGetPresessionSurveyResponseResult {
  displayImage: string | null;
  displayLabel: string | null;
  displayOrder: number;
  questionId: number;
  response: string | null;
  responseId: number;
  score: number | null;
}

/** 'GetPresessionSurveyResponse' query type */
export interface IGetPresessionSurveyResponseQuery {
  params: IGetPresessionSurveyResponseParams;
  result: IGetPresessionSurveyResponseResult;
}

const getPresessionSurveyResponseIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1126,"b":1136},{"a":1153,"b":1163}]}],"statement":"SELECT\n    FORMAT(sq.response_display_text, subjects.display_name) AS display_label,\n    (\n        CASE WHEN src.choice_text = 'Other'\n            AND uss.open_response IS NULL THEN\n            'Other - ask them what their goal is!'\n        WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    src.display_image AS display_image,\n    sq.id::int AS question_id,\n    src.id AS response_id\nFROM\n    users_surveys AS us\n    JOIN sessions AS s ON s.student_id = us.user_id\n    JOIN subjects ON s.subject_id = subjects.id\n    JOIN survey_types AS st ON us.survey_type_id = st.id\n    JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'presession'\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     FORMAT(sq.response_display_text, subjects.display_name) AS display_label,
 *     (
 *         CASE WHEN src.choice_text = 'Other'
 *             AND uss.open_response IS NULL THEN
 *             'Other - ask them what their goal is!'
 *         WHEN src.choice_text = 'Other' THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order,
 *     src.display_image AS display_image,
 *     sq.id::int AS question_id,
 *     src.id AS response_id
 * FROM
 *     users_surveys AS us
 *     JOIN sessions AS s ON s.student_id = us.user_id
 *     JOIN subjects ON s.subject_id = subjects.id
 *     JOIN survey_types AS st ON us.survey_type_id = st.id
 *     JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id
 *     LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id
 *     JOIN survey_questions AS sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 * WHERE
 *     us.session_id = :sessionId!
 *     AND s.id = :sessionId!
 *     AND st.name = 'presession'
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getPresessionSurveyResponse = new PreparedQuery<IGetPresessionSurveyResponseParams,IGetPresessionSurveyResponseResult>(getPresessionSurveyResponseIR);


/** 'GetStudentPostsessionSurveyResponse' parameters type */
export interface IGetStudentPostsessionSurveyResponseParams {
  sessionId: string;
}

/** 'GetStudentPostsessionSurveyResponse' return type */
export interface IGetStudentPostsessionSurveyResponseResult {
  displayLabel: string | null;
  displayOrder: number;
  questionText: string;
  response: string | null;
  score: number | null;
  userRole: string | null;
}

/** 'GetStudentPostsessionSurveyResponse' query type */
export interface IGetStudentPostsessionSurveyResponseQuery {
  params: IGetStudentPostsessionSurveyResponseParams;
  result: IGetStudentPostsessionSurveyResponseResult;
}

const getStudentPostsessionSurveyResponseIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":2231,"b":2241},{"a":3484,"b":3494},{"a":3511,"b":3521}]}],"statement":"WITH replacement_column_cte AS (\n    SELECT\n        sq.id,\n        CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n            u_student.first_name\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text <> 'Other' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_1 = 'coach_name' THEN\n            u_volunteer.first_name\n        WHEN sq.replacement_column_1 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_1,\n        CASE WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text <> 'OTHER' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_2 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_2\n    FROM\n        upchieve.sessions s\n        JOIN upchieve.subjects ON s.subject_id = subjects.id\n        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n        JOIN upchieve.users u_student ON u_student.id = s.student_id\n        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n        JOIN upchieve.users_surveys us ON us.session_id = s.id\n        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n            AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n        JOIN upchieve.surveys ON sc.survey_id = surveys.id\n        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    WHERE\n        st.name = 'postsession'\n        AND s.id = :sessionId!\n        AND ur.name = 'student'\n)\nSELECT\n    'student' AS user_role,\n    sq.question_text,\n    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            OR qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order\nFROM\n    upchieve.users_surveys AS us\n    JOIN upchieve.sessions AS s ON s.student_id = us.user_id\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id\n    LEFT JOIN replacement_column_cte rcc ON rcc.id = sq.id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'postsession'\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * WITH replacement_column_cte AS (
 *     SELECT
 *         sq.id,
 *         CASE WHEN sq.replacement_column_1 = 'student_name' THEN
 *             u_student.first_name
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text <> 'Other' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_1 = 'coach_name' THEN
 *             u_volunteer.first_name
 *         WHEN sq.replacement_column_1 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_1,
 *         CASE WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text <> 'OTHER' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_2 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_2
 *     FROM
 *         upchieve.sessions s
 *         JOIN upchieve.subjects ON s.subject_id = subjects.id
 *         JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
 *         JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
 *         JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
 *         JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
 *         JOIN upchieve.users u_student ON u_student.id = s.student_id
 *         JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
 *         JOIN upchieve.users_surveys us ON us.session_id = s.id
 *         JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *         JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *         JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
 *             AND sq_goal.question_text = 'What is your primary goal for today''s session?'
 *         JOIN upchieve.surveys ON sc.survey_id = surveys.id
 *         JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
 *     WHERE
 *         st.name = 'postsession'
 *         AND s.id = :sessionId!
 *         AND ur.name = 'student'
 * )
 * SELECT
 *     'student' AS user_role,
 *     sq.question_text,
 *     FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,
 *     (
 *         CASE WHEN (src.choice_text = 'Other'
 *             OR qt.name = 'free response') THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order
 * FROM
 *     upchieve.users_surveys AS us
 *     JOIN upchieve.sessions AS s ON s.student_id = us.user_id
 *     JOIN upchieve.subjects ON s.subject_id = subjects.id
 *     JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id
 *     JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id
 *     LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 *     LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id
 *     LEFT JOIN replacement_column_cte rcc ON rcc.id = sq.id
 * WHERE
 *     us.session_id = :sessionId!
 *     AND s.id = :sessionId!
 *     AND st.name = 'postsession'
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getStudentPostsessionSurveyResponse = new PreparedQuery<IGetStudentPostsessionSurveyResponseParams,IGetStudentPostsessionSurveyResponseResult>(getStudentPostsessionSurveyResponseIR);


/** 'GetVolunteerPostsessionSurveyResponse' parameters type */
export interface IGetVolunteerPostsessionSurveyResponseParams {
  sessionId: string;
}

/** 'GetVolunteerPostsessionSurveyResponse' return type */
export interface IGetVolunteerPostsessionSurveyResponseResult {
  displayLabel: string | null;
  displayOrder: number;
  questionText: string;
  response: string | null;
  score: number | null;
  userRole: string | null;
}

/** 'GetVolunteerPostsessionSurveyResponse' query type */
export interface IGetVolunteerPostsessionSurveyResponseQuery {
  params: IGetVolunteerPostsessionSurveyResponseParams;
  result: IGetVolunteerPostsessionSurveyResponseResult;
}

const getVolunteerPostsessionSurveyResponseIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":2231,"b":2241},{"a":3490,"b":3500},{"a":3517,"b":3527}]}],"statement":"WITH replacement_column_cte AS (\n    SELECT\n        sq.id,\n        CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n            u_student.first_name\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text <> 'Other' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_1 = 'coach_name' THEN\n            u_volunteer.first_name\n        WHEN sq.replacement_column_1 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_1,\n        CASE WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text <> 'OTHER' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_2 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_2\n    FROM\n        upchieve.sessions s\n        JOIN upchieve.subjects ON s.subject_id = subjects.id\n        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n        JOIN upchieve.users u_student ON u_student.id = s.student_id\n        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n        JOIN upchieve.users_surveys us ON us.session_id = s.id\n        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n            AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n        JOIN upchieve.surveys ON sc.survey_id = surveys.id\n        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    WHERE\n        st.name = 'postsession'\n        AND s.id = :sessionId!\n        AND ur.name = 'volunteer'\n)\nSELECT\n    'volunteer' AS user_role,\n    sq.question_text,\n    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            OR qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order\nFROM\n    upchieve.users_surveys AS us\n    JOIN upchieve.sessions AS s ON s.volunteer_id = us.user_id\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id\n    LEFT JOIN replacement_column_cte rcc ON rcc.id = sq.id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'postsession'\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * WITH replacement_column_cte AS (
 *     SELECT
 *         sq.id,
 *         CASE WHEN sq.replacement_column_1 = 'student_name' THEN
 *             u_student.first_name
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text <> 'Other' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_1 = 'coach_name' THEN
 *             u_volunteer.first_name
 *         WHEN sq.replacement_column_1 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_1,
 *         CASE WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text <> 'OTHER' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_2 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_2
 *     FROM
 *         upchieve.sessions s
 *         JOIN upchieve.subjects ON s.subject_id = subjects.id
 *         JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
 *         JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
 *         JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
 *         JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
 *         JOIN upchieve.users u_student ON u_student.id = s.student_id
 *         JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
 *         JOIN upchieve.users_surveys us ON us.session_id = s.id
 *         JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *         JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *         JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
 *             AND sq_goal.question_text = 'What is your primary goal for today''s session?'
 *         JOIN upchieve.surveys ON sc.survey_id = surveys.id
 *         JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
 *     WHERE
 *         st.name = 'postsession'
 *         AND s.id = :sessionId!
 *         AND ur.name = 'volunteer'
 * )
 * SELECT
 *     'volunteer' AS user_role,
 *     sq.question_text,
 *     FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,
 *     (
 *         CASE WHEN (src.choice_text = 'Other'
 *             OR qt.name = 'free response') THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order
 * FROM
 *     upchieve.users_surveys AS us
 *     JOIN upchieve.sessions AS s ON s.volunteer_id = us.user_id
 *     JOIN upchieve.subjects ON s.subject_id = subjects.id
 *     JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id
 *     JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id
 *     LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 *     LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id
 *     LEFT JOIN replacement_column_cte rcc ON rcc.id = sq.id
 * WHERE
 *     us.session_id = :sessionId!
 *     AND s.id = :sessionId!
 *     AND st.name = 'postsession'
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getVolunteerPostsessionSurveyResponse = new PreparedQuery<IGetVolunteerPostsessionSurveyResponseParams,IGetVolunteerPostsessionSurveyResponseResult>(getVolunteerPostsessionSurveyResponseIR);


/** 'GetStudentSessionRating' parameters type */
export interface IGetStudentSessionRatingParams {
  sessionId: string;
}

/** 'GetStudentSessionRating' return type */
export interface IGetStudentSessionRatingResult {
  score: number;
}

/** 'GetStudentSessionRating' query type */
export interface IGetStudentSessionRatingQuery {
  params: IGetStudentSessionRatingParams;
  result: IGetStudentSessionRatingResult;
}

const getStudentSessionRatingIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":335,"b":345}]}],"statement":"SELECT\n    score\nFROM\n    upchieve.users_surveys\n    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     score
 * FROM
 *     upchieve.users_surveys
 *     JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 * WHERE
 *     users_surveys.session_id = :sessionId!
 *     AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
 * ```
 */
export const getStudentSessionRating = new PreparedQuery<IGetStudentSessionRatingParams,IGetStudentSessionRatingResult>(getStudentSessionRatingIR);


/** 'GetVolunteerSessionRating' parameters type */
export interface IGetVolunteerSessionRatingParams {
  sessionId: string;
}

/** 'GetVolunteerSessionRating' return type */
export interface IGetVolunteerSessionRatingResult {
  score: number;
}

/** 'GetVolunteerSessionRating' query type */
export interface IGetVolunteerSessionRatingQuery {
  params: IGetVolunteerSessionRatingParams;
  result: IGetVolunteerSessionRatingResult;
}

const getVolunteerSessionRatingIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":335,"b":345}]}],"statement":"SELECT\n    score\nFROM\n    upchieve.users_surveys\n    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     score
 * FROM
 *     upchieve.users_surveys
 *     JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 * WHERE
 *     users_surveys.session_id = :sessionId!
 *     AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
 * ```
 */
export const getVolunteerSessionRating = new PreparedQuery<IGetVolunteerSessionRatingParams,IGetVolunteerSessionRatingResult>(getVolunteerSessionRatingIR);


/** 'DeleteDuplicateUserSurveys' parameters type */
export type IDeleteDuplicateUserSurveysParams = void;

/** 'DeleteDuplicateUserSurveys' return type */
export type IDeleteDuplicateUserSurveysResult = void;

/** 'DeleteDuplicateUserSurveys' query type */
export interface IDeleteDuplicateUserSurveysQuery {
  params: IDeleteDuplicateUserSurveysParams;
  result: IDeleteDuplicateUserSurveysResult;
}

const deleteDuplicateUserSurveysIR: any = {"usedParamSet":{},"params":[],"statement":"DELETE FROM upchieve.users_surveys\nWHERE id IN (\n        SELECT\n            id\n        FROM (\n            SELECT\n                id,\n                ROW_NUMBER() OVER (PARTITION BY user_id, session_id, survey_id, survey_type_id ORDER BY created_at DESC) AS row_num,\n                created_at\n            FROM\n                users_surveys) t\n        WHERE\n            t.row_num > 1)"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM upchieve.users_surveys
 * WHERE id IN (
 *         SELECT
 *             id
 *         FROM (
 *             SELECT
 *                 id,
 *                 ROW_NUMBER() OVER (PARTITION BY user_id, session_id, survey_id, survey_type_id ORDER BY created_at DESC) AS row_num,
 *                 created_at
 *             FROM
 *                 users_surveys) t
 *         WHERE
 *             t.row_num > 1)
 * ```
 */
export const deleteDuplicateUserSurveys = new PreparedQuery<IDeleteDuplicateUserSurveysParams,IDeleteDuplicateUserSurveysResult>(deleteDuplicateUserSurveysIR);


/** 'GetProgressReportSurveyResponse' parameters type */
export interface IGetProgressReportSurveyResponseParams {
  progressReportId: string;
  userId: string;
}

/** 'GetProgressReportSurveyResponse' return type */
export interface IGetProgressReportSurveyResponseResult {
  displayImage: string | null;
  displayLabel: string | null;
  displayOrder: number;
  questionId: number;
  response: string | null;
  responseId: number;
  score: number | null;
  userSurveyId: string;
}

/** 'GetProgressReportSurveyResponse' query type */
export interface IGetProgressReportSurveyResponseQuery {
  params: IGetProgressReportSurveyResponseParams;
  result: IGetProgressReportSurveyResponseResult;
}

const getProgressReportSurveyResponseIR: any = {"usedParamSet":{"progressReportId":true,"userId":true},"params":[{"name":"progressReportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":226,"b":243}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1559,"b":1566}]}],"statement":"WITH latest_users_surveys AS (\n    SELECT\n        us.user_id,\n        us.progress_report_id,\n        MAX(us.created_at) AS latest_created_at\n    FROM\n        upchieve.users_surveys us\n    WHERE\n        us.progress_report_id = :progressReportId!\n    GROUP BY\n        us.user_id,\n        us.progress_report_id\n)\nSELECT\n    us.id AS user_survey_id,\n    FORMAT(sq.question_text) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            AND qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    src.display_image AS display_image,\n    sq.id::int AS question_id,\n    src.id AS response_id\nFROM\n    upchieve.users_surveys us\n    INNER JOIN latest_users_surveys lus ON us.user_id = lus.user_id\n        AND us.progress_report_id = lus.progress_report_id\n        AND us.created_at = lus.latest_created_at\n    JOIN upchieve.survey_types st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types qt ON qt.id = sq.question_type_id\nWHERE\n    st.name = 'progress-report'\n    AND us.user_id = :userId!\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * WITH latest_users_surveys AS (
 *     SELECT
 *         us.user_id,
 *         us.progress_report_id,
 *         MAX(us.created_at) AS latest_created_at
 *     FROM
 *         upchieve.users_surveys us
 *     WHERE
 *         us.progress_report_id = :progressReportId!
 *     GROUP BY
 *         us.user_id,
 *         us.progress_report_id
 * )
 * SELECT
 *     us.id AS user_survey_id,
 *     FORMAT(sq.question_text) AS display_label,
 *     (
 *         CASE WHEN (src.choice_text = 'Other'
 *             AND qt.name = 'free response') THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order,
 *     src.display_image AS display_image,
 *     sq.id::int AS question_id,
 *     src.id AS response_id
 * FROM
 *     upchieve.users_surveys us
 *     INNER JOIN latest_users_surveys lus ON us.user_id = lus.user_id
 *         AND us.progress_report_id = lus.progress_report_id
 *         AND us.created_at = lus.latest_created_at
 *     JOIN upchieve.survey_types st ON us.survey_type_id = st.id
 *     JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *     LEFT JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN upchieve.surveys_survey_questions ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 *     LEFT JOIN upchieve.question_types qt ON qt.id = sq.question_type_id
 * WHERE
 *     st.name = 'progress-report'
 *     AND us.user_id = :userId!
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getProgressReportSurveyResponse = new PreparedQuery<IGetProgressReportSurveyResponseParams,IGetProgressReportSurveyResponseResult>(getProgressReportSurveyResponseIR);


/** 'GetPostsessionSurveyResponsesForSessionsByUserId' parameters type */
export interface IGetPostsessionSurveyResponsesForSessionsByUserIdParams {
  userId: string;
}

/** 'GetPostsessionSurveyResponsesForSessionsByUserId' return type */
export interface IGetPostsessionSurveyResponsesForSessionsByUserIdResult {
  choiceText: string;
  createdAt: Date;
  roleInSession: string | null;
  score: number;
  sessionId: string;
  submitterUserId: string;
  surveyResponseChoiceId: number | null;
}

/** 'GetPostsessionSurveyResponsesForSessionsByUserId' query type */
export interface IGetPostsessionSurveyResponsesForSessionsByUserIdQuery {
  params: IGetPostsessionSurveyResponsesForSessionsByUserIdParams;
  result: IGetPostsessionSurveyResponsesForSessionsByUserIdResult;
}

const getPostsessionSurveyResponsesForSessionsByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":679,"b":686},{"a":712,"b":719}]}],"statement":"SELECT\n    s.id AS session_id,\n    CASE WHEN s.student_id = us.user_id THEN\n        'student'\n    ELSE\n        'volunteer'\n    END AS role_in_session,\n    us.user_id AS submitter_user_id,\n    us.created_at,\n    uss.survey_response_choice_id,\n    src.score,\n    src.choice_text\nFROM\n    sessions s\n    JOIN upchieve.users_surveys us ON us.session_id = s.id\n    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_types st ON st.id = us.survey_type_id\nWHERE (s.student_id = :userId!\n    OR s.volunteer_id = :userId!)\nAND st.name = 'postsession'\nAND sq.question_text IN ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', '%s''s goal for this session was to %s. Were you able to help them achieve their goal?')\nAND src.choice_text IN ('Not at all', 'Sorta but not really', 'I guess so', 'I''m def closer to my goal', 'GOAL ACHIEVED', 'Somewhat', 'Mostly', 'A lot')\nORDER BY\n    uss.created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     s.id AS session_id,
 *     CASE WHEN s.student_id = us.user_id THEN
 *         'student'
 *     ELSE
 *         'volunteer'
 *     END AS role_in_session,
 *     us.user_id AS submitter_user_id,
 *     us.created_at,
 *     uss.survey_response_choice_id,
 *     src.score,
 *     src.choice_text
 * FROM
 *     sessions s
 *     JOIN upchieve.users_surveys us ON us.session_id = s.id
 *     JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_types st ON st.id = us.survey_type_id
 * WHERE (s.student_id = :userId!
 *     OR s.volunteer_id = :userId!)
 * AND st.name = 'postsession'
 * AND sq.question_text IN ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', '%s''s goal for this session was to %s. Were you able to help them achieve their goal?')
 * AND src.choice_text IN ('Not at all', 'Sorta but not really', 'I guess so', 'I''m def closer to my goal', 'GOAL ACHIEVED', 'Somewhat', 'Mostly', 'A lot')
 * ORDER BY
 *     uss.created_at DESC
 * ```
 */
export const getPostsessionSurveyResponsesForSessionsByUserId = new PreparedQuery<IGetPostsessionSurveyResponsesForSessionsByUserIdParams,IGetPostsessionSurveyResponsesForSessionsByUserIdResult>(getPostsessionSurveyResponsesForSessionsByUserIdIR);


/** 'GetLatestUserSubmissionsForSurvey' parameters type */
export interface IGetLatestUserSubmissionsForSurveyParams {
  surveyId?: number | null | void;
  surveyType?: string | null | void;
  userId: string;
}

/** 'GetLatestUserSubmissionsForSurvey' return type */
export interface IGetLatestUserSubmissionsForSurveyResult {
  displayLabel: string;
  displayOrder: number;
  questionId: number;
  response: string | null;
  responseId: number;
  score: number | null;
}

/** 'GetLatestUserSubmissionsForSurvey' query type */
export interface IGetLatestUserSubmissionsForSurveyQuery {
  params: IGetLatestUserSubmissionsForSurveyParams;
  result: IGetLatestUserSubmissionsForSurveyResult;
}

const getLatestUserSubmissionsForSurveyIR: any = {"usedParamSet":{"userId":true,"surveyId":true,"surveyType":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":292,"b":299}]},{"name":"surveyId","required":false,"transform":{"type":"scalar"},"locs":[{"a":320,"b":328},{"a":384,"b":392}]},{"name":"surveyType","required":false,"transform":{"type":"scalar"},"locs":[{"a":413,"b":423},{"a":474,"b":484}]}],"statement":"WITH most_recent_survey_submission AS (\n    SELECT\n        users_surveys.id,\n        users_surveys.survey_id,\n        users_surveys.created_at\n    FROM\n        users_surveys\n        JOIN survey_types ON users_surveys.survey_type_id = survey_types.id\n    WHERE\n        users_surveys.user_id = :userId!::uuid\n        AND (:surveyId::int IS NULL\n            OR users_surveys.survey_id = :surveyId::int)\n        AND (:surveyType::text IS NULL\n            OR survey_types.name = :surveyType::text)\n    ORDER BY\n        users_surveys.created_at DESC\n    LIMIT 1\n)\nSELECT\n    sq.question_text AS display_label,\n    (\n        CASE WHEN src.choice_text = 'Other'\n            OR uss.open_response IS NOT NULL THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    sq.id::int AS question_id,\n    src.id::int AS response_id\nFROM\n    most_recent_survey_submission mrss\n    JOIN users_surveys_submissions uss ON mrss.id = uss.user_survey_id\n    JOIN survey_questions sq ON uss.survey_question_id = sq.id\n    LEFT JOIN surveys_survey_questions ssq ON uss.survey_question_id = ssq.survey_question_id\n        AND mrss.survey_id = ssq.survey_id\n    LEFT JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id\nORDER BY\n    ssq.display_priority ASC"};

/**
 * Query generated from SQL:
 * ```
 * WITH most_recent_survey_submission AS (
 *     SELECT
 *         users_surveys.id,
 *         users_surveys.survey_id,
 *         users_surveys.created_at
 *     FROM
 *         users_surveys
 *         JOIN survey_types ON users_surveys.survey_type_id = survey_types.id
 *     WHERE
 *         users_surveys.user_id = :userId!::uuid
 *         AND (:surveyId::int IS NULL
 *             OR users_surveys.survey_id = :surveyId::int)
 *         AND (:surveyType::text IS NULL
 *             OR survey_types.name = :surveyType::text)
 *     ORDER BY
 *         users_surveys.created_at DESC
 *     LIMIT 1
 * )
 * SELECT
 *     sq.question_text AS display_label,
 *     (
 *         CASE WHEN src.choice_text = 'Other'
 *             OR uss.open_response IS NOT NULL THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order,
 *     sq.id::int AS question_id,
 *     src.id::int AS response_id
 * FROM
 *     most_recent_survey_submission mrss
 *     JOIN users_surveys_submissions uss ON mrss.id = uss.user_survey_id
 *     JOIN survey_questions sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN surveys_survey_questions ssq ON uss.survey_question_id = ssq.survey_question_id
 *         AND mrss.survey_id = ssq.survey_id
 *     LEFT JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getLatestUserSubmissionsForSurvey = new PreparedQuery<IGetLatestUserSubmissionsForSurveyParams,IGetLatestUserSubmissionsForSurveyResult>(getLatestUserSubmissionsForSurveyIR);


/** 'GetSurveyIdForLatestImpactStudySurveySubmission' parameters type */
export interface IGetSurveyIdForLatestImpactStudySurveySubmissionParams {
  userId: string;
}

/** 'GetSurveyIdForLatestImpactStudySurveySubmission' return type */
export interface IGetSurveyIdForLatestImpactStudySurveySubmissionResult {
  surveyId: number;
}

/** 'GetSurveyIdForLatestImpactStudySurveySubmission' query type */
export interface IGetSurveyIdForLatestImpactStudySurveySubmissionQuery {
  params: IGetSurveyIdForLatestImpactStudySurveySubmissionParams;
  result: IGetSurveyIdForLatestImpactStudySurveySubmissionResult;
}

const getSurveyIdForLatestImpactStudySurveySubmissionIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":164,"b":171}]}],"statement":"SELECT\n    users_surveys.survey_id\nFROM\n    users_surveys\n    JOIN survey_types ON users_surveys.survey_type_id = survey_types.id\nWHERE\n    users_surveys.user_id = :userId!::uuid\n    AND survey_types.name = 'impact-study'\nORDER BY\n    users_surveys.created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users_surveys.survey_id
 * FROM
 *     users_surveys
 *     JOIN survey_types ON users_surveys.survey_type_id = survey_types.id
 * WHERE
 *     users_surveys.user_id = :userId!::uuid
 *     AND survey_types.name = 'impact-study'
 * ORDER BY
 *     users_surveys.created_at DESC
 * LIMIT 1
 * ```
 */
export const getSurveyIdForLatestImpactStudySurveySubmission = new PreparedQuery<IGetSurveyIdForLatestImpactStudySurveySubmissionParams,IGetSurveyIdForLatestImpactStudySurveySubmissionResult>(getSurveyIdForLatestImpactStudySurveySubmissionIR);


/** 'GetSurveyTypeFromSurveyTypeId' parameters type */
export interface IGetSurveyTypeFromSurveyTypeIdParams {
  surveyTypeId: number;
}

/** 'GetSurveyTypeFromSurveyTypeId' return type */
export interface IGetSurveyTypeFromSurveyTypeIdResult {
  surveyType: string;
}

/** 'GetSurveyTypeFromSurveyTypeId' query type */
export interface IGetSurveyTypeFromSurveyTypeIdQuery {
  params: IGetSurveyTypeFromSurveyTypeIdParams;
  result: IGetSurveyTypeFromSurveyTypeIdResult;
}

const getSurveyTypeFromSurveyTypeIdIR: any = {"usedParamSet":{"surveyTypeId":true},"params":[{"name":"surveyTypeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":81}]}],"statement":"SELECT\n    name AS survey_type\nFROM\n    survey_types\nWHERE\n    id = :surveyTypeId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     name AS survey_type
 * FROM
 *     survey_types
 * WHERE
 *     id = :surveyTypeId!
 * ```
 */
export const getSurveyTypeFromSurveyTypeId = new PreparedQuery<IGetSurveyTypeFromSurveyTypeIdParams,IGetSurveyTypeFromSurveyTypeIdResult>(getSurveyTypeFromSurveyTypeIdIR);


