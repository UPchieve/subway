/** Types generated for queries found in "server/models/AssistmentsData/assistments_data.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAssistmentsDataBySession' parameters type */
export interface IGetAssistmentsDataBySessionParams {
  sessionId: string;
}

/** 'GetAssistmentsDataBySession' return type */
export interface IGetAssistmentsDataBySessionResult {
  assignmentId: string;
  id: string;
  problemId: number;
  sent: boolean | null;
  sessionId: string;
  studentId: string;
}

/** 'GetAssistmentsDataBySession' query type */
export interface IGetAssistmentsDataBySessionQuery {
  params: IGetAssistmentsDataBySessionParams;
  result: IGetAssistmentsDataBySessionResult;
}

const getAssistmentsDataBySessionIR: any = {"name":"getAssistmentsDataBySession","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":181,"b":190,"line":12,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    problem_id,\n    assignment_id,\n    student_id,\n    session_id,\n    sent\nFROM\n    assistments_data\nWHERE\n    session_id = :sessionId!","loc":{"a":40,"b":190,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     problem_id,
 *     assignment_id,
 *     student_id,
 *     session_id,
 *     sent
 * FROM
 *     assistments_data
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getAssistmentsDataBySession = new PreparedQuery<IGetAssistmentsDataBySessionParams,IGetAssistmentsDataBySessionResult>(getAssistmentsDataBySessionIR);


/** 'UpdateAssistmentsDataSentById' parameters type */
export interface IUpdateAssistmentsDataSentByIdParams {
  assistmentsDataId: string;
}

/** 'UpdateAssistmentsDataSentById' return type */
export interface IUpdateAssistmentsDataSentByIdResult {
  id: string;
}

/** 'UpdateAssistmentsDataSentById' query type */
export interface IUpdateAssistmentsDataSentByIdQuery {
  params: IUpdateAssistmentsDataSentByIdParams;
  result: IUpdateAssistmentsDataSentByIdResult;
}

const updateAssistmentsDataSentByIdIR: any = {"name":"updateAssistmentsDataSentById","params":[{"name":"assistmentsDataId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":301,"b":318,"line":21,"col":10}]}}],"usedParamSet":{"assistmentsDataId":true},"statement":{"body":"UPDATE\n    assistments_data\nSET\n    sent = TRUE\nWHERE\n    id = :assistmentsDataId!\nRETURNING\n    id","loc":{"a":237,"b":335,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     assistments_data
 * SET
 *     sent = TRUE
 * WHERE
 *     id = :assistmentsDataId!
 * RETURNING
 *     id
 * ```
 */
export const updateAssistmentsDataSentById = new PreparedQuery<IUpdateAssistmentsDataSentByIdParams,IUpdateAssistmentsDataSentByIdResult>(updateAssistmentsDataSentByIdIR);


/** 'CreateAssistmentsDataBySessionId' parameters type */
export interface ICreateAssistmentsDataBySessionIdParams {
  assignmentId: string;
  id: string;
  problemId: number;
  sessionId: string;
  studentId: string;
}

/** 'CreateAssistmentsDataBySessionId' return type */
export interface ICreateAssistmentsDataBySessionIdResult {
  assignmentId: string;
  id: string;
  problemId: number;
  sent: boolean | null;
  sessionId: string;
  studentId: string;
}

/** 'CreateAssistmentsDataBySessionId' query type */
export interface ICreateAssistmentsDataBySessionIdQuery {
  params: ICreateAssistmentsDataBySessionIdParams;
  result: ICreateAssistmentsDataBySessionIdResult;
}

const createAssistmentsDataBySessionIdIR: any = {"name":"createAssistmentsDataBySessionId","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":512,"b":514,"line":29,"col":5}]}},{"name":"problemId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":522,"b":531,"line":30,"col":5}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":539,"b":551,"line":31,"col":5}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":559,"b":568,"line":32,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":576,"b":585,"line":33,"col":5},{"a":766,"b":775,"line":44,"col":26}]}}],"usedParamSet":{"id":true,"problemId":true,"assignmentId":true,"studentId":true,"sessionId":true},"statement":{"body":"INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)\nSELECT\n    :id!,\n    :problemId!,\n    :assignmentId!,\n    :studentId!,\n    :sessionId!,\n    FALSE,\n    NOW()::date,\n    NOW()::date\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            assistments_data\n        WHERE\n            session_id = :sessionId!)\nRETURNING\n    id,\n    problem_id,\n    assignment_id,\n    student_id,\n    session_id,\n    sent","loc":{"a":385,"b":870,"line":27,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :problemId!,
 *     :assignmentId!,
 *     :studentId!,
 *     :sessionId!,
 *     FALSE,
 *     NOW()::date,
 *     NOW()::date
 * WHERE
 *     NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             assistments_data
 *         WHERE
 *             session_id = :sessionId!)
 * RETURNING
 *     id,
 *     problem_id,
 *     assignment_id,
 *     student_id,
 *     session_id,
 *     sent
 * ```
 */
export const createAssistmentsDataBySessionId = new PreparedQuery<ICreateAssistmentsDataBySessionIdParams,ICreateAssistmentsDataBySessionIdResult>(createAssistmentsDataBySessionIdIR);

