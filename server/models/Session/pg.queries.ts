/** Types generated for queries found in "server/models/Session/session.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'AddNotification' parameters type */
export interface IAddNotificationParams {
  id: string;
  method: string;
  priorityGroup: string;
  sessionId: string;
  type: string;
  volunteer: string;
  wasSuccessful: boolean;
}

/** 'AddNotification' return type */
export interface IAddNotificationResult {
  ok: string;
}

/** 'AddNotification' query type */
export interface IAddNotificationQuery {
  params: IAddNotificationParams;
  result: IAddNotificationResult;
}

const addNotificationIR: any = {"name":"addNotification","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":178,"b":180,"line":6,"col":5}]}},{"name":"volunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":188,"b":197,"line":7,"col":5}]}},{"name":"wasSuccessful","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":309,"b":322,"line":12,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":330,"b":339,"line":13,"col":5}]}},{"name":"type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":512,"b":516,"line":21,"col":31}]}},{"name":"method","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":557,"b":563,"line":22,"col":39}]}},{"name":"priorityGroup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":610,"b":623,"line":23,"col":45}]}}],"usedParamSet":{"id":true,"volunteer":true,"wasSuccessful":true,"sessionId":true,"type":true,"method":true,"priorityGroup":true},"statement":{"body":"INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)\nSELECT\n    :id!,\n    :volunteer!,\n    NOW(),\n    notification_types.id,\n    notification_methods.id,\n    notification_priority_groups.id,\n    :wasSuccessful!,\n    :sessionId!,\n    NOW(),\n    NOW()\nFROM\n    notification_types\n    JOIN notification_methods ON TRUE\n    JOIN notification_priority_groups ON TRUE\nWHERE\n    notification_types.type = :type!\n    AND notification_methods.method = :method!\n    AND notification_priority_groups.name = :priorityGroup!\nRETURNING\n    id AS ok","loc":{"a":30,"b":646,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :volunteer!,
 *     NOW(),
 *     notification_types.id,
 *     notification_methods.id,
 *     notification_priority_groups.id,
 *     :wasSuccessful!,
 *     :sessionId!,
 *     NOW(),
 *     NOW()
 * FROM
 *     notification_types
 *     JOIN notification_methods ON TRUE
 *     JOIN notification_priority_groups ON TRUE
 * WHERE
 *     notification_types.type = :type!
 *     AND notification_methods.method = :method!
 *     AND notification_priority_groups.name = :priorityGroup!
 * RETURNING
 *     id AS ok
 * ```
 */
export const addNotification = new PreparedQuery<IAddNotificationParams,IAddNotificationResult>(addNotificationIR);


/** 'GetUnfilledSessions' parameters type */
export interface IGetUnfilledSessionsParams {
  start: Date;
}

/** 'GetUnfilledSessions' return type */
export interface IGetUnfilledSessionsResult {
  createdAt: Date;
  id: string;
  isFirstTimeStudent: boolean | null;
  studentFirstName: string;
  studentTestUser: boolean;
  subTopic: string;
  type: string;
  volunteer: string | null;
}

/** 'GetUnfilledSessions' query type */
export interface IGetUnfilledSessionsQuery {
  params: IGetUnfilledSessionsParams;
  result: IGetUnfilledSessionsResult;
}

const getUnfilledSessionsIR: any = {"name":"getUnfilledSessions","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1426,"b":1431,"line":53,"col":31}]}}],"usedParamSet":{"start":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.volunteer_id AS volunteer,\n    sessions.created_at,\n    users.first_name AS student_first_name,\n    users.test_user AS student_test_user,\n    session_count.total = 1 AS is_first_time_student\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN LATERAL (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id) AS session_count ON TRUE\nWHERE\n    sessions.volunteer_id IS NULL\n    AND sessions.ended_at IS NULL\n    AND sessions.created_at > :start!\n    AND users.banned IS FALSE\nORDER BY\n    sessions.created_at","loc":{"a":683,"b":1494,"line":29,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.volunteer_id AS volunteer,
 *     sessions.created_at,
 *     users.first_name AS student_first_name,
 *     users.test_user AS student_test_user,
 *     session_count.total = 1 AS is_first_time_student
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN LATERAL (
 *         SELECT
 *             COUNT(*) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = users.id) AS session_count ON TRUE
 * WHERE
 *     sessions.volunteer_id IS NULL
 *     AND sessions.ended_at IS NULL
 *     AND sessions.created_at > :start!
 *     AND users.banned IS FALSE
 * ORDER BY
 *     sessions.created_at
 * ```
 */
export const getUnfilledSessions = new PreparedQuery<IGetUnfilledSessionsParams,IGetUnfilledSessionsResult>(getUnfilledSessionsIR);


/** 'GetSessionById' parameters type */
export interface IGetSessionByIdParams {
  sessionId: string;
}

/** 'GetSessionById' return type */
export interface IGetSessionByIdResult {
  createdAt: Date;
  endedAt: Date | null;
  endedByRole: string;
  flags: stringArray | null;
  hasWhiteboardDoc: boolean;
  id: string;
  quillDoc: string | null;
  reported: boolean | null;
  reviewed: boolean;
  studentBanned: boolean | null;
  studentId: string;
  subject: string;
  timeTutored: number | null;
  topic: string;
  toReview: boolean;
  updatedAt: Date;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionById' query type */
export interface IGetSessionByIdQuery {
  params: IGetSessionByIdParams;
  result: IGetSessionByIdResult;
}

const getSessionByIdIR: any = {"name":"getSessionById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2843,"b":2852,"line":101,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    has_whiteboard_doc,\n    quill_doc,\n    volunteer_joined_at,\n    ended_at,\n    user_roles.name AS ended_by_role,\n    reviewed,\n    to_review,\n    student_banned,\n    (time_tutored)::float,\n    sessions.created_at,\n    sessions.updated_at,\n    session_reported_count.total <> 0 AS reported,\n    COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS flags\n        FROM\n            sessions_session_flags\n            LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE\nWHERE\n    sessions.id = :sessionId!","loc":{"a":1526,"b":2852,"line":60,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     student_id,
 *     volunteer_id,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     has_whiteboard_doc,
 *     quill_doc,
 *     volunteer_joined_at,
 *     ended_at,
 *     user_roles.name AS ended_by_role,
 *     reviewed,
 *     to_review,
 *     student_banned,
 *     (time_tutored)::float,
 *     sessions.created_at,
 *     sessions.updated_at,
 *     session_reported_count.total <> 0 AS reported,
 *     COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
 *     LEFT JOIN session_reports ON session_reports.session_id = sessions.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(name) AS flags
 *         FROM
 *             sessions_session_flags
 *             LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
 *         WHERE
 *             sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getSessionById = new PreparedQuery<IGetSessionByIdParams,IGetSessionByIdResult>(getSessionByIdIR);


/** 'InsertSessionFlagById' parameters type */
export interface IInsertSessionFlagByIdParams {
  flag: string;
  sessionId: string;
}

/** 'InsertSessionFlagById' return type */
export interface IInsertSessionFlagByIdResult {
  ok: string;
}

/** 'InsertSessionFlagById' query type */
export interface IInsertSessionFlagByIdQuery {
  params: IInsertSessionFlagByIdParams;
  result: IInsertSessionFlagByIdResult;
}

const insertSessionFlagByIdIR: any = {"name":"insertSessionFlagById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2992,"b":3001,"line":107,"col":5}]}},{"name":"flag","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3088,"b":3092,"line":114,"col":12}]}}],"usedParamSet":{"sessionId":true,"flag":true},"statement":{"body":"INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)\nSELECT\n    :sessionId!,\n    session_flags.id,\n    NOW(),\n    NOW()\nFROM\n    session_flags\nWHERE\n    name = :flag!\nON CONFLICT (session_id,\n    session_flag_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        session_id AS ok","loc":{"a":2891,"b":3222,"line":105,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)
 * SELECT
 *     :sessionId!,
 *     session_flags.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     session_flags
 * WHERE
 *     name = :flag!
 * ON CONFLICT (session_id,
 *     session_flag_id)
 *     DO UPDATE SET
 *         updated_at = NOW()
 *     RETURNING
 *         session_id AS ok
 * ```
 */
export const insertSessionFlagById = new PreparedQuery<IInsertSessionFlagByIdParams,IInsertSessionFlagByIdResult>(insertSessionFlagByIdIR);


/** 'UpdateSessionToReview' parameters type */
export interface IUpdateSessionToReviewParams {
  sessionId: string;
}

/** 'UpdateSessionToReview' return type */
export interface IUpdateSessionToReviewResult {
  ok: string;
}

/** 'UpdateSessionToReview' query type */
export interface IUpdateSessionToReviewQuery {
  params: IUpdateSessionToReviewParams;
  result: IUpdateSessionToReviewResult;
}

const updateSessionToReviewIR: any = {"name":"updateSessionToReview","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3322,"b":3331,"line":129,"col":10}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    to_review = TRUE\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":3261,"b":3354,"line":124,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     to_review = TRUE
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionToReview = new PreparedQuery<IUpdateSessionToReviewParams,IUpdateSessionToReviewResult>(updateSessionToReviewIR);


/** 'UpdateSessionReviewedStatusById' parameters type */
export interface IUpdateSessionReviewedStatusByIdParams {
  reviewed: boolean;
  sessionId: string;
  toReview: boolean;
}

/** 'UpdateSessionReviewedStatusById' return type */
export interface IUpdateSessionReviewedStatusByIdResult {
  ok: string;
}

/** 'UpdateSessionReviewedStatusById' query type */
export interface IUpdateSessionReviewedStatusByIdQuery {
  params: IUpdateSessionReviewedStatusByIdParams;
  result: IUpdateSessionReviewedStatusByIdResult;
}

const updateSessionReviewedStatusByIdIR: any = {"name":"updateSessionReviewedStatusById","params":[{"name":"reviewed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3443,"b":3451,"line":138,"col":16}]}},{"name":"toReview","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3471,"b":3479,"line":139,"col":17}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3521,"b":3530,"line":142,"col":10}]}}],"usedParamSet":{"reviewed":true,"toReview":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    reviewed = :reviewed!,\n    to_review = :toReview!,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":3403,"b":3553,"line":135,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     reviewed = :reviewed!,
 *     to_review = :toReview!,
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionReviewedStatusById = new PreparedQuery<IUpdateSessionReviewedStatusByIdParams,IUpdateSessionReviewedStatusByIdResult>(updateSessionReviewedStatusByIdIR);


/** 'GetSessionToEndById' parameters type */
export interface IGetSessionToEndByIdParams {
  sessionId: string;
}

/** 'GetSessionToEndById' return type */
export interface IGetSessionToEndByIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  reported: boolean | null;
  studentEmail: string;
  studentFirstName: string;
  studentId: string;
  studentNumPastSessions: number | null;
  subject: string;
  topic: string;
  updatedAt: Date;
  volunteerEmail: string;
  volunteerFirstName: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
  volunteerNumPastSessions: number | null;
  volunteerPartnerOrg: string;
}

/** 'GetSessionToEndById' query type */
export interface IGetSessionToEndByIdQuery {
  params: IGetSessionToEndByIdParams;
  result: IGetSessionToEndByIdResult;
}

const getSessionToEndByIdIR: any = {"name":"getSessionToEndById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5300,"b":5309,"line":196,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    volunteer_joined_at,\n    ended_at,\n    sessions.created_at,\n    sessions.updated_at,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    student_sessions.total AS student_num_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteer_sessions.total AS volunteer_num_past_sessions,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    session_reported_count.total <> 0 AS reported\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":3590,"b":5309,"line":148,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     student_id,
 *     volunteer_id,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     volunteer_joined_at,
 *     ended_at,
 *     sessions.created_at,
 *     sessions.updated_at,
 *     students.first_name AS student_first_name,
 *     students.email AS student_email,
 *     student_sessions.total AS student_num_past_sessions,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.email AS volunteer_email,
 *     volunteer_sessions.total AS volunteer_num_past_sessions,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     session_reported_count.total <> 0 AS reported
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 *     LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = students.id) AS student_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getSessionToEndById = new PreparedQuery<IGetSessionToEndByIdParams,IGetSessionToEndByIdResult>(getSessionToEndByIdIR);


/** 'GetSessionsToReview' parameters type */
export interface IGetSessionsToReviewParams {
  limit: number;
  offset: number;
}

/** 'GetSessionsToReview' return type */
export interface IGetSessionsToReviewResult {
  createdAt: Date;
  endedAt: Date | null;
  flags: stringArray | null;
  id: string;
  isReported: boolean | null;
  reviewReasons: stringArray | null;
  studentCounselingFeedback: Json | null;
  studentFirstName: string;
  subTopic: string;
  toReview: boolean;
  totalMessages: number | null;
  type: string;
  volunteer: string | null;
}

/** 'GetSessionsToReview' query type */
export interface IGetSessionsToReviewQuery {
  params: IGetSessionsToReviewParams;
  result: IGetSessionsToReviewResult;
}

const getSessionsToReviewIR: any = {"name":"getSessionsToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7370,"b":7375,"line":258,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7392,"b":7398,"line":258,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.volunteer_id AS volunteer,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    session_reported_count.total <> 0 AS is_reported,\n    flags.flags,\n    messages.total AS total_messages,\n    session_review_reason.review_reasons,\n    sessions.to_review,\n    student_feedback.student_counseling_feedback\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id\n            AND student_feedback.user_id = sessions.student_id)\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS flags\n        FROM\n            sessions_session_flags\n            JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS flags ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS messages ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\nWHERE\n    sessions.to_review IS TRUE\n    AND sessions.reviewed IS FALSE\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":5346,"b":7404,"line":200,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     sessions.volunteer_id AS volunteer,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     students.first_name AS student_first_name,
 *     session_reported_count.total <> 0 AS is_reported,
 *     flags.flags,
 *     messages.total AS total_messages,
 *     session_review_reason.review_reasons,
 *     sessions.to_review,
 *     student_feedback.student_counseling_feedback
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 *     LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id
 *             AND student_feedback.user_id = sessions.student_id)
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS flags
 *         FROM
 *             sessions_session_flags
 *             JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
 *         WHERE
 *             session_id = sessions.id
 *         GROUP BY
 *             session_id) AS flags ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_messages.session_id = sessions.id) AS messages ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS review_reasons
 *         FROM
 *             session_review_reasons
 *             LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 *         WHERE
 *             session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE
 * WHERE
 *     sessions.to_review IS TRUE
 *     AND sessions.reviewed IS FALSE
 * ORDER BY
 *     (sessions.created_at) DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getSessionsToReview = new PreparedQuery<IGetSessionsToReviewParams,IGetSessionsToReviewResult>(getSessionsToReviewIR);


/** 'GetTotalTimeTutoredForDateRange' parameters type */
export interface IGetTotalTimeTutoredForDateRangeParams {
  end: Date;
  start: Date;
  volunteerId: string;
}

/** 'GetTotalTimeTutoredForDateRange' return type */
export interface IGetTotalTimeTutoredForDateRangeResult {
  total: string | null;
}

/** 'GetTotalTimeTutoredForDateRange' query type */
export interface IGetTotalTimeTutoredForDateRangeQuery {
  params: IGetTotalTimeTutoredForDateRangeParams;
  result: IGetTotalTimeTutoredForDateRangeResult;
}

const getTotalTimeTutoredForDateRangeIR: any = {"name":"getTotalTimeTutoredForDateRange","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7543,"b":7554,"line":267,"col":20}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7579,"b":7584,"line":268,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7609,"b":7612,"line":269,"col":23}]}}],"usedParamSet":{"volunteerId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    SUM(time_tutored)::bigint AS total\nFROM\n    sessions\nWHERE\n    volunteer_id = :volunteerId!\n    AND created_at >= :start!\n    AND created_at <= :end!","loc":{"a":7453,"b":7612,"line":262,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     SUM(time_tutored)::bigint AS total
 * FROM
 *     sessions
 * WHERE
 *     volunteer_id = :volunteerId!
 *     AND created_at >= :start!
 *     AND created_at <= :end!
 * ```
 */
export const getTotalTimeTutoredForDateRange = new PreparedQuery<IGetTotalTimeTutoredForDateRangeParams,IGetTotalTimeTutoredForDateRangeResult>(getTotalTimeTutoredForDateRangeIR);


/** 'GetActiveSessionVolunteers' parameters type */
export type IGetActiveSessionVolunteersParams = void;

/** 'GetActiveSessionVolunteers' return type */
export interface IGetActiveSessionVolunteersResult {
  volunteerId: string | null;
}

/** 'GetActiveSessionVolunteers' query type */
export interface IGetActiveSessionVolunteersQuery {
  params: IGetActiveSessionVolunteersParams;
  result: IGetActiveSessionVolunteersResult;
}

const getActiveSessionVolunteersIR: any = {"name":"getActiveSessionVolunteers","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    sessions\nWHERE\n    ended_at IS NULL\n    AND NOT volunteer_id IS NULL","loc":{"a":7656,"b":7756,"line":273,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_id
 * FROM
 *     sessions
 * WHERE
 *     ended_at IS NULL
 *     AND NOT volunteer_id IS NULL
 * ```
 */
export const getActiveSessionVolunteers = new PreparedQuery<IGetActiveSessionVolunteersParams,IGetActiveSessionVolunteersResult>(getActiveSessionVolunteersIR);


/** 'UpdateSessionReported' parameters type */
export interface IUpdateSessionReportedParams {
  id: string;
  reportMessage: string;
  reportReason: string;
  sessionId: string;
}

/** 'UpdateSessionReported' return type */
export interface IUpdateSessionReportedResult {
  ok: string;
}

/** 'UpdateSessionReported' query type */
export interface IUpdateSessionReportedQuery {
  params: IUpdateSessionReportedParams;
  result: IUpdateSessionReportedResult;
}

const updateSessionReportedIR: any = {"name":"updateSessionReported","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7947,"b":7949,"line":285,"col":5}]}},{"name":"reportMessage","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7980,"b":7993,"line":287,"col":5}]}},{"name":"reportReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8156,"b":8168,"line":295,"col":52}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8195,"b":8204,"line":297,"col":19}]}}],"usedParamSet":{"id":true,"reportMessage":true,"reportReason":true,"sessionId":true},"statement":{"body":"INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)\nSELECT\n    :id!,\n    report_reasons.id,\n    :reportMessage!,\n    sessions.volunteer_id,\n    sessions.id,\n    sessions.student_id,\n    NOW(),\n    NOW()\nFROM\n    sessions\n    JOIN report_reasons ON report_reasons.reason = :reportReason!\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":7795,"b":8227,"line":283,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     report_reasons.id,
 *     :reportMessage!,
 *     sessions.volunteer_id,
 *     sessions.id,
 *     sessions.student_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     sessions
 *     JOIN report_reasons ON report_reasons.reason = :reportReason!
 * WHERE
 *     sessions.id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionReported = new PreparedQuery<IUpdateSessionReportedParams,IUpdateSessionReportedResult>(updateSessionReportedIR);


/** 'UpdateSessionTimeTutored' parameters type */
export interface IUpdateSessionTimeTutoredParams {
  sessionId: string;
  timeTutored: number;
}

/** 'UpdateSessionTimeTutored' return type */
export interface IUpdateSessionTimeTutoredResult {
  ok: string;
}

/** 'UpdateSessionTimeTutored' query type */
export interface IUpdateSessionTimeTutoredQuery {
  params: IUpdateSessionTimeTutoredParams;
  result: IUpdateSessionTimeTutoredResult;
}

const updateSessionTimeTutoredIR: any = {"name":"updateSessionTimeTutored","params":[{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8314,"b":8325,"line":306,"col":21}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8373,"b":8382,"line":309,"col":10}]}}],"usedParamSet":{"timeTutored":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    time_tutored = (:timeTutored!)::int,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8269,"b":8405,"line":303,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     time_tutored = (:timeTutored!)::int,
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionTimeTutored = new PreparedQuery<IUpdateSessionTimeTutoredParams,IUpdateSessionTimeTutoredResult>(updateSessionTimeTutoredIR);


/** 'UpdateSessionQuillDoc' parameters type */
export interface IUpdateSessionQuillDocParams {
  quillDoc: string;
  sessionId: string;
}

/** 'UpdateSessionQuillDoc' return type */
export interface IUpdateSessionQuillDocResult {
  ok: string;
}

/** 'UpdateSessionQuillDoc' query type */
export interface IUpdateSessionQuillDocQuery {
  params: IUpdateSessionQuillDocParams;
  result: IUpdateSessionQuillDocResult;
}

const updateSessionQuillDocIR: any = {"name":"updateSessionQuillDoc","params":[{"name":"quillDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8486,"b":8494,"line":318,"col":18}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8537,"b":8546,"line":321,"col":10}]}}],"usedParamSet":{"quillDoc":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    quill_doc = (:quillDoc!),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8444,"b":8569,"line":315,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     quill_doc = (:quillDoc!),
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionQuillDoc = new PreparedQuery<IUpdateSessionQuillDocParams,IUpdateSessionQuillDocResult>(updateSessionQuillDocIR);


/** 'UpdateSessionHasWhiteboardDoc' parameters type */
export interface IUpdateSessionHasWhiteboardDocParams {
  hasWhiteboardDoc: boolean;
  sessionId: string;
}

/** 'UpdateSessionHasWhiteboardDoc' return type */
export interface IUpdateSessionHasWhiteboardDocResult {
  ok: string;
}

/** 'UpdateSessionHasWhiteboardDoc' query type */
export interface IUpdateSessionHasWhiteboardDocQuery {
  params: IUpdateSessionHasWhiteboardDocParams;
  result: IUpdateSessionHasWhiteboardDocResult;
}

const updateSessionHasWhiteboardDocIR: any = {"name":"updateSessionHasWhiteboardDoc","params":[{"name":"hasWhiteboardDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8667,"b":8683,"line":330,"col":27}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8735,"b":8744,"line":333,"col":10}]}}],"usedParamSet":{"hasWhiteboardDoc":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8616,"b":8767,"line":327,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionHasWhiteboardDoc = new PreparedQuery<IUpdateSessionHasWhiteboardDocParams,IUpdateSessionHasWhiteboardDocResult>(updateSessionHasWhiteboardDocIR);


/** 'UpdateSessionToEnd' parameters type */
export interface IUpdateSessionToEndParams {
  endedAt: Date;
  endedBy: string | null | void;
  sessionId: string;
}

/** 'UpdateSessionToEnd' return type */
export interface IUpdateSessionToEndResult {
  ok: string;
}

/** 'UpdateSessionToEnd' query type */
export interface IUpdateSessionToEndQuery {
  params: IUpdateSessionToEndParams;
  result: IUpdateSessionToEndResult;
}

const updateSessionToEndIR: any = {"name":"updateSessionToEnd","params":[{"name":"endedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8843,"b":8850,"line":342,"col":16}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9036,"b":9045,"line":352,"col":19},{"a":9310,"b":9319,"line":362,"col":19}]}},{"name":"endedBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9118,"b":9124,"line":354,"col":43},{"a":9191,"b":9197,"line":356,"col":36}]}}],"usedParamSet":{"endedAt":true,"sessionId":true,"endedBy":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    ended_at = :endedAt!,\n    ended_by_role_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        user_roles.id\n    FROM\n        sessions\n    LEFT JOIN user_roles ON TRUE\nWHERE\n    sessions.id = :sessionId!\n    AND user_roles.name = (\n        CASE WHEN sessions.volunteer_id = :endedBy THEN\n            'volunteer'\n        WHEN sessions.student_id = :endedBy THEN\n            'student'\n        ELSE\n            'admin'\n        END)) AS subquery\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    sessions.id AS ok","loc":{"a":8803,"b":9351,"line":339,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     ended_at = :endedAt!,
 *     ended_by_role_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         user_roles.id
 *     FROM
 *         sessions
 *     LEFT JOIN user_roles ON TRUE
 * WHERE
 *     sessions.id = :sessionId!
 *     AND user_roles.name = (
 *         CASE WHEN sessions.volunteer_id = :endedBy THEN
 *             'volunteer'
 *         WHEN sessions.student_id = :endedBy THEN
 *             'student'
 *         ELSE
 *             'admin'
 *         END)) AS subquery
 * WHERE
 *     sessions.id = :sessionId!
 * RETURNING
 *     sessions.id AS ok
 * ```
 */
export const updateSessionToEnd = new PreparedQuery<IUpdateSessionToEndParams,IUpdateSessionToEndResult>(updateSessionToEndIR);


/** 'GetLongRunningSessions' parameters type */
export interface IGetLongRunningSessionsParams {
  end: Date;
  start: Date;
}

/** 'GetLongRunningSessions' return type */
export interface IGetLongRunningSessionsResult {
  id: string;
}

/** 'GetLongRunningSessions' query type */
export interface IGetLongRunningSessionsQuery {
  params: IGetLongRunningSessionsParams;
  result: IGetLongRunningSessionsResult;
}

const getLongRunningSessionsIR: any = {"name":"getLongRunningSessions","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9457,"b":9462,"line":373,"col":19}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9487,"b":9490,"line":374,"col":23}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    sessions.id\nFROM\n    sessions\nWHERE\n    created_at >= :start!\n    AND created_at <= :end!\n    AND ended_at IS NULL","loc":{"a":9391,"b":9515,"line":368,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id
 * FROM
 *     sessions
 * WHERE
 *     created_at >= :start!
 *     AND created_at <= :end!
 *     AND ended_at IS NULL
 * ```
 */
export const getLongRunningSessions = new PreparedQuery<IGetLongRunningSessionsParams,IGetLongRunningSessionsResult>(getLongRunningSessionsIR);


/** 'GetPublicSessionById' parameters type */
export interface IGetPublicSessionByIdParams {
  sessionId: string;
}

/** 'GetPublicSessionById' return type */
export interface IGetPublicSessionByIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentFirstName: string;
  studentId: string;
  subTopic: string;
  type: string;
  volunteerFirstName: string;
  volunteerId: string | null;
}

/** 'GetPublicSessionById' query type */
export interface IGetPublicSessionByIdQuery {
  params: IGetPublicSessionByIdParams;
  result: IGetPublicSessionByIdResult;
}

const getPublicSessionByIdIR: any = {"name":"getPublicSessionById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10126,"b":10135,"line":396,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.student_id,\n    sessions.volunteer_id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    volunteers.first_name AS volunteer_first_name\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":9553,"b":10135,"line":379,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     sessions.student_id,
 *     sessions.volunteer_id,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     students.first_name AS student_first_name,
 *     volunteers.first_name AS volunteer_first_name
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 *     LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getPublicSessionById = new PreparedQuery<IGetPublicSessionByIdParams,IGetPublicSessionByIdResult>(getPublicSessionByIdIR);


/** 'GetSessionForAdminView' parameters type */
export interface IGetSessionForAdminViewParams {
  sessionId: string;
}

/** 'GetSessionForAdminView' return type */
export interface IGetSessionForAdminViewResult {
  createdAt: Date;
  endedAt: Date | null;
  endedBy: string | null;
  id: string;
  photos: stringArray | null;
  quillDoc: string | null;
  reportMessage: string | null;
  reportReason: string;
  reviewReasons: stringArray | null;
  subTopic: string;
  timeTutored: number | null;
  toReview: boolean;
  type: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForAdminView' query type */
export interface IGetSessionForAdminViewQuery {
  params: IGetSessionForAdminViewParams;
  result: IGetSessionForAdminViewResult;
}

const getSessionForAdminViewIR: any = {"name":"getSessionForAdminView","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11793,"b":11802,"line":446,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.quill_doc,\n    sessions.time_tutored::int,\n    (\n        CASE WHEN user_roles.name = 'volunteer' THEN\n            sessions.volunteer_id\n        WHEN user_roles.name = 'student' THEN\n            sessions.student_id\n        ELSE\n            NULL\n        END) AS ended_by,\n    session_reports.report_message,\n    report_reasons.reason AS report_reason,\n    session_review_reason.review_reasons,\n    session_photo.photos,\n    sessions.to_review\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(photo_key) AS photos\n        FROM\n            session_photos\n        WHERE\n            session_photos.session_id = sessions.id) AS session_photo ON TRUE\nWHERE\n    sessions.id = :sessionId!","loc":{"a":10175,"b":11802,"line":400,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.volunteer_joined_at,
 *     sessions.quill_doc,
 *     sessions.time_tutored::int,
 *     (
 *         CASE WHEN user_roles.name = 'volunteer' THEN
 *             sessions.volunteer_id
 *         WHEN user_roles.name = 'student' THEN
 *             sessions.student_id
 *         ELSE
 *             NULL
 *         END) AS ended_by,
 *     session_reports.report_message,
 *     report_reasons.reason AS report_reason,
 *     session_review_reason.review_reasons,
 *     session_photo.photos,
 *     sessions.to_review
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
 *     LEFT JOIN session_reports ON session_reports.session_id = sessions.id
 *     LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS review_reasons
 *         FROM
 *             session_review_reasons
 *             LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 *         WHERE
 *             session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(photo_key) AS photos
 *         FROM
 *             session_photos
 *         WHERE
 *             session_photos.session_id = sessions.id) AS session_photo ON TRUE
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getSessionForAdminView = new PreparedQuery<IGetSessionForAdminViewParams,IGetSessionForAdminViewResult>(getSessionForAdminViewIR);


/** 'GetSessionUserAgent' parameters type */
export interface IGetSessionUserAgentParams {
  sessionId: string;
}

/** 'GetSessionUserAgent' return type */
export interface IGetSessionUserAgentResult {
  browser: string | null;
  browserVersion: string | null;
  device: string | null;
  operatingSystem: string | null;
  operatingSystemVersion: string | null;
}

/** 'GetSessionUserAgent' query type */
export interface IGetSessionUserAgentQuery {
  params: IGetSessionUserAgentParams;
  result: IGetSessionUserAgentResult;
}

const getSessionUserAgentIR: any = {"name":"getSessionUserAgent","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12002,"b":12011,"line":459,"col":31}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    user_actions.session_id = :sessionId!\n    AND user_actions.action = 'REQUESTED SESSION'\nLIMIT 1","loc":{"a":11839,"b":12069,"line":450,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     device,
 *     browser,
 *     browser_version,
 *     operating_system,
 *     operating_system_version
 * FROM
 *     user_actions
 * WHERE
 *     user_actions.session_id = :sessionId!
 *     AND user_actions.action = 'REQUESTED SESSION'
 * LIMIT 1
 * ```
 */
export const getSessionUserAgent = new PreparedQuery<IGetSessionUserAgentParams,IGetSessionUserAgentResult>(getSessionUserAgentIR);


/** 'GetUserForSessionAdminView' parameters type */
export interface IGetUserForSessionAdminViewParams {
  sessionId: string;
}

/** 'GetUserForSessionAdminView' return type */
export interface IGetUserForSessionAdminViewResult {
  createdAt: Date;
  firstname: string;
  id: string;
  isVolunteer: boolean | null;
  pastSessions: stringArray | null;
}

/** 'GetUserForSessionAdminView' query type */
export interface IGetUserForSessionAdminViewQuery {
  params: IGetUserForSessionAdminViewParams;
  result: IGetUserForSessionAdminViewResult;
}

const getUserForSessionAdminViewIR: any = {"name":"getUserForSessionAdminView","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12846,"b":12855,"line":490,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name AS firstname,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    past_sessions.total AS past_sessions\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sessions.id ORDER BY sessions.created_at) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id\n            OR volunteer_id = users.id) AS past_sessions ON TRUE\nWHERE\n    sessions.id = :sessionId!\nGROUP BY\n    users.id,\n    volunteer_profiles.user_id,\n    past_sessions.total","loc":{"a":12113,"b":12934,"line":465,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name AS firstname,
 *     users.created_at,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     past_sessions.total AS past_sessions
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     LEFT JOIN sessions ON sessions.student_id = users.id
 *         OR sessions.volunteer_id = users.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(sessions.id ORDER BY sessions.created_at) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = users.id
 *             OR volunteer_id = users.id) AS past_sessions ON TRUE
 * WHERE
 *     sessions.id = :sessionId!
 * GROUP BY
 *     users.id,
 *     volunteer_profiles.user_id,
 *     past_sessions.total
 * ```
 */
export const getUserForSessionAdminView = new PreparedQuery<IGetUserForSessionAdminViewParams,IGetUserForSessionAdminViewResult>(getUserForSessionAdminViewIR);


/** 'GetSessionMessagesForFrontend' parameters type */
export interface IGetSessionMessagesForFrontendParams {
  sessionId: string;
}

/** 'GetSessionMessagesForFrontend' return type */
export interface IGetSessionMessagesForFrontendResult {
  contents: string;
  createdAt: Date;
  id: string;
  sessionId: string;
  user: string;
}

/** 'GetSessionMessagesForFrontend' query type */
export interface IGetSessionMessagesForFrontendQuery {
  params: IGetSessionMessagesForFrontendParams;
  result: IGetSessionMessagesForFrontendResult;
}

const getSessionMessagesForFrontendIR: any = {"name":"getSessionMessagesForFrontend","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13114,"b":13123,"line":507,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    sender_id AS USER,\n    contents,\n    created_at,\n    session_id\nFROM\n    session_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at","loc":{"a":12981,"b":13147,"line":498,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     sender_id AS USER,
 *     contents,
 *     created_at,
 *     session_id
 * FROM
 *     session_messages
 * WHERE
 *     session_id = :sessionId!
 * ORDER BY
 *     created_at
 * ```
 */
export const getSessionMessagesForFrontend = new PreparedQuery<IGetSessionMessagesForFrontendParams,IGetSessionMessagesForFrontendResult>(getSessionMessagesForFrontendIR);


/** 'CreateSession' parameters type */
export interface ICreateSessionParams {
  id: string;
  studentBanned: boolean;
  studentId: string;
  subject: string;
}

/** 'CreateSession' return type */
export interface ICreateSessionResult {
  id: string;
}

/** 'CreateSession' query type */
export interface ICreateSessionQuery {
  params: ICreateSessionParams;
  result: ICreateSessionResult;
}

const createSessionIR: any = {"name":"createSession","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13280,"b":13282,"line":515,"col":5}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13290,"b":13299,"line":516,"col":5}]}},{"name":"studentBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13324,"b":13337,"line":518,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13406,"b":13413,"line":524,"col":21}]}}],"usedParamSet":{"id":true,"studentId":true,"studentBanned":true,"subject":true},"statement":{"body":"INSERT INTO sessions (id, student_id, subject_id, student_banned, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    subjects.id,\n    :studentBanned!,\n    NOW(),\n    NOW()\nFROM\n    subjects\nWHERE\n    subjects.name = :subject!\nRETURNING\n    sessions.id","loc":{"a":13178,"b":13439,"line":513,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions (id, student_id, subject_id, student_banned, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :studentId!,
 *     subjects.id,
 *     :studentBanned!,
 *     NOW(),
 *     NOW()
 * FROM
 *     subjects
 * WHERE
 *     subjects.name = :subject!
 * RETURNING
 *     sessions.id
 * ```
 */
export const createSession = new PreparedQuery<ICreateSessionParams,ICreateSessionResult>(createSessionIR);


/** 'GetCurrentSessionByUserId' parameters type */
export interface IGetCurrentSessionByUserIdParams {
  userId: string;
}

/** 'GetCurrentSessionByUserId' return type */
export interface IGetCurrentSessionByUserIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentId: string;
  subTopic: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetCurrentSessionByUserId' query type */
export interface IGetCurrentSessionByUserIdQuery {
  params: IGetCurrentSessionByUserIdParams;
  result: IGetCurrentSessionByUserIdResult;
}

const getCurrentSessionByUserIdIR: any = {"name":"getCurrentSessionByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13907,"b":13913,"line":544,"col":30},{"a":13947,"b":13953,"line":545,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND sessions.ended_at IS NULL","loc":{"a":13482,"b":13984,"line":530,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.volunteer_joined_at,
 *     sessions.volunteer_id,
 *     sessions.student_id,
 *     sessions.ended_at
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 * WHERE (sessions.student_id = :userId!
 *     OR sessions.volunteer_id = :userId!)
 * AND sessions.ended_at IS NULL
 * ```
 */
export const getCurrentSessionByUserId = new PreparedQuery<IGetCurrentSessionByUserIdParams,IGetCurrentSessionByUserIdResult>(getCurrentSessionByUserIdIR);


/** 'GetCurrentSessionBySessionId' parameters type */
export interface IGetCurrentSessionBySessionIdParams {
  sessionId: string | null | void;
}

/** 'GetCurrentSessionBySessionId' return type */
export interface IGetCurrentSessionBySessionIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentId: string;
  subTopic: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetCurrentSessionBySessionId' query type */
export interface IGetCurrentSessionBySessionIdQuery {
  params: IGetCurrentSessionBySessionIdParams;
  result: IGetCurrentSessionBySessionIdResult;
}

const getCurrentSessionBySessionIdIR: any = {"name":"getCurrentSessionBySessionId","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14450,"b":14458,"line":565,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    sessions.id = :sessionId","loc":{"a":14030,"b":14458,"line":550,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.volunteer_joined_at,
 *     sessions.volunteer_id,
 *     sessions.student_id,
 *     sessions.ended_at
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 * WHERE
 *     sessions.id = :sessionId
 * ```
 */
export const getCurrentSessionBySessionId = new PreparedQuery<IGetCurrentSessionBySessionIdParams,IGetCurrentSessionBySessionIdResult>(getCurrentSessionBySessionIdIR);


/** 'GetCurrentSessionUser' parameters type */
export interface IGetCurrentSessionUserParams {
  sessionId: string;
}

/** 'GetCurrentSessionUser' return type */
export interface IGetCurrentSessionUserResult {
  firstname: string;
  id: string;
  isVolunteer: boolean | null;
}

/** 'GetCurrentSessionUser' query type */
export interface IGetCurrentSessionUserQuery {
  params: IGetCurrentSessionUserParams;
  result: IGetCurrentSessionUserResult;
}

const getCurrentSessionUserIR: any = {"name":"getCurrentSessionUser","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14909,"b":14918,"line":584,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS firstname,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NULL THEN\n            FALSE\n        ELSE\n            TRUE\n        END) AS is_volunteer\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":14497,"b":14918,"line":569,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS firstname,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NULL THEN
 *             FALSE
 *         ELSE
 *             TRUE
 *         END) AS is_volunteer
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN sessions ON sessions.student_id = users.id
 *         OR sessions.volunteer_id = users.id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getCurrentSessionUser = new PreparedQuery<IGetCurrentSessionUserParams,IGetCurrentSessionUserResult>(getCurrentSessionUserIR);


/** 'GetLatestSessionByStudentId' parameters type */
export interface IGetLatestSessionByStudentIdParams {
  studentId: string;
}

/** 'GetLatestSessionByStudentId' return type */
export interface IGetLatestSessionByStudentIdResult {
  createdAt: Date;
  id: string;
}

/** 'GetLatestSessionByStudentId' query type */
export interface IGetLatestSessionByStudentIdQuery {
  params: IGetLatestSessionByStudentIdParams;
  result: IGetLatestSessionByStudentIdResult;
}

const getLatestSessionByStudentIdIR: any = {"name":"getLatestSessionByStudentId","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15044,"b":15053,"line":594,"col":27}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    id,\n    created_at\nFROM\n    sessions\nWHERE\n    sessions.student_id = :studentId!\nORDER BY\n    created_at DESC\nLIMIT 1","loc":{"a":14963,"b":15090,"line":588,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     created_at
 * FROM
 *     sessions
 * WHERE
 *     sessions.student_id = :studentId!
 * ORDER BY
 *     created_at DESC
 * LIMIT 1
 * ```
 */
export const getLatestSessionByStudentId = new PreparedQuery<IGetLatestSessionByStudentIdParams,IGetLatestSessionByStudentIdResult>(getLatestSessionByStudentIdIR);


/** 'UpdateSessionVolunteerById' parameters type */
export interface IUpdateSessionVolunteerByIdParams {
  sessionId: string;
  volunteerId: string;
}

/** 'UpdateSessionVolunteerById' return type */
export interface IUpdateSessionVolunteerByIdResult {
  ok: string;
}

/** 'UpdateSessionVolunteerById' query type */
export interface IUpdateSessionVolunteerByIdQuery {
  params: IUpdateSessionVolunteerByIdParams;
  result: IUpdateSessionVolunteerByIdResult;
}

const updateSessionVolunteerByIdIR: any = {"name":"updateSessionVolunteerById","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15178,"b":15189,"line":604,"col":20}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15264,"b":15273,"line":608,"col":10}]}}],"usedParamSet":{"volunteerId":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    volunteer_id = :volunteerId!,\n    volunteer_joined_at = NOW(),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":15134,"b":15296,"line":601,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     volunteer_id = :volunteerId!,
 *     volunteer_joined_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateSessionVolunteerById = new PreparedQuery<IUpdateSessionVolunteerByIdParams,IUpdateSessionVolunteerByIdResult>(updateSessionVolunteerByIdIR);


/** 'GetSessionForChatbot' parameters type */
export interface IGetSessionForChatbotParams {
  sessionId: string;
}

/** 'GetSessionForChatbot' return type */
export interface IGetSessionForChatbotResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  student: string;
  studentFirstName: string;
  subject: string;
  topic: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForChatbot' query type */
export interface IGetSessionForChatbotQuery {
  params: IGetSessionForChatbotParams;
  result: IGetSessionForChatbotResult;
}

const getSessionForChatbotIR: any = {"name":"getSessionForChatbot","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15781,"b":15790,"line":629,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.student_id AS student,\n    users.first_name AS student_first_name\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":15334,"b":15790,"line":614,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.volunteer_joined_at,
 *     sessions.student_id AS student,
 *     users.first_name AS student_first_name
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getSessionForChatbot = new PreparedQuery<IGetSessionForChatbotParams,IGetSessionForChatbotResult>(getSessionForChatbotIR);


/** 'InsertNewMessage' parameters type */
export interface IInsertNewMessageParams {
  contents: string;
  id: string;
  senderId: string;
  sessionId: string;
}

/** 'InsertNewMessage' return type */
export interface IInsertNewMessageResult {
  ok: string;
}

/** 'InsertNewMessage' query type */
export interface IInsertNewMessageQuery {
  params: IInsertNewMessageParams;
  result: IInsertNewMessageResult;
}

const insertNewMessageIR: any = {"name":"insertNewMessage","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15928,"b":15930,"line":634,"col":13}]}},{"name":"senderId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15934,"b":15942,"line":634,"col":19}]}},{"name":"contents","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15946,"b":15954,"line":634,"col":31}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15958,"b":15967,"line":634,"col":43}]}}],"usedParamSet":{"id":true,"senderId":true,"contents":true,"sessionId":true},"statement":{"body":"INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)\n    VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":15824,"b":16005,"line":633,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)
 *     VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertNewMessage = new PreparedQuery<IInsertNewMessageParams,IInsertNewMessageResult>(insertNewMessageIR);


/** 'GetSessionsWithAvgWaitTimePerDayAndHour' parameters type */
export interface IGetSessionsWithAvgWaitTimePerDayAndHourParams {
  end: Date;
  start: Date;
}

/** 'GetSessionsWithAvgWaitTimePerDayAndHour' return type */
export interface IGetSessionsWithAvgWaitTimePerDayAndHourResult {
  averageWaitTime: number | null;
  day: number | null;
  hour: number | null;
}

/** 'GetSessionsWithAvgWaitTimePerDayAndHour' query type */
export interface IGetSessionsWithAvgWaitTimePerDayAndHourQuery {
  params: IGetSessionsWithAvgWaitTimePerDayAndHourParams;
  result: IGetSessionsWithAvgWaitTimePerDayAndHourResult;
}

const getSessionsWithAvgWaitTimePerDayAndHourIR: any = {"name":"getSessionsWithAvgWaitTimePerDayAndHour","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16574,"b":16579,"line":652,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16612,"b":16615,"line":653,"col":31}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    extract(isodow FROM sessions.created_at)::int AS day,\n    extract(hour FROM sessions.created_at)::int AS hour,\n    COALESCE(AVG(\n            CASE WHEN sessions.volunteer_id IS NULL THEN\n                EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))\n            ELSE\n                EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))\n            END), 0)::float * 1000 AS average_wait_time -- in milliseconds\nFROM\n    sessions\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at < :end!\n    AND NOT sessions.ended_at IS NULL\n    AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60\nGROUP BY\n    day,\n    hour","loc":{"a":16062,"b":16757,"line":640,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     extract(isodow FROM sessions.created_at)::int AS day,
 *     extract(hour FROM sessions.created_at)::int AS hour,
 *     COALESCE(AVG(
 *             CASE WHEN sessions.volunteer_id IS NULL THEN
 *                 EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))
 *             ELSE
 *                 EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))
 *             END), 0)::float * 1000 AS average_wait_time -- in milliseconds
 * FROM
 *     sessions
 * WHERE
 *     sessions.created_at >= :start!
 *     AND sessions.created_at < :end!
 *     AND NOT sessions.ended_at IS NULL
 *     AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60
 * GROUP BY
 *     day,
 *     hour
 * ```
 */
export const getSessionsWithAvgWaitTimePerDayAndHour = new PreparedQuery<IGetSessionsWithAvgWaitTimePerDayAndHourParams,IGetSessionsWithAvgWaitTimePerDayAndHourResult>(getSessionsWithAvgWaitTimePerDayAndHourIR);


/** 'GetSessionsForReferCoworker' parameters type */
export interface IGetSessionsForReferCoworkerParams {
  volunteerId: string;
}

/** 'GetSessionsForReferCoworker' return type */
export interface IGetSessionsForReferCoworkerResult {
  id: string;
  volunteerFeedback: Json | null;
}

/** 'GetSessionsForReferCoworker' query type */
export interface IGetSessionsForReferCoworkerQuery {
  params: IGetSessionsForReferCoworkerParams;
  result: IGetSessionsForReferCoworkerResult;
}

const getSessionsForReferCoworkerIR: any = {"name":"getSessionsForReferCoworker","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17205,"b":17216,"line":672,"col":29}]}}],"usedParamSet":{"volunteerId":true},"statement":{"body":"SELECT\n    sessions.id,\n    feedbacks.volunteer_feedback\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n    LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id\n        AND feedbacks.user_id = sessions.volunteer_id\nWHERE\n    sessions.volunteer_id = :volunteerId!\n    AND sessions.time_tutored >= 15 * 60 * 1000\n    AND (session_flags.name IS NULL\n        OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\"}'))","loc":{"a":16802,"b":17384,"line":662,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     feedbacks.volunteer_feedback
 * FROM
 *     sessions
 *     LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
 *     LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
 *     LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id
 *         AND feedbacks.user_id = sessions.volunteer_id
 * WHERE
 *     sessions.volunteer_id = :volunteerId!
 *     AND sessions.time_tutored >= 15 * 60 * 1000
 *     AND (session_flags.name IS NULL
 *         OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer"}'))
 * ```
 */
export const getSessionsForReferCoworker = new PreparedQuery<IGetSessionsForReferCoworkerParams,IGetSessionsForReferCoworkerResult>(getSessionsForReferCoworkerIR);


/** 'GetVolunteersForGentleWarning' parameters type */
export interface IGetVolunteersForGentleWarningParams {
  mongoSessionId: string | null | void;
  sessionId: string | null | void;
}

/** 'GetVolunteersForGentleWarning' return type */
export interface IGetVolunteersForGentleWarningResult {
  email: string;
  firstName: string;
  id: string;
  totalNotifications: number | null;
}

/** 'GetVolunteersForGentleWarning' query type */
export interface IGetVolunteersForGentleWarningQuery {
  params: IGetVolunteersForGentleWarningParams;
  result: IGetVolunteersForGentleWarningResult;
}

const getVolunteersForGentleWarningIR: any = {"name":"getVolunteersForGentleWarning","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18193,"b":18201,"line":706,"col":43}]}},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18246,"b":18259,"line":707,"col":43}]}}],"usedParamSet":{"sessionId":true,"mongoSessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    notification_count.total AS total_notifications\nFROM\n    notifications\n    LEFT JOIN users ON users.id = notifications.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = users.id) AS session_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id) AS notification_count ON TRUE\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND session_count.total = 0\n    AND (notifications.session_id::uuid = :sessionId\n        OR notifications.mongo_id::text = :mongoSessionId)\nGROUP BY\n    users.id,\n    notification_count.total","loc":{"a":17431,"b":18312,"line":679,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     notification_count.total AS total_notifications
 * FROM
 *     notifications
 *     LEFT JOIN users ON users.id = notifications.user_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = users.id) AS session_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             notifications
 *         WHERE
 *             notifications.user_id = users.id) AS notification_count ON TRUE
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND session_count.total = 0
 *     AND (notifications.session_id::uuid = :sessionId
 *         OR notifications.mongo_id::text = :mongoSessionId)
 * GROUP BY
 *     users.id,
 *     notification_count.total
 * ```
 */
export const getVolunteersForGentleWarning = new PreparedQuery<IGetVolunteersForGentleWarningParams,IGetVolunteersForGentleWarningResult>(getVolunteersForGentleWarningIR);


/** 'GetStudentForEmailFirstSession' parameters type */
export interface IGetStudentForEmailFirstSessionParams {
  mongoSessionId: string | null | void;
  sessionId: string | null | void;
}

/** 'GetStudentForEmailFirstSession' return type */
export interface IGetStudentForEmailFirstSessionResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetStudentForEmailFirstSession' query type */
export interface IGetStudentForEmailFirstSessionQuery {
  params: IGetStudentForEmailFirstSessionParams;
  result: IGetStudentForEmailFirstSessionResult;
}

const getStudentForEmailFirstSessionIR: any = {"name":"getStudentForEmailFirstSession","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18696,"b":18704,"line":723,"col":28}]}},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18740,"b":18753,"line":724,"col":34}]}}],"usedParamSet":{"sessionId":true,"mongoSessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.student_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":18360,"b":18995,"line":714,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.email
 * FROM
 *     sessions
 *     LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
 *     LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
 *     LEFT JOIN users ON users.id = sessions.student_id
 * WHERE (sessions.id::uuid = :sessionId
 *     OR sessions.mongo_id::text = :mongoSessionId)
 * AND (session_flags.name IS NULL
 *     OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }'))
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * ```
 */
export const getStudentForEmailFirstSession = new PreparedQuery<IGetStudentForEmailFirstSessionParams,IGetStudentForEmailFirstSessionResult>(getStudentForEmailFirstSessionIR);


/** 'GetVolunteerForEmailFirstSession' parameters type */
export interface IGetVolunteerForEmailFirstSessionParams {
  mongoSessionId: string | null | void;
  sessionId: string | null | void;
}

/** 'GetVolunteerForEmailFirstSession' return type */
export interface IGetVolunteerForEmailFirstSessionResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetVolunteerForEmailFirstSession' query type */
export interface IGetVolunteerForEmailFirstSessionQuery {
  params: IGetVolunteerForEmailFirstSessionParams;
  result: IGetVolunteerForEmailFirstSessionResult;
}

const getVolunteerForEmailFirstSessionIR: any = {"name":"getVolunteerForEmailFirstSession","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19383,"b":19391,"line":741,"col":28}]}},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19427,"b":19440,"line":742,"col":34}]}}],"usedParamSet":{"sessionId":true,"mongoSessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.volunteer_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":19045,"b":19682,"line":732,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.email
 * FROM
 *     sessions
 *     LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
 *     LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
 *     LEFT JOIN users ON users.id = sessions.volunteer_id
 * WHERE (sessions.id::uuid = :sessionId
 *     OR sessions.mongo_id::text = :mongoSessionId)
 * AND (session_flags.name IS NULL
 *     OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }'))
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * ```
 */
export const getVolunteerForEmailFirstSession = new PreparedQuery<IGetVolunteerForEmailFirstSessionParams,IGetVolunteerForEmailFirstSessionResult>(getVolunteerForEmailFirstSessionIR);


/** 'GetSessionsForAdminFilter' parameters type */
export interface IGetSessionsForAdminFilterParams {
  end: Date;
  firstTimeStudent: boolean | null | void;
  firstTimeVolunteer: boolean | null | void;
  limit: number;
  messageCount: number | null | void;
  offset: number;
  reported: boolean | null | void;
  sessionLength: number | null | void;
  showBannedUsers: boolean | null | void;
  showTestUsers: boolean | null | void;
  start: Date;
  studentRating: number | null | void;
  volunteerRating: number | null | void;
}

/** 'GetSessionsForAdminFilter' return type */
export interface IGetSessionsForAdminFilterResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  reviewReasons: stringArray | null;
  studentCounselingFeedback: Json | null;
  studentEmail: string;
  studentFirstName: string;
  studentIsBanned: boolean;
  studentTestUser: boolean;
  studentTotalPastSessions: number | null;
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteerEmail: string;
  volunteerFeedback: Json | null;
  volunteerFirstName: string;
  volunteerIsBanned: boolean;
  volunteerTestUser: boolean;
  volunteerTotalPastSessions: number | null;
}

/** 'GetSessionsForAdminFilter' query type */
export interface IGetSessionsForAdminFilterQuery {
  params: IGetSessionsForAdminFilterParams;
  result: IGetSessionsForAdminFilterResult;
}

const getSessionsForAdminFilterIR: any = {"name":"getSessionsForAdminFilter","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22937,"b":22942,"line":846,"col":32}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22976,"b":22979,"line":847,"col":32}]}},{"name":"messageCount","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22992,"b":23003,"line":848,"col":11},{"a":23055,"b":23066,"line":849,"col":36}]}},{"name":"sessionLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23086,"b":23098,"line":850,"col":11},{"a":23200,"b":23212,"line":851,"col":86}]}},{"name":"reported","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23232,"b":23239,"line":852,"col":11},{"a":23272,"b":23279,"line":853,"col":13}]}},{"name":"showBannedUsers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23512,"b":23526,"line":858,"col":13}]}},{"name":"showTestUsers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23558,"b":23570,"line":859,"col":11},{"a":23603,"b":23615,"line":860,"col":13}]}},{"name":"firstTimeStudent","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23686,"b":23701,"line":862,"col":11},{"a":23734,"b":23749,"line":863,"col":13}]}},{"name":"firstTimeVolunteer","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23820,"b":23837,"line":865,"col":11},{"a":23870,"b":23887,"line":866,"col":13}]}},{"name":"studentRating","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23960,"b":23972,"line":868,"col":11},{"a":24176,"b":24188,"line":870,"col":119}]}},{"name":"volunteerRating","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24209,"b":24223,"line":871,"col":11},{"a":24406,"b":24420,"line":873,"col":105}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24478,"b":24483,"line":876,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24500,"b":24506,"line":876,"col":30}]}}],"usedParamSet":{"start":true,"end":true,"messageCount":true,"sessionLength":true,"reported":true,"showBannedUsers":true,"showTestUsers":true,"firstTimeStudent":true,"firstTimeVolunteer":true,"studentRating":true,"volunteerRating":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    message_count.total AS total_messages,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    students.banned AS student_is_banned,\n    students.test_user AS student_test_user,\n    student_sessions.total AS student_total_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteers.banned AS volunteer_is_banned,\n    volunteers.test_user AS volunteer_test_user,\n    volunteer_sessions.total AS volunteer_total_past_sessions,\n    student_feedback.student_counseling_feedback,\n    volunteer_feedback.volunteer_feedback,\n    review_reasons.review_reasons\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_id = sessions.id) AS review_reasons ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.student_id) AS students ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.volunteer_id) AS volunteers ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS message_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            sessions.id = session_reports.session_id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id\n            AND student_feedback.user_id = sessions.student_id)\n    LEFT JOIN feedbacks volunteer_feedback ON (volunteer_feedback.session_id = sessions.id\n            AND volunteer_feedback.volunteer_feedback IS NOT NULL)\n    LEFT JOIN LATERAL (\n        SELECT\n            MAX(created_at) AS last_banned_at\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = sessions.student_id\n            AND user_actions.action = 'BANNED') AS student_banned ON TRUE\nWHERE\n    NOT sessions.ended_at IS NULL\n    AND sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND ((:messageCount)::int IS NULL\n        OR message_count.total >= (:messageCount)::int)\n    AND ((:sessionLength)::int IS NULL\n        OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)\n    AND ((:reported)::boolean IS NULL\n        OR (:reported)::boolean IS FALSE\n        OR session_reported_count.total > 0)\n    AND (student_banned.last_banned_at IS NULL\n        OR sessions.created_at < student_banned.last_banned_at\n        OR sessions.student_banned IS FALSE\n        OR (:showBannedUsers)::boolean IS TRUE)\n    AND ((:showTestUsers)::boolean IS NULL\n        OR (:showTestUsers)::boolean IS TRUE\n        OR students.test_user IS FALSE)\n    AND ((:firstTimeStudent)::boolean IS NULL\n        OR (:firstTimeStudent)::boolean IS FALSE\n        OR student_sessions.total = 1)\n    AND ((:firstTimeVolunteer)::boolean IS NULL\n        OR (:firstTimeVolunteer)::boolean IS FALSE\n        OR volunteer_sessions.total = 1)\n    AND ((:studentRating)::int IS NULL\n        OR (student_feedback.student_counseling_feedback IS NOT NULL\n            AND (student_feedback.student_counseling_feedback -> 'rate-session' -> 'rating' ->> '$numberInt')::int = (:studentRating)::int))\n    AND ((:volunteerRating)::int IS NULL\n        OR (volunteer_feedback.volunteer_feedback IS NOT NULL\n            AND (volunteer_feedback.volunteer_feedback -> 'session-enjoyable' ->> '$numberInt')::int = (:volunteerRating)::int))\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":19725,"b":24512,"line":750,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     message_count.total AS total_messages,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     students.first_name AS student_first_name,
 *     students.email AS student_email,
 *     students.banned AS student_is_banned,
 *     students.test_user AS student_test_user,
 *     student_sessions.total AS student_total_past_sessions,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.email AS volunteer_email,
 *     volunteers.banned AS volunteer_is_banned,
 *     volunteers.test_user AS volunteer_test_user,
 *     volunteer_sessions.total AS volunteer_total_past_sessions,
 *     student_feedback.student_counseling_feedback,
 *     volunteer_feedback.volunteer_feedback,
 *     review_reasons.review_reasons
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS review_reasons
 *         FROM
 *             session_review_reasons
 *             LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 *         WHERE
 *             session_id = sessions.id) AS review_reasons ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             first_name,
 *             id,
 *             email,
 *             banned,
 *             test_user
 *         FROM
 *             users
 *         WHERE
 *             users.id = sessions.student_id) AS students ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             first_name,
 *             id,
 *             email,
 *             banned,
 *             test_user
 *         FROM
 *             users
 *         WHERE
 *             users.id = sessions.volunteer_id) AS volunteers ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_messages.session_id = sessions.id) AS message_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             sessions.id = session_reports.session_id) AS session_reported_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = students.id) AS student_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE
 *     LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id
 *             AND student_feedback.user_id = sessions.student_id)
 *     LEFT JOIN feedbacks volunteer_feedback ON (volunteer_feedback.session_id = sessions.id
 *             AND volunteer_feedback.volunteer_feedback IS NOT NULL)
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             MAX(created_at) AS last_banned_at
 *         FROM
 *             user_actions
 *         WHERE
 *             user_actions.user_id = sessions.student_id
 *             AND user_actions.action = 'BANNED') AS student_banned ON TRUE
 * WHERE
 *     NOT sessions.ended_at IS NULL
 *     AND sessions.created_at >= :start!
 *     AND sessions.created_at <= :end!
 *     AND ((:messageCount)::int IS NULL
 *         OR message_count.total >= (:messageCount)::int)
 *     AND ((:sessionLength)::int IS NULL
 *         OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)
 *     AND ((:reported)::boolean IS NULL
 *         OR (:reported)::boolean IS FALSE
 *         OR session_reported_count.total > 0)
 *     AND (student_banned.last_banned_at IS NULL
 *         OR sessions.created_at < student_banned.last_banned_at
 *         OR sessions.student_banned IS FALSE
 *         OR (:showBannedUsers)::boolean IS TRUE)
 *     AND ((:showTestUsers)::boolean IS NULL
 *         OR (:showTestUsers)::boolean IS TRUE
 *         OR students.test_user IS FALSE)
 *     AND ((:firstTimeStudent)::boolean IS NULL
 *         OR (:firstTimeStudent)::boolean IS FALSE
 *         OR student_sessions.total = 1)
 *     AND ((:firstTimeVolunteer)::boolean IS NULL
 *         OR (:firstTimeVolunteer)::boolean IS FALSE
 *         OR volunteer_sessions.total = 1)
 *     AND ((:studentRating)::int IS NULL
 *         OR (student_feedback.student_counseling_feedback IS NOT NULL
 *             AND (student_feedback.student_counseling_feedback -> 'rate-session' -> 'rating' ->> '$numberInt')::int = (:studentRating)::int))
 *     AND ((:volunteerRating)::int IS NULL
 *         OR (volunteer_feedback.volunteer_feedback IS NOT NULL
 *             AND (volunteer_feedback.volunteer_feedback -> 'session-enjoyable' ->> '$numberInt')::int = (:volunteerRating)::int))
 * ORDER BY
 *     (sessions.created_at) DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getSessionsForAdminFilter = new PreparedQuery<IGetSessionsForAdminFilterParams,IGetSessionsForAdminFilterResult>(getSessionsForAdminFilterIR);


/** 'InsertSessionReviewReason' parameters type */
export interface IInsertSessionReviewReasonParams {
  flag: string;
  sessionId: string;
}

/** 'InsertSessionReviewReason' return type */
export interface IInsertSessionReviewReasonResult {
  ok: string | null;
}

/** 'InsertSessionReviewReason' query type */
export interface IInsertSessionReviewReasonQuery {
  params: IInsertSessionReviewReasonParams;
  result: IInsertSessionReviewReasonResult;
}

const insertSessionReviewReasonIR: any = {"name":"insertSessionReviewReason","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24678,"b":24687,"line":883,"col":9}]}},{"name":"flag","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24816,"b":24820,"line":890,"col":30},{"a":25105,"b":25109,"line":907,"col":26}]}}],"usedParamSet":{"sessionId":true,"flag":true},"statement":{"body":"WITH ins AS (\nINSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)\n    SELECT\n        :sessionId!,\n        session_flags.id,\n        NOW(),\n        NOW()\n    FROM\n        session_flags\n    WHERE\n        session_flags.name = :flag!\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        session_id AS ok\n)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    session_id\nFROM\n    session_review_reasons\n    LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\nWHERE\n    session_flags.name = :flag!","loc":{"a":24555,"b":25109,"line":880,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)
 *     SELECT
 *         :sessionId!,
 *         session_flags.id,
 *         NOW(),
 *         NOW()
 *     FROM
 *         session_flags
 *     WHERE
 *         session_flags.name = :flag!
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         session_id AS ok
 * )
 * SELECT
 *     *
 * FROM
 *     ins
 * UNION
 * SELECT
 *     session_id
 * FROM
 *     session_review_reasons
 *     LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 * WHERE
 *     session_flags.name = :flag!
 * ```
 */
export const insertSessionReviewReason = new PreparedQuery<IInsertSessionReviewReasonParams,IInsertSessionReviewReasonResult>(insertSessionReviewReasonIR);


/** 'InsertSessionFailedJoin' parameters type */
export interface IInsertSessionFailedJoinParams {
  sessionId: string;
  userId: string;
}

/** 'InsertSessionFailedJoin' return type */
export interface IInsertSessionFailedJoinResult {
  ok: string;
}

/** 'InsertSessionFailedJoin' query type */
export interface IInsertSessionFailedJoinQuery {
  params: IInsertSessionFailedJoinParams;
  result: IInsertSessionFailedJoinResult;
}

const insertSessionFailedJoinIR: any = {"name":"insertSessionFailedJoin","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25242,"b":25251,"line":912,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25255,"b":25261,"line":912,"col":26}]}}],"usedParamSet":{"sessionId":true,"userId":true},"statement":{"body":"INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)\n    VALUES (:sessionId!, :userId!, NOW(), NOW())\nRETURNING\n    session_id AS ok","loc":{"a":25150,"b":25307,"line":911,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)
 *     VALUES (:sessionId!, :userId!, NOW(), NOW())
 * RETURNING
 *     session_id AS ok
 * ```
 */
export const insertSessionFailedJoin = new PreparedQuery<IInsertSessionFailedJoinParams,IInsertSessionFailedJoinResult>(insertSessionFailedJoinIR);


/** 'InsertSessionPhotoKey' parameters type */
export interface IInsertSessionPhotoKeyParams {
  photoKey: string;
  sessionId: string;
}

/** 'InsertSessionPhotoKey' return type */
export interface IInsertSessionPhotoKeyResult {
  ok: string;
}

/** 'InsertSessionPhotoKey' query type */
export interface IInsertSessionPhotoKeyQuery {
  params: IInsertSessionPhotoKeyParams;
  result: IInsertSessionPhotoKeyResult;
}

const insertSessionPhotoKeyIR: any = {"name":"insertSessionPhotoKey","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25434,"b":25443,"line":919,"col":13}]}},{"name":"photoKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25447,"b":25455,"line":919,"col":26}]}}],"usedParamSet":{"sessionId":true,"photoKey":true},"statement":{"body":"INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)\n    VALUES (:sessionId!, :photoKey!, NOW(), NOW())\nRETURNING\n    session_id AS ok","loc":{"a":25346,"b":25501,"line":918,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)
 *     VALUES (:sessionId!, :photoKey!, NOW(), NOW())
 * RETURNING
 *     session_id AS ok
 * ```
 */
export const insertSessionPhotoKey = new PreparedQuery<IInsertSessionPhotoKeyParams,IInsertSessionPhotoKeyResult>(insertSessionPhotoKeyIR);


/** 'GetSessionsForVolunteerHourSummary' parameters type */
export interface IGetSessionsForVolunteerHourSummaryParams {
  end: Date;
  start: Date;
  volunteerId: string;
}

/** 'GetSessionsForVolunteerHourSummary' return type */
export interface IGetSessionsForVolunteerHourSummaryResult {
  createdAt: Date;
  endedAt: Date | null;
  sessionId: string;
  subject: string;
  timeTutored: number | null;
  topic: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionsForVolunteerHourSummary' query type */
export interface IGetSessionsForVolunteerHourSummaryQuery {
  params: IGetSessionsForVolunteerHourSummaryParams;
  result: IGetSessionsForVolunteerHourSummaryResult;
}

const getSessionsForVolunteerHourSummaryIR: any = {"name":"getSessionsForVolunteerHourSummary","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26030,"b":26035,"line":939,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26069,"b":26072,"line":940,"col":32}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26107,"b":26118,"line":941,"col":33}]}}],"usedParamSet":{"start":true,"end":true,"volunteerId":true},"statement":{"body":"SELECT\n    sessions.id AS session_id,\n    sessions.created_at AS created_at,\n    sessions.ended_at AS ended_at,\n    sessions.time_tutored::int AS time_tutored,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.volunteer_joined_at AS volunteer_joined_at\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    JOIN users ON users.id = sessions.student_id\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND sessions.volunteer_id = :volunteerId!\n    AND users.test_user = FALSE","loc":{"a":25553,"b":26150,"line":925,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id AS session_id,
 *     sessions.created_at AS created_at,
 *     sessions.ended_at AS ended_at,
 *     sessions.time_tutored::int AS time_tutored,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     sessions.volunteer_joined_at AS volunteer_joined_at
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     JOIN users ON users.id = sessions.student_id
 * WHERE
 *     sessions.created_at >= :start!
 *     AND sessions.created_at <= :end!
 *     AND sessions.volunteer_id = :volunteerId!
 *     AND users.test_user = FALSE
 * ```
 */
export const getSessionsForVolunteerHourSummary = new PreparedQuery<IGetSessionsForVolunteerHourSummaryParams,IGetSessionsForVolunteerHourSummaryResult>(getSessionsForVolunteerHourSummaryIR);


/** 'GetSessionHistory' parameters type */
export interface IGetSessionHistoryParams {
  limit: number;
  minSessionLength: number;
  offset: number;
  studentId: string;
}

/** 'GetSessionHistory' return type */
export interface IGetSessionHistoryResult {
  createdAt: Date;
  id: string;
  isFavorited: boolean | null;
  studentFirstName: string;
  studentId: string;
  subject: string;
  timeTutored: number | null;
  topic: string;
  volunteerFirstName: string;
  volunteerId: string;
}

/** 'GetSessionHistory' query type */
export interface IGetSessionHistoryQuery {
  params: IGetSessionHistoryParams;
  result: IGetSessionHistoryResult;
}

const getSessionHistoryIR: any = {"name":"getSessionHistory","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27103,"b":27112,"line":971,"col":19}]}},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27267,"b":27283,"line":975,"col":33}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27416,"b":27421,"line":980,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27438,"b":27444,"line":980,"col":30}]}}],"usedParamSet":{"studentId":true,"minSessionLength":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at AS created_at,\n    sessions.time_tutored::int AS time_tutored,\n    subjects.display_name AS subject,\n    topics.name AS topic,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.id AS volunteer_id,\n    students.id AS student_id,\n    students.first_name AS student_first_name,\n    (\n        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_favorited\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n        AND volunteers.id = favorited.volunteer_id\nWHERE\n    students.id = :studentId!\n    AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\n    AND NOW()\n    AND sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL\nORDER BY\n    sessions.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":26185,"b":27450,"line":946,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at AS created_at,
 *     sessions.time_tutored::int AS time_tutored,
 *     subjects.display_name AS subject,
 *     topics.name AS topic,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.id AS volunteer_id,
 *     students.id AS student_id,
 *     students.first_name AS student_first_name,
 *     (
 *         CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_favorited
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 *     LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id
 *         AND volunteers.id = favorited.volunteer_id
 * WHERE
 *     students.id = :studentId!
 *     AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')
 *     AND NOW()
 *     AND sessions.time_tutored IS NOT NULL
 *     AND sessions.time_tutored > :minSessionLength!::int
 *     AND sessions.volunteer_id IS NOT NULL
 *     AND sessions.ended_at IS NOT NULL
 * ORDER BY
 *     sessions.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getSessionHistory = new PreparedQuery<IGetSessionHistoryParams,IGetSessionHistoryResult>(getSessionHistoryIR);


/** 'GetTotalSessionHistory' parameters type */
export interface IGetTotalSessionHistoryParams {
  minSessionLength: number;
  studentId: string;
}

/** 'GetTotalSessionHistory' return type */
export interface IGetTotalSessionHistoryResult {
  total: number | null;
}

/** 'GetTotalSessionHistory' query type */
export interface IGetTotalSessionHistoryQuery {
  params: IGetTotalSessionHistoryParams;
  result: IGetTotalSessionHistoryResult;
}

const getTotalSessionHistoryIR: any = {"name":"getTotalSessionHistory","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27705,"b":27714,"line":991,"col":19}]}},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27869,"b":27885,"line":995,"col":33}]}}],"usedParamSet":{"studentId":true,"minSessionLength":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    sessions\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\nWHERE\n    students.id = :studentId!\n    AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\n    AND NOW()\n    AND sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL","loc":{"a":27490,"b":27932,"line":984,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)::int AS total
 * FROM
 *     sessions
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 * WHERE
 *     students.id = :studentId!
 *     AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')
 *     AND NOW()
 *     AND sessions.time_tutored IS NOT NULL
 *     AND sessions.time_tutored > :minSessionLength!::int
 *     AND sessions.volunteer_id IS NOT NULL
 * ```
 */
export const getTotalSessionHistory = new PreparedQuery<IGetTotalSessionHistoryParams,IGetTotalSessionHistoryResult>(getTotalSessionHistoryIR);


/** 'GetSessionRecap' parameters type */
export interface IGetSessionRecapParams {
  sessionId: string;
}

/** 'GetSessionRecap' return type */
export interface IGetSessionRecapResult {
  createdAt: Date;
  endedAt: Date | null;
  hasWhiteboardDoc: boolean;
  id: string;
  isFavorited: boolean | null;
  quillDoc: string | null;
  studentFirstName: string;
  studentId: string;
  subject: string;
  subjectKey: string;
  timeTutored: number | null;
  topic: string;
  volunteerFirstName: string;
  volunteerId: string;
}

/** 'GetSessionRecap' query type */
export interface IGetSessionRecapQuery {
  params: IGetSessionRecapParams;
  result: IGetSessionRecapResult;
}

const getSessionRecapIR: any = {"name":"getSessionRecap","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28967,"b":28976,"line":1029,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.time_tutored::int,\n    subjects.display_name AS subject,\n    subjects.name AS subject_key,\n    topics.name AS topic,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.id AS volunteer_id,\n    students.id AS student_id,\n    students.first_name AS student_first_name,\n    (\n        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_favorited,\n    sessions.quill_doc,\n    sessions.has_whiteboard_doc\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n        AND volunteers.id = favorited.volunteer_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":27965,"b":28976,"line":1000,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.time_tutored::int,
 *     subjects.display_name AS subject,
 *     subjects.name AS subject_key,
 *     topics.name AS topic,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.id AS volunteer_id,
 *     students.id AS student_id,
 *     students.first_name AS student_first_name,
 *     (
 *         CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_favorited,
 *     sessions.quill_doc,
 *     sessions.has_whiteboard_doc
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 *     LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id
 *         AND volunteers.id = favorited.volunteer_id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getSessionRecap = new PreparedQuery<IGetSessionRecapParams,IGetSessionRecapResult>(getSessionRecapIR);


