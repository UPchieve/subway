/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetAvailabilityForVolunteer' parameters type */
export interface IGetAvailabilityForVolunteerParams {
  userId: string | null | void;
}

/** 'GetAvailabilityForVolunteer' return type */
export interface IGetAvailabilityForVolunteerResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteer' query type */
export interface IGetAvailabilityForVolunteerQuery {
  params: IGetAvailabilityForVolunteerParams;
  result: IGetAvailabilityForVolunteerResult;
}

const getAvailabilityForVolunteerIR: any = {"name":"getAvailabilityForVolunteer","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":386,"b":391,"line":13,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    availabilities.user_id::uuid = :userId","loc":{"a":40,"b":391,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     LEFT JOIN users ON availabilities.user_id = users.id
 * WHERE
 *     availabilities.user_id::uuid = :userId
 * ```
 */
export const getAvailabilityForVolunteer = new PreparedQuery<IGetAvailabilityForVolunteerParams,IGetAvailabilityForVolunteerResult>(getAvailabilityForVolunteerIR);


/** 'GetAvailabilityForLegacyVolunteer' parameters type */
export interface IGetAvailabilityForLegacyVolunteerParams {
  mongoUserId: string | null | void;
}

/** 'GetAvailabilityForLegacyVolunteer' return type */
export interface IGetAvailabilityForLegacyVolunteerResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityForLegacyVolunteer' query type */
export interface IGetAvailabilityForLegacyVolunteerQuery {
  params: IGetAvailabilityForLegacyVolunteerParams;
  result: IGetAvailabilityForLegacyVolunteerResult;
}

const getAvailabilityForLegacyVolunteerIR: any = {"name":"getAvailabilityForLegacyVolunteer","params":[{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":780,"b":790,"line":28,"col":28}]}}],"usedParamSet":{"mongoUserId":true},"statement":{"body":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    users.mongo_id::text = :mongoUserId","loc":{"a":442,"b":790,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     LEFT JOIN users ON availabilities.user_id = users.id
 * WHERE
 *     users.mongo_id::text = :mongoUserId
 * ```
 */
export const getAvailabilityForLegacyVolunteer = new PreparedQuery<IGetAvailabilityForLegacyVolunteerParams,IGetAvailabilityForLegacyVolunteerResult>(getAvailabilityForLegacyVolunteerIR);


/** 'GetAvailabilityForVolunteerHeatmap' parameters type */
export interface IGetAvailabilityForVolunteerHeatmapParams {
  subject: string;
}

/** 'GetAvailabilityForVolunteerHeatmap' return type */
export interface IGetAvailabilityForVolunteerHeatmapResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  userId: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteerHeatmap' query type */
export interface IGetAvailabilityForVolunteerHeatmapQuery {
  params: IGetAvailabilityForVolunteerHeatmapParams;
  result: IGetAvailabilityForVolunteerHeatmapResult;
}

const getAvailabilityForVolunteerHeatmapIR: any = {"name":"getAvailabilityForVolunteerHeatmap","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1076,"b":1083,"line":41,"col":25},{"a":1314,"b":1321,"line":50,"col":25},{"a":2161,"b":2168,"line":75,"col":29},{"a":2761,"b":2768,"line":89,"col":29}]}}],"usedParamSet":{"subject":true},"statement":{"body":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n),\ncerts_for_computed_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        computed_subject_unlocks\n        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    availabilities.user_id,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    JOIN users ON users.id = availabilities.user_id\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_computed_subject.total\n        FROM\n            users_certifications\n            JOIN computed_subject_unlocks USING (certification_id)\n            JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_computed_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_computed_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.ban_type IS DISTINCT FROM 'complete'\n    AND (user_certs.total IS NOT NULL\n        OR user_computed_subjects.total IS NOT NULL)","loc":{"a":844,"b":3278,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH certs_for_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * ),
 * certs_for_computed_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         computed_subject_unlocks
 *         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * )
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     availabilities.user_id,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     JOIN users ON users.id = availabilities.user_id
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_subject.total
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_computed_subject.total
 *         FROM
 *             users_certifications
 *             JOIN computed_subject_unlocks USING (certification_id)
 *             JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_computed_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_computed_subject.total
 *         HAVING
 *             COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id
 * WHERE
 *     users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND users.deactivated IS FALSE
 *     AND users.ban_type IS DISTINCT FROM 'complete'
 *     AND (user_certs.total IS NOT NULL
 *         OR user_computed_subjects.total IS NOT NULL)
 * ```
 */
export const getAvailabilityForVolunteerHeatmap = new PreparedQuery<IGetAvailabilityForVolunteerHeatmapParams,IGetAvailabilityForVolunteerHeatmapResult>(getAvailabilityForVolunteerHeatmapIR);


/** 'GetAvailabilityHistoryForDatesByVolunteerId' parameters type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetAvailabilityHistoryForDatesByVolunteerId' return type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  recordedAt: Date;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityHistoryForDatesByVolunteerId' query type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdQuery {
  params: IGetAvailabilityHistoryForDatesByVolunteerIdParams;
  result: IGetAvailabilityHistoryForDatesByVolunteerIdResult;
}

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {"name":"getAvailabilityHistoryForDatesByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3695,"b":3701,"line":115,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3727,"b":3732,"line":116,"col":24}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3758,"b":3761,"line":117,"col":24}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    availability_histories.id,\n    availability_histories.recorded_at,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at","loc":{"a":3339,"b":3786,"line":104,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availability_histories.id,
 *     availability_histories.recorded_at,
 *     availability_histories.available_start,
 *     availability_histories.available_end,
 *     availability_histories.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availability_histories
 *     LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 * WHERE
 *     user_id = :userId!
 *     AND recorded_at >= :start!
 *     AND recorded_at <= :end!
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetAvailabilityHistoryForDatesByVolunteerIdParams,IGetAvailabilityHistoryForDatesByVolunteerIdResult>(getAvailabilityHistoryForDatesByVolunteerIdIR);


/** 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' parameters type */
export interface IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' return type */
export interface IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult {
  id: string;
  legacyAvailability: Json;
  recordedAt: Date;
  timezone: string | null;
}

/** 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' query type */
export interface IGetLegacyAvailabilityHistoryForDatesByVolunteerIdQuery {
  params: IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams;
  result: IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult;
}

const getLegacyAvailabilityHistoryForDatesByVolunteerIdIR: any = {"name":"getLegacyAvailabilityHistoryForDatesByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4103,"b":4109,"line":131,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4135,"b":4140,"line":132,"col":24}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4166,"b":4169,"line":133,"col":24}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    legacy_availability_histories.id,\n    legacy_availability_histories.recorded_at,\n    legacy_availability_histories.legacy_availability,\n    legacy_availability_histories.timezone\nFROM\n    legacy_availability_histories\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at","loc":{"a":3853,"b":4194,"line":123,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     legacy_availability_histories.id,
 *     legacy_availability_histories.recorded_at,
 *     legacy_availability_histories.legacy_availability,
 *     legacy_availability_histories.timezone
 * FROM
 *     legacy_availability_histories
 * WHERE
 *     user_id = :userId!
 *     AND recorded_at >= :start!
 *     AND recorded_at <= :end!
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getLegacyAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams,IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult>(getLegacyAvailabilityHistoryForDatesByVolunteerIdIR);


/** 'SaveCurrentAvailabilityAsHistory' parameters type */
export interface ISaveCurrentAvailabilityAsHistoryParams {
  userId: string;
}

/** 'SaveCurrentAvailabilityAsHistory' return type */
export interface ISaveCurrentAvailabilityAsHistoryResult {
  ok: string;
}

/** 'SaveCurrentAvailabilityAsHistory' query type */
export interface ISaveCurrentAvailabilityAsHistoryQuery {
  params: ISaveCurrentAvailabilityAsHistoryParams;
  result: ISaveCurrentAvailabilityAsHistoryResult;
}

const saveCurrentAvailabilityAsHistoryIR: any = {"name":"saveCurrentAvailabilityAsHistory","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4573,"b":4579,"line":153,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    NOW(),\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4244,"b":4602,"line":139,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     NOW(),
 *     user_id,
 *     available_start,
 *     available_end,
 *     timezone,
 *     weekday_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     availabilities
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveCurrentAvailabilityAsHistory = new PreparedQuery<ISaveCurrentAvailabilityAsHistoryParams,ISaveCurrentAvailabilityAsHistoryResult>(saveCurrentAvailabilityAsHistoryIR);


/** 'SaveAvailabilityAsHistoryByDate' parameters type */
export interface ISaveAvailabilityAsHistoryByDateParams {
  recordedAt: Date;
  userId: string;
}

/** 'SaveAvailabilityAsHistoryByDate' return type */
export interface ISaveAvailabilityAsHistoryByDateResult {
  ok: string;
}

/** 'SaveAvailabilityAsHistoryByDate' query type */
export interface ISaveAvailabilityAsHistoryByDateQuery {
  params: ISaveAvailabilityAsHistoryByDateParams;
  result: ISaveAvailabilityAsHistoryByDateResult;
}

const saveAvailabilityAsHistoryByDateIR: any = {"name":"saveAvailabilityAsHistoryByDate","params":[{"name":"recordedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4825,"b":4835,"line":162,"col":5},{"a":5134,"b":5144,"line":179,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5173,"b":5179,"line":180,"col":27}]}}],"usedParamSet":{"recordedAt":true,"userId":true},"statement":{"body":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    :recordedAt!,\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availability_histories\nWHERE\n    recorded_at = (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :recordedAt!\n            AND user_id = :userId!)\nRETURNING\n    id AS ok","loc":{"a":4651,"b":5203,"line":159,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     :recordedAt!,
 *     user_id,
 *     available_start,
 *     available_end,
 *     timezone,
 *     weekday_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     availability_histories
 * WHERE
 *     recorded_at = (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :recordedAt!
 *             AND user_id = :userId!)
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveAvailabilityAsHistoryByDate = new PreparedQuery<ISaveAvailabilityAsHistoryByDateParams,ISaveAvailabilityAsHistoryByDateResult>(saveAvailabilityAsHistoryByDateIR);


/** 'InsertNewAvailability' parameters type */
export interface IInsertNewAvailabilityParams {
  availableEnd: number;
  availableStart: number;
  day: string;
  id: string;
  timezone: string;
  userId: string;
}

/** 'InsertNewAvailability' return type */
export interface IInsertNewAvailabilityResult {
  ok: string;
}

/** 'InsertNewAvailability' query type */
export interface IInsertNewAvailabilityQuery {
  params: IInsertNewAvailabilityParams;
  result: IInsertNewAvailabilityResult;
}

const insertNewAvailabilityIR: any = {"name":"insertNewAvailability","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5373,"b":5375,"line":188,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5383,"b":5389,"line":189,"col":5}]}},{"name":"availableStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5405,"b":5419,"line":191,"col":5}]}},{"name":"availableEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5427,"b":5439,"line":192,"col":5}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5447,"b":5455,"line":193,"col":5}]}},{"name":"day","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5514,"b":5517,"line":199,"col":11}]}}],"usedParamSet":{"id":true,"userId":true,"availableStart":true,"availableEnd":true,"timezone":true,"day":true},"statement":{"body":"INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    id,\n    :availableStart!,\n    :availableEnd!,\n    :timezone!,\n    NOW(),\n    NOW()\nFROM\n    weekdays\nWHERE\n    day = :day!\nRETURNING\n    id AS ok","loc":{"a":5242,"b":5540,"line":186,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     id,
 *     :availableStart!,
 *     :availableEnd!,
 *     :timezone!,
 *     NOW(),
 *     NOW()
 * FROM
 *     weekdays
 * WHERE
 *     day = :day!
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertNewAvailability = new PreparedQuery<IInsertNewAvailabilityParams,IInsertNewAvailabilityResult>(insertNewAvailabilityIR);


/** 'ClearAvailabilityForVolunteer' parameters type */
export interface IClearAvailabilityForVolunteerParams {
  userId: string;
}

/** 'ClearAvailabilityForVolunteer' return type */
export interface IClearAvailabilityForVolunteerResult {
  ok: string;
}

/** 'ClearAvailabilityForVolunteer' query type */
export interface IClearAvailabilityForVolunteerQuery {
  params: IClearAvailabilityForVolunteerParams;
  result: IClearAvailabilityForVolunteerResult;
}

const clearAvailabilityForVolunteerIR: any = {"name":"clearAvailabilityForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5631,"b":5637,"line":206,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM availabilities\nWHERE user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":5587,"b":5665,"line":205,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM availabilities
 * WHERE user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const clearAvailabilityForVolunteer = new PreparedQuery<IClearAvailabilityForVolunteerParams,IClearAvailabilityForVolunteerResult>(clearAvailabilityForVolunteerIR);


/** 'DeleteAvailabilityHistoriesForUser' parameters type */
export interface IDeleteAvailabilityHistoriesForUserParams {
  userId: string;
}

/** 'DeleteAvailabilityHistoriesForUser' return type */
export type IDeleteAvailabilityHistoriesForUserResult = void;

/** 'DeleteAvailabilityHistoriesForUser' query type */
export interface IDeleteAvailabilityHistoriesForUserQuery {
  params: IDeleteAvailabilityHistoriesForUserParams;
  result: IDeleteAvailabilityHistoriesForUserResult;
}

const deleteAvailabilityHistoriesForUserIR: any = {"name":"deleteAvailabilityHistoriesForUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5769,"b":5775,"line":213,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM availability_histories\nWHERE user_id = :userId!","loc":{"a":5717,"b":5775,"line":212,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM availability_histories
 * WHERE user_id = :userId!
 * ```
 */
export const deleteAvailabilityHistoriesForUser = new PreparedQuery<IDeleteAvailabilityHistoriesForUserParams,IDeleteAvailabilityHistoriesForUserResult>(deleteAvailabilityHistoriesForUserIR);


/** 'DeleteLegacyAvailabilityHistoriesForUser' parameters type */
export interface IDeleteLegacyAvailabilityHistoriesForUserParams {
  userId: string;
}

/** 'DeleteLegacyAvailabilityHistoriesForUser' return type */
export type IDeleteLegacyAvailabilityHistoriesForUserResult = void;

/** 'DeleteLegacyAvailabilityHistoriesForUser' query type */
export interface IDeleteLegacyAvailabilityHistoriesForUserQuery {
  params: IDeleteLegacyAvailabilityHistoriesForUserParams;
  result: IDeleteLegacyAvailabilityHistoriesForUserResult;
}

const deleteLegacyAvailabilityHistoriesForUserIR: any = {"name":"deleteLegacyAvailabilityHistoriesForUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5892,"b":5898,"line":218,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM legacy_availability_histories\nWHERE user_id = :userId!","loc":{"a":5833,"b":5898,"line":217,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM legacy_availability_histories
 * WHERE user_id = :userId!
 * ```
 */
export const deleteLegacyAvailabilityHistoriesForUser = new PreparedQuery<IDeleteLegacyAvailabilityHistoriesForUserParams,IDeleteLegacyAvailabilityHistoriesForUserResult>(deleteLegacyAvailabilityHistoriesForUserIR);


/** 'GetAvailabilityForVolunteerByDate' parameters type */
export interface IGetAvailabilityForVolunteerByDateParams {
  recordedAt: Date;
  userId: string;
}

/** 'GetAvailabilityForVolunteerByDate' return type */
export interface IGetAvailabilityForVolunteerByDateResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  recordedAt: Date;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteerByDate' query type */
export interface IGetAvailabilityForVolunteerByDateQuery {
  params: IGetAvailabilityForVolunteerByDateParams;
  result: IGetAvailabilityForVolunteerByDateResult;
}

const getAvailabilityForVolunteerByDateIR: any = {"name":"getAvailabilityForVolunteerByDate","params":[{"name":"recordedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6509,"b":6519,"line":240,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6548,"b":6554,"line":241,"col":27},{"a":6576,"b":6582,"line":242,"col":19}]}}],"usedParamSet":{"recordedAt":true,"userId":true},"statement":{"body":"SELECT\n    availability_histories.id,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    availability_histories.recorded_at,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\n    LEFT JOIN users ON availability_histories.user_id = users.id\nWHERE\n    recorded_at = (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :recordedAt!\n            AND user_id = :userId!)\n    AND user_id = :userId!","loc":{"a":5949,"b":6582,"line":222,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availability_histories.id,
 *     availability_histories.available_start,
 *     availability_histories.available_end,
 *     availability_histories.timezone,
 *     availability_histories.recorded_at,
 *     weekdays.day AS weekday
 * FROM
 *     availability_histories
 *     LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 *     LEFT JOIN users ON availability_histories.user_id = users.id
 * WHERE
 *     recorded_at = (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :recordedAt!
 *             AND user_id = :userId!)
 *     AND user_id = :userId!
 * ```
 */
export const getAvailabilityForVolunteerByDate = new PreparedQuery<IGetAvailabilityForVolunteerByDateParams,IGetAvailabilityForVolunteerByDateResult>(getAvailabilityForVolunteerByDateIR);


