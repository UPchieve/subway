/** Types generated for queries found in "server/models/Student/student.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type ban_types = 'complete' | 'live_media' | 'shadow';

export type DateOrString = Date | string;

export type stringArray = (string)[];

/** 'GetGatesStudentById' parameters type */
export interface IGetGatesStudentByIdParams {
  userId: string;
}

/** 'GetGatesStudentById' return type */
export interface IGetGatesStudentByIdResult {
  approvedHighschool: string | null;
  currentGrade: string | null;
  id: string;
  isPartnerSchool: boolean;
  studentPartnerOrg: string;
}

/** 'GetGatesStudentById' query type */
export interface IGetGatesStudentByIdQuery {
  params: IGetGatesStudentByIdParams;
  result: IGetGatesStudentByIdResult;
}

const getGatesStudentByIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":661,"b":668}]}],"statement":"SELECT\n    student_profiles.user_id AS id,\n    COALESCE(cgl.current_grade_name, grade_levels.name) AS current_grade,\n    student_partner_orgs.name AS student_partner_org,\n    schools.partner AS is_partner_school,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\nWHERE\n    student_profiles.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id AS id,
 *     COALESCE(cgl.current_grade_name, grade_levels.name) AS current_grade,
 *     student_partner_orgs.name AS student_partner_org,
 *     schools.partner AS is_partner_school,
 *     student_profiles.school_id AS approved_highschool
 * FROM
 *     student_profiles
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 * WHERE
 *     student_profiles.user_id = :userId!
 * ```
 */
export const getGatesStudentById = new PreparedQuery<IGetGatesStudentByIdParams,IGetGatesStudentByIdResult>(getGatesStudentByIdIR);


/** 'GetStudentContactInfoById' parameters type */
export interface IGetStudentContactInfoByIdParams {
  mongoUserId?: string | null | void;
  userId?: string | null | void;
}

/** 'GetStudentContactInfoById' return type */
export interface IGetStudentContactInfoByIdResult {
  email: string;
  firstName: string;
  id: string;
  schoolId: string | null;
  studentPartnerOrg: string;
}

/** 'GetStudentContactInfoById' query type */
export interface IGetStudentContactInfoByIdQuery {
  params: IGetStudentContactInfoByIdParams;
  result: IGetStudentContactInfoByIdResult;
}

const getStudentContactInfoByIdIR: any = {"usedParamSet":{"userId":true,"mongoUserId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":450,"b":456}]},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"locs":[{"a":492,"b":503}]}],"statement":"SELECT\n    users.id,\n    first_name,\n    email,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    ban_type IS DISTINCT FROM 'complete'\n    AND deactivated IS FALSE\n    AND test_user IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     student_partner_orgs.key AS student_partner_org,
 *     student_profiles.school_id
 * FROM
 *     users
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * WHERE
 *     ban_type IS DISTINCT FROM 'complete'
 *     AND deactivated IS FALSE
 *     AND test_user IS FALSE
 *     AND (users.id::uuid = :userId
 *         OR users.mongo_id::text = :mongoUserId)
 * ```
 */
export const getStudentContactInfoById = new PreparedQuery<IGetStudentContactInfoByIdParams,IGetStudentContactInfoByIdResult>(getStudentContactInfoByIdIR);


/** 'GetStudentByEmail' parameters type */
export interface IGetStudentByEmailParams {
  email: string;
}

/** 'GetStudentByEmail' return type */
export interface IGetStudentByEmailResult {
  id: string;
}

/** 'GetStudentByEmail' query type */
export interface IGetStudentByEmailQuery {
  params: IGetStudentByEmailParams;
  result: IGetStudentByEmailResult;
}

const getStudentByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":129}]}],"statement":"SELECT\n    users.id\nFROM\n    student_profiles\n    LEFT JOIN users ON student_profiles.user_id = users.id\nWHERE\n    email = :email!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM
 *     student_profiles
 *     LEFT JOIN users ON student_profiles.user_id = users.id
 * WHERE
 *     email = :email!
 * ```
 */
export const getStudentByEmail = new PreparedQuery<IGetStudentByEmailParams,IGetStudentByEmailResult>(getStudentByEmailIR);


/** 'IsTestUser' parameters type */
export interface IIsTestUserParams {
  userId: string;
}

/** 'IsTestUser' return type */
export interface IIsTestUserResult {
  testUser: boolean;
}

/** 'IsTestUser' query type */
export interface IIsTestUserQuery {
  params: IIsTestUserParams;
  result: IIsTestUserResult;
}

const isTestUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":51,"b":58}]}],"statement":"SELECT\n    test_user\nFROM\n    users\nWHERE\n    id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     test_user
 * FROM
 *     users
 * WHERE
 *     id = :userId!
 * ```
 */
export const isTestUser = new PreparedQuery<IIsTestUserParams,IIsTestUserResult>(isTestUserIR);


/** 'GetTotalFavoriteVolunteers' parameters type */
export interface IGetTotalFavoriteVolunteersParams {
  userId: string;
}

/** 'GetTotalFavoriteVolunteers' return type */
export interface IGetTotalFavoriteVolunteersResult {
  total: number | null;
}

/** 'GetTotalFavoriteVolunteers' query type */
export interface IGetTotalFavoriteVolunteersQuery {
  params: IGetTotalFavoriteVolunteersParams;
  result: IGetTotalFavoriteVolunteersResult;
}

const getTotalFavoriteVolunteersIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":101}]}],"statement":"SELECT\n    COUNT(*)::int AS total\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(*)::int AS total
 * FROM
 *     student_favorite_volunteers
 * WHERE
 *     student_id = :userId!
 * ```
 */
export const getTotalFavoriteVolunteers = new PreparedQuery<IGetTotalFavoriteVolunteersParams,IGetTotalFavoriteVolunteersResult>(getTotalFavoriteVolunteersIR);


/** 'IsFavoriteVolunteer' parameters type */
export interface IIsFavoriteVolunteerParams {
  studentId: string;
  volunteerId: string;
}

/** 'IsFavoriteVolunteer' return type */
export interface IIsFavoriteVolunteerResult {
  volunteerId: string;
}

/** 'IsFavoriteVolunteer' query type */
export interface IIsFavoriteVolunteerQuery {
  params: IIsFavoriteVolunteerParams;
  result: IIsFavoriteVolunteerResult;
}

const isFavoriteVolunteerIR: any = {"usedParamSet":{"studentId":true,"volunteerId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":94}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":119,"b":131}]}],"statement":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_id
 * FROM
 *     student_favorite_volunteers
 * WHERE
 *     student_id = :studentId!
 *     AND volunteer_id = :volunteerId!
 * ```
 */
export const isFavoriteVolunteer = new PreparedQuery<IIsFavoriteVolunteerParams,IIsFavoriteVolunteerResult>(isFavoriteVolunteerIR);


/** 'GetFavoriteVolunteersByStudentId' parameters type */
export interface IGetFavoriteVolunteersByStudentIdParams {
  studentId: string;
}

/** 'GetFavoriteVolunteersByStudentId' return type */
export interface IGetFavoriteVolunteersByStudentIdResult {
  id: string;
}

/** 'GetFavoriteVolunteersByStudentId' query type */
export interface IGetFavoriteVolunteersByStudentIdQuery {
  params: IGetFavoriteVolunteersByStudentIdParams;
  result: IGetFavoriteVolunteersByStudentIdResult;
}

const getFavoriteVolunteersByStudentIdIR: any = {"usedParamSet":{"studentId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":221,"b":231}]}],"statement":"SELECT\n    student_favorite_volunteers.volunteer_id AS id\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_favorite_volunteers.volunteer_id AS id
 * FROM
 *     student_favorite_volunteers
 *     LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
 * WHERE
 *     student_favorite_volunteers.student_id = :studentId!
 * ```
 */
export const getFavoriteVolunteersByStudentId = new PreparedQuery<IGetFavoriteVolunteersByStudentIdParams,IGetFavoriteVolunteersByStudentIdResult>(getFavoriteVolunteersByStudentIdIR);


/** 'GetFavoriteVolunteersPaginated' parameters type */
export interface IGetFavoriteVolunteersPaginatedParams {
  limit: number;
  offset: number;
  studentId: string;
}

/** 'GetFavoriteVolunteersPaginated' return type */
export interface IGetFavoriteVolunteersPaginatedResult {
  firstName: string;
  numSessions: number | null;
  volunteerId: string;
}

/** 'GetFavoriteVolunteersPaginated' query type */
export interface IGetFavoriteVolunteersPaginatedQuery {
  params: IGetFavoriteVolunteersPaginatedParams;
  result: IGetFavoriteVolunteersPaginatedResult;
}

const getFavoriteVolunteersPaginatedIR: any = {"usedParamSet":{"studentId":true,"limit":true,"offset":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":448,"b":458},{"a":676,"b":686}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":752,"b":758}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":774,"b":781}]}],"statement":"SELECT\n    student_favorite_volunteers.volunteer_id AS volunteer_id,\n    users.first_name AS first_name,\n    COALESCE(sessions.total, 0)::int AS num_sessions\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\n    LEFT JOIN (\n        SELECT\n            count(*) AS total,\n            sessions.volunteer_id\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = :studentId!\n        GROUP BY\n            sessions.student_id,\n            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!\nORDER BY\n    student_favorite_volunteers.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_favorite_volunteers.volunteer_id AS volunteer_id,
 *     users.first_name AS first_name,
 *     COALESCE(sessions.total, 0)::int AS num_sessions
 * FROM
 *     student_favorite_volunteers
 *     LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             count(*) AS total,
 *             sessions.volunteer_id
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = :studentId!
 *         GROUP BY
 *             sessions.student_id,
 *             sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id
 * WHERE
 *     student_favorite_volunteers.student_id = :studentId!
 * ORDER BY
 *     student_favorite_volunteers.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getFavoriteVolunteersPaginated = new PreparedQuery<IGetFavoriteVolunteersPaginatedParams,IGetFavoriteVolunteersPaginatedResult>(getFavoriteVolunteersPaginatedIR);


/** 'DeleteFavoriteVolunteer' parameters type */
export interface IDeleteFavoriteVolunteerParams {
  studentId: string;
  volunteerId: string;
}

/** 'DeleteFavoriteVolunteer' return type */
export type IDeleteFavoriteVolunteerResult = void;

/** 'DeleteFavoriteVolunteer' query type */
export interface IDeleteFavoriteVolunteerQuery {
  params: IDeleteFavoriteVolunteerParams;
  result: IDeleteFavoriteVolunteerResult;
}

const deleteFavoriteVolunteerIR: any = {"usedParamSet":{"studentId":true,"volunteerId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":69}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":106}]}],"statement":"DELETE FROM student_favorite_volunteers\nWHERE student_id = :studentId!\n    AND volunteer_id = :volunteerId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM student_favorite_volunteers
 * WHERE student_id = :studentId!
 *     AND volunteer_id = :volunteerId!
 * ```
 */
export const deleteFavoriteVolunteer = new PreparedQuery<IDeleteFavoriteVolunteerParams,IDeleteFavoriteVolunteerResult>(deleteFavoriteVolunteerIR);


/** 'AddFavoriteVolunteer' parameters type */
export interface IAddFavoriteVolunteerParams {
  studentId: string;
  volunteerId: string;
}

/** 'AddFavoriteVolunteer' return type */
export interface IAddFavoriteVolunteerResult {
  studentId: string;
  volunteerId: string;
}

/** 'AddFavoriteVolunteer' query type */
export interface IAddFavoriteVolunteerQuery {
  params: IAddFavoriteVolunteerParams;
  result: IAddFavoriteVolunteerResult;
}

const addFavoriteVolunteerIR: any = {"usedParamSet":{"studentId":true,"volunteerId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":113}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":128}]}],"statement":"INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n    VALUES (:studentId!, :volunteerId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    student_id, volunteer_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)
 *     VALUES (:studentId!, :volunteerId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     student_id, volunteer_id
 * ```
 */
export const addFavoriteVolunteer = new PreparedQuery<IAddFavoriteVolunteerParams,IAddFavoriteVolunteerResult>(addFavoriteVolunteerIR);


/** 'GetStudentPartnerInfoById' parameters type */
export interface IGetStudentPartnerInfoByIdParams {
  userId: string;
}

/** 'GetStudentPartnerInfoById' return type */
export interface IGetStudentPartnerInfoByIdResult {
  approvedHighschool: string | null;
  id: string;
  studentPartnerOrg: string;
}

/** 'GetStudentPartnerInfoById' query type */
export interface IGetStudentPartnerInfoByIdQuery {
  params: IGetStudentPartnerInfoByIdParams;
  result: IGetStudentPartnerInfoByIdResult;
}

const getStudentPartnerInfoByIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":317,"b":324}]}],"statement":"SELECT\n    student_profiles.user_id AS id,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    student_profiles.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id AS id,
 *     student_partner_orgs.key AS student_partner_org,
 *     student_profiles.school_id AS approved_highschool
 * FROM
 *     student_profiles
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 * WHERE
 *     student_profiles.user_id = :userId!
 * ```
 */
export const getStudentPartnerInfoById = new PreparedQuery<IGetStudentPartnerInfoByIdParams,IGetStudentPartnerInfoByIdResult>(getStudentPartnerInfoByIdIR);


/** 'DeleteStudent' parameters type */
export interface IDeleteStudentParams {
  email: string;
  userId: string;
}

/** 'DeleteStudent' return type */
export interface IDeleteStudentResult {
  ok: string;
}

/** 'DeleteStudent' query type */
export interface IDeleteStudentQuery {
  params: IDeleteStudentParams;
  result: IDeleteStudentResult;
}

const deleteStudentIR: any = {"usedParamSet":{"email":true,"userId":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":39}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":80,"b":87}]}],"statement":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :email!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const deleteStudent = new PreparedQuery<IDeleteStudentParams,IDeleteStudentResult>(deleteStudentIR);


/** 'AdminUpdateStudent' parameters type */
export interface IAdminUpdateStudentParams {
  banType?: ban_types | null | void;
  deactivated: boolean;
  email: string;
  firstName?: string | null | void;
  lastName?: string | null | void;
  userId: string;
  verified: boolean;
}

/** 'AdminUpdateStudent' return type */
export interface IAdminUpdateStudentResult {
  ok: string;
}

/** 'AdminUpdateStudent' query type */
export interface IAdminUpdateStudentQuery {
  params: IAdminUpdateStudentParams;
  result: IAdminUpdateStudentResult;
}

const adminUpdateStudentIR: any = {"usedParamSet":{"firstName":true,"lastName":true,"email":true,"verified":true,"banType":true,"deactivated":true,"userId":true},"params":[{"name":"firstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":47,"b":56}]},{"name":"lastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":97,"b":105}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":138}]},{"name":"verified","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":165}]},{"name":"banType","required":false,"transform":{"type":"scalar"},"locs":[{"a":183,"b":190}]},{"name":"deactivated","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":223}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":264,"b":271}]}],"statement":"UPDATE\n    users\nSET\n    first_name = COALESCE(:firstName, first_name),\n    last_name = COALESCE(:lastName, last_name),\n    email = :email!,\n    verified = :verified!,\n    ban_type = :banType,\n    deactivated = :deactivated!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     first_name = COALESCE(:firstName, first_name),
 *     last_name = COALESCE(:lastName, last_name),
 *     email = :email!,
 *     verified = :verified!,
 *     ban_type = :banType,
 *     deactivated = :deactivated!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const adminUpdateStudent = new PreparedQuery<IAdminUpdateStudentParams,IAdminUpdateStudentResult>(adminUpdateStudentIR);


/** 'AdminUpdateStudentProfile' parameters type */
export interface IAdminUpdateStudentProfileParams {
  partnerOrgId?: string | null | void;
  partnerOrgSiteId?: string | null | void;
  userId: string;
}

/** 'AdminUpdateStudentProfile' return type */
export interface IAdminUpdateStudentProfileResult {
  ok: string;
}

/** 'AdminUpdateStudentProfile' query type */
export interface IAdminUpdateStudentProfileQuery {
  params: IAdminUpdateStudentProfileParams;
  result: IAdminUpdateStudentProfileResult;
}

const adminUpdateStudentProfileIR: any = {"usedParamSet":{"partnerOrgId":true,"partnerOrgSiteId":true,"userId":true},"params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"locs":[{"a":61,"b":73}]},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"locs":[{"a":110,"b":126}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":179}]}],"statement":"UPDATE\n    student_profiles\nSET\n    student_partner_org_id = :partnerOrgId,\n    student_partner_org_site_id = :partnerOrgSiteId,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     student_partner_org_id = :partnerOrgId,
 *     student_partner_org_site_id = :partnerOrgSiteId,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminUpdateStudentProfile = new PreparedQuery<IAdminUpdateStudentProfileParams,IAdminUpdateStudentProfileResult>(adminUpdateStudentProfileIR);


/** 'GetPartnerOrgsByStudent' parameters type */
export interface IGetPartnerOrgsByStudentParams {
  studentId: string;
}

/** 'GetPartnerOrgsByStudent' return type */
export interface IGetPartnerOrgsByStudentResult {
  id: string;
  name: string;
  schoolId: string | null;
  siteName: string;
}

/** 'GetPartnerOrgsByStudent' query type */
export interface IGetPartnerOrgsByStudentQuery {
  params: IGetPartnerOrgsByStudentParams;
  result: IGetPartnerOrgsByStudentResult;
}

const getPartnerOrgsByStudentIR: any = {"usedParamSet":{"studentId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":333,"b":343}]}],"statement":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id,\n    sposite.name AS site_name\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\n    LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.name,
 *     spo.id,
 *     spo.school_id,
 *     sposite.name AS site_name
 * FROM
 *     users_student_partner_orgs_instances uspoi
 *     JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
 *     LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id
 * WHERE
 *     uspoi.user_id = :studentId!
 *     AND deactivated_on IS NULL
 * ```
 */
export const getPartnerOrgsByStudent = new PreparedQuery<IGetPartnerOrgsByStudentParams,IGetPartnerOrgsByStudentResult>(getPartnerOrgsByStudentIR);


/** 'AdminDeactivateStudentPartnershipInstance' parameters type */
export interface IAdminDeactivateStudentPartnershipInstanceParams {
  spoId: string;
  userId: string;
}

/** 'AdminDeactivateStudentPartnershipInstance' return type */
export interface IAdminDeactivateStudentPartnershipInstanceResult {
  ok: string | null;
}

/** 'AdminDeactivateStudentPartnershipInstance' query type */
export interface IAdminDeactivateStudentPartnershipInstanceQuery {
  params: IAdminDeactivateStudentPartnershipInstanceParams;
  result: IAdminDeactivateStudentPartnershipInstanceResult;
}

const adminDeactivateStudentPartnershipInstanceIR: any = {"usedParamSet":{"userId":true,"spoId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":106}]},{"name":"spoId","required":true,"transform":{"type":"scalar"},"locs":[{"a":141,"b":147}]}],"statement":"UPDATE\n    users_student_partner_orgs_instances\nSET\n    deactivated_on = NOW()\nWHERE\n    user_id = :userId!\n    AND student_partner_org_id = :spoId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users_student_partner_orgs_instances
 * SET
 *     deactivated_on = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND student_partner_org_id = :spoId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminDeactivateStudentPartnershipInstance = new PreparedQuery<IAdminDeactivateStudentPartnershipInstanceParams,IAdminDeactivateStudentPartnershipInstanceResult>(adminDeactivateStudentPartnershipInstanceIR);


/** 'InsertStudentPartnershipInstance' parameters type */
export interface IInsertStudentPartnershipInstanceParams {
  partnerOrgId: string;
  partnerOrgSiteId?: string | null | void;
  userId: string;
}

/** 'InsertStudentPartnershipInstance' return type */
export interface IInsertStudentPartnershipInstanceResult {
  ok: string | null;
}

/** 'InsertStudentPartnershipInstance' query type */
export interface IInsertStudentPartnershipInstanceQuery {
  params: IInsertStudentPartnershipInstanceParams;
  result: IInsertStudentPartnershipInstanceResult;
}

const insertStudentPartnershipInstanceIR: any = {"usedParamSet":{"userId":true,"partnerOrgId":true,"partnerOrgSiteId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":155}]},{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"locs":[{"a":158,"b":171}]},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"locs":[{"a":174,"b":190}]}],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\n    VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
 *     VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const insertStudentPartnershipInstance = new PreparedQuery<IInsertStudentPartnershipInstanceParams,IInsertStudentPartnershipInstanceResult>(insertStudentPartnershipInstanceIR);


/** 'GetPartnerOrgByKey' parameters type */
export interface IGetPartnerOrgByKeyParams {
  partnerOrgKey?: string | null | void;
  partnerOrgSiteName?: string | null | void;
}

/** 'GetPartnerOrgByKey' return type */
export interface IGetPartnerOrgByKeyResult {
  partnerId: string;
  partnerKey: string;
  partnerName: string;
  schoolId: string | null;
  siteId: string;
  siteName: string;
}

/** 'GetPartnerOrgByKey' query type */
export interface IGetPartnerOrgByKeyQuery {
  params: IGetPartnerOrgByKeyParams;
  result: IGetPartnerOrgByKeyResult;
}

const getPartnerOrgByKeyIR: any = {"usedParamSet":{"partnerOrgSiteName":true,"partnerOrgKey":true},"params":[{"name":"partnerOrgSiteName","required":false,"transform":{"type":"scalar"},"locs":[{"a":524,"b":542}]},{"name":"partnerOrgKey","required":false,"transform":{"type":"scalar"},"locs":[{"a":689,"b":702}]}],"statement":"SELECT\n    student_partner_orgs.id AS partner_id,\n    student_partner_orgs.key AS partner_key,\n    student_partner_orgs.name AS partner_name,\n    student_partner_orgs.school_id AS school_id,\n    student_partner_org_sites.id AS site_id,\n    student_partner_org_sites.name AS site_name\nFROM\n    student_partner_orgs\n    LEFT JOIN (\n        SELECT\n            name,\n            id,\n            student_partner_org_id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id\nWHERE\n    student_partner_orgs.key = :partnerOrgKey\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_partner_orgs.id AS partner_id,
 *     student_partner_orgs.key AS partner_key,
 *     student_partner_orgs.name AS partner_name,
 *     student_partner_orgs.school_id AS school_id,
 *     student_partner_org_sites.id AS site_id,
 *     student_partner_org_sites.name AS site_name
 * FROM
 *     student_partner_orgs
 *     LEFT JOIN (
 *         SELECT
 *             name,
 *             id,
 *             student_partner_org_id
 *         FROM
 *             student_partner_org_sites
 *         WHERE
 *             student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id
 * WHERE
 *     student_partner_orgs.key = :partnerOrgKey
 * LIMIT 1
 * ```
 */
export const getPartnerOrgByKey = new PreparedQuery<IGetPartnerOrgByKeyParams,IGetPartnerOrgByKeyResult>(getPartnerOrgByKeyIR);


/** 'UpdateStudentInGatesStudy' parameters type */
export interface IUpdateStudentInGatesStudyParams {
  inGatesStudy?: boolean | null | void;
  userId: string;
}

/** 'UpdateStudentInGatesStudy' return type */
export interface IUpdateStudentInGatesStudyResult {
  ok: string;
}

/** 'UpdateStudentInGatesStudy' query type */
export interface IUpdateStudentInGatesStudyQuery {
  params: IUpdateStudentInGatesStudyParams;
  result: IUpdateStudentInGatesStudyResult;
}

const updateStudentInGatesStudyIR: any = {"usedParamSet":{"inGatesStudy":true,"userId":true},"params":[{"name":"inGatesStudy","required":false,"transform":{"type":"scalar"},"locs":[{"a":64,"b":76}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":115,"b":122}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    in_gates_study = COALESCE(:inGatesStudy, in_gates_study)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     in_gates_study = COALESCE(:inGatesStudy, in_gates_study)
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateStudentInGatesStudy = new PreparedQuery<IUpdateStudentInGatesStudyParams,IUpdateStudentInGatesStudyResult>(updateStudentInGatesStudyIR);


/** 'CreateStudentUser' parameters type */
export interface ICreateStudentUserParams {
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  otherSignupSource?: string | null | void;
  password?: string | null | void;
  referralCode: string;
  referredBy?: string | null | void;
  signupSourceId?: number | null | void;
  userId: string;
  verified: boolean;
}

/** 'CreateStudentUser' return type */
export interface ICreateStudentUserResult {
  banType: ban_types | null;
  createdAt: Date;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  testUser: boolean;
  verified: boolean;
}

/** 'CreateStudentUser' query type */
export interface ICreateStudentUserQuery {
  params: ICreateStudentUserParams;
  result: ICreateStudentUserResult;
}

const createStudentUserIR: any = {"usedParamSet":{"userId":true,"firstName":true,"lastName":true,"email":true,"password":true,"verified":true,"emailVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":210,"b":217}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":230}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":233,"b":242}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":245,"b":251}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":254,"b":262}]},{"name":"verified","required":true,"transform":{"type":"scalar"},"locs":[{"a":265,"b":274}]},{"name":"emailVerified","required":true,"transform":{"type":"scalar"},"locs":[{"a":277,"b":291}]},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":294,"b":304}]},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":307,"b":320}]},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":323,"b":337}]},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"locs":[{"a":340,"b":357}]}],"statement":"INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, first_name, last_name, email, verified, ban_type, test_user, deactivated, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
 *     VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, first_name, last_name, email, verified, ban_type, test_user, deactivated, created_at
 * ```
 */
export const createStudentUser = new PreparedQuery<ICreateStudentUserParams,ICreateStudentUserResult>(createStudentUserIR);


/** 'CreateStudentProfile' parameters type */
export interface ICreateStudentProfileParams {
  college?: string | null | void;
  gradeLevel?: string | null | void;
  partnerOrg?: string | null | void;
  partnerSite?: string | null | void;
  postalCode?: string | null | void;
  schoolId?: string | null | void;
  userId: string;
}

/** 'CreateStudentProfile' return type */
export interface ICreateStudentProfileResult {
  college: string | null;
  createdAt: Date;
  gradeLevel: string | null;
  partnerSite: string | null;
  postalCode: string | null;
  schoolId: string | null;
  studentPartnerOrg: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'CreateStudentProfile' query type */
export interface ICreateStudentProfileQuery {
  params: ICreateStudentProfileParams;
  result: ICreateStudentProfileResult;
}

const createStudentProfileIR: any = {"usedParamSet":{"userId":true,"postalCode":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true,"schoolId":true,"college":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":184}]},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"locs":[{"a":187,"b":197}]},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":355,"b":365},{"a":891,"b":901}]},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"locs":[{"a":563,"b":574},{"a":931,"b":942}]},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"locs":[{"a":746,"b":756},{"a":965,"b":975}]},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":788,"b":796}]},{"name":"college","required":false,"transform":{"type":"scalar"},"locs":[{"a":807,"b":814}]}],"statement":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\n    VALUES (:userId!, :postalCode, (\n            SELECT\n                id\n            FROM\n                student_partner_orgs\n            WHERE\n                student_partner_orgs.key = :partnerOrg\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                student_partner_org_sites\n            WHERE\n                student_partner_org_sites.name = :partnerSite\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                grade_levels\n            WHERE\n                grade_levels.name = :gradeLevel\n            LIMIT 1),\n        :schoolId,\n        :college,\n        NOW(),\n        NOW())\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
 *     VALUES (:userId!, :postalCode, (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_orgs
 *             WHERE
 *                 student_partner_orgs.key = :partnerOrg
 *             LIMIT 1),
 *         (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_org_sites
 *             WHERE
 *                 student_partner_org_sites.name = :partnerSite
 *             LIMIT 1),
 *         (
 *             SELECT
 *                 id
 *             FROM
 *                 grade_levels
 *             WHERE
 *                 grade_levels.name = :gradeLevel
 *             LIMIT 1),
 *         :schoolId,
 *         :college,
 *         NOW(),
 *         NOW())
 * RETURNING
 *     user_id,
 *     postal_code,
 *     :partnerOrg AS student_partner_org,
 *     :partnerSite AS partner_site,
 *     :gradeLevel AS grade_level,
 *     school_id,
 *     college,
 *     created_at,
 *     updated_at
 * ```
 */
export const createStudentProfile = new PreparedQuery<ICreateStudentProfileParams,ICreateStudentProfileResult>(createStudentProfileIR);


/** 'UpsertStudentProfile' parameters type */
export interface IUpsertStudentProfileParams {
  college?: string | null | void;
  gradeLevel?: string | null | void;
  postalCode?: string | null | void;
  schoolId?: string | null | void;
  studentPartnerOrgKey?: string | null | void;
  studentPartnerOrgSiteName?: string | null | void;
  userId: string;
}

/** 'UpsertStudentProfile' return type */
export interface IUpsertStudentProfileResult {
  college: string | null;
  createdAt: Date;
  gradeLevel: string | null;
  isCreated: boolean | null;
  postalCode: string | null;
  schoolId: string | null;
  studentPartnerOrgKey: string | null;
  studentPartnerOrgSiteName: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'UpsertStudentProfile' query type */
export interface IUpsertStudentProfileQuery {
  params: IUpsertStudentProfileParams;
  result: IUpsertStudentProfileResult;
}

const upsertStudentProfileIR: any = {"usedParamSet":{"userId":true,"postalCode":true,"studentPartnerOrgKey":true,"studentPartnerOrgSiteName":true,"gradeLevel":true,"schoolId":true,"college":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":184}]},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"locs":[{"a":187,"b":197},{"a":942,"b":952}]},{"name":"studentPartnerOrgKey","required":false,"transform":{"type":"scalar"},"locs":[{"a":355,"b":375},{"a":1509,"b":1529}]},{"name":"studentPartnerOrgSiteName","required":false,"transform":{"type":"scalar"},"locs":[{"a":573,"b":598},{"a":1721,"b":1746}]},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"locs":[{"a":770,"b":780},{"a":1955,"b":1965}]},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":812,"b":820},{"a":1333,"b":1341}]},{"name":"college","required":false,"transform":{"type":"scalar"},"locs":[{"a":831,"b":838},{"a":1396,"b":1403}]}],"statement":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\n    VALUES (:userId!, :postalCode, (\n            SELECT\n                id\n            FROM\n                student_partner_orgs\n            WHERE\n                student_partner_orgs.key = :studentPartnerOrgKey\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                student_partner_org_sites\n            WHERE\n                student_partner_org_sites.name = :studentPartnerOrgSiteName\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                grade_levels\n            WHERE\n                grade_levels.name = :gradeLevel\n            LIMIT 1),\n        :schoolId,\n        :college,\n        NOW(),\n        NOW())\nON CONFLICT (user_id)\n    DO UPDATE SET\n        postal_code = COALESCE(:postalCode, student_profiles.postal_code),\n    student_partner_org_id = COALESCE(EXCLUDED.student_partner_org_id, student_profiles.student_partner_org_id),\n    student_partner_org_site_id = CASE WHEN EXCLUDED.student_partner_org_id IS NOT NULL THEN\n        EXCLUDED.student_partner_org_site_id\n    ELSE\n        student_profiles.student_partner_org_site_id\n    END,\n    school_id = COALESCE(:schoolId, student_profiles.school_id),\n    college = COALESCE(:college, student_profiles.college),\n    updated_at = NOW()\nRETURNING\n    user_id,\n    postal_code,\n    COALESCE(:studentPartnerOrgKey, (\n            SELECT\n                KEY FROM student_partner_orgs\n            WHERE\n                id = student_profiles.student_partner_org_id)) AS student_partner_org_key,\n    COALESCE(:studentPartnerOrgSiteName, (\n            SELECT\n                name FROM student_partner_org_sites\n            WHERE\n                id = student_profiles.student_partner_org_site_id)) AS student_partner_org_site_name,\n    COALESCE(:gradeLevel, (\n            SELECT\n                name FROM grade_levels\n            WHERE\n                id = student_profiles.grade_level_id)) AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at,\n    (xmax = 0) AS is_created"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
 *     VALUES (:userId!, :postalCode, (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_orgs
 *             WHERE
 *                 student_partner_orgs.key = :studentPartnerOrgKey
 *             LIMIT 1),
 *         (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_org_sites
 *             WHERE
 *                 student_partner_org_sites.name = :studentPartnerOrgSiteName
 *             LIMIT 1),
 *         (
 *             SELECT
 *                 id
 *             FROM
 *                 grade_levels
 *             WHERE
 *                 grade_levels.name = :gradeLevel
 *             LIMIT 1),
 *         :schoolId,
 *         :college,
 *         NOW(),
 *         NOW())
 * ON CONFLICT (user_id)
 *     DO UPDATE SET
 *         postal_code = COALESCE(:postalCode, student_profiles.postal_code),
 *     student_partner_org_id = COALESCE(EXCLUDED.student_partner_org_id, student_profiles.student_partner_org_id),
 *     student_partner_org_site_id = CASE WHEN EXCLUDED.student_partner_org_id IS NOT NULL THEN
 *         EXCLUDED.student_partner_org_site_id
 *     ELSE
 *         student_profiles.student_partner_org_site_id
 *     END,
 *     school_id = COALESCE(:schoolId, student_profiles.school_id),
 *     college = COALESCE(:college, student_profiles.college),
 *     updated_at = NOW()
 * RETURNING
 *     user_id,
 *     postal_code,
 *     COALESCE(:studentPartnerOrgKey, (
 *             SELECT
 *                 KEY FROM student_partner_orgs
 *             WHERE
 *                 id = student_profiles.student_partner_org_id)) AS student_partner_org_key,
 *     COALESCE(:studentPartnerOrgSiteName, (
 *             SELECT
 *                 name FROM student_partner_org_sites
 *             WHERE
 *                 id = student_profiles.student_partner_org_site_id)) AS student_partner_org_site_name,
 *     COALESCE(:gradeLevel, (
 *             SELECT
 *                 name FROM grade_levels
 *             WHERE
 *                 id = student_profiles.grade_level_id)) AS grade_level,
 *     school_id,
 *     college,
 *     created_at,
 *     updated_at,
 *     (xmax = 0) AS is_created
 * ```
 */
export const upsertStudentProfile = new PreparedQuery<IUpsertStudentProfileParams,IUpsertStudentProfileResult>(upsertStudentProfileIR);


/** 'CreateUserStudentPartnerOrgInstance' parameters type */
export interface ICreateUserStudentPartnerOrgInstanceParams {
  spoName: string;
  spoSiteName?: string | null | void;
  userId: string;
}

/** 'CreateUserStudentPartnerOrgInstance' return type */
export interface ICreateUserStudentPartnerOrgInstanceResult {
  ok: string | null;
}

/** 'CreateUserStudentPartnerOrgInstance' query type */
export interface ICreateUserStudentPartnerOrgInstanceQuery {
  params: ICreateUserStudentPartnerOrgInstanceParams;
  result: ICreateUserStudentPartnerOrgInstanceResult;
}

const createUserStudentPartnerOrgInstanceIR: any = {"usedParamSet":{"userId":true,"spoSiteName":true,"spoName":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":147,"b":154}]},{"name":"spoSiteName","required":false,"transform":{"type":"scalar"},"locs":[{"a":184,"b":195},{"a":458,"b":469},{"a":498,"b":509}]},{"name":"spoName","required":true,"transform":{"type":"scalar"},"locs":[{"a":438,"b":446}]}],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    CASE WHEN (:spoSiteName)::text IS NOT NULL THEN\n        sposite.id\n    ELSE\n        NULL\n    END,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id\nWHERE\n    spo.name = :spoName!\n    AND ((:spoSiteName)::text IS NULL\n        OR (:spoSiteName)::text = sposite.name)\nLIMIT 1\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     spo.id,
 *     CASE WHEN (:spoSiteName)::text IS NOT NULL THEN
 *         sposite.id
 *     ELSE
 *         NULL
 *     END,
 *     NOW(),
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id
 * WHERE
 *     spo.name = :spoName!
 *     AND ((:spoSiteName)::text IS NULL
 *         OR (:spoSiteName)::text = sposite.name)
 * LIMIT 1
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const createUserStudentPartnerOrgInstance = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceParams,ICreateUserStudentPartnerOrgInstanceResult>(createUserStudentPartnerOrgInstanceIR);


/** 'CreateUserStudentPartnerOrgInstanceWithSchoolId' parameters type */
export interface ICreateUserStudentPartnerOrgInstanceWithSchoolIdParams {
  schoolId: string;
  userId: string;
}

/** 'CreateUserStudentPartnerOrgInstanceWithSchoolId' return type */
export interface ICreateUserStudentPartnerOrgInstanceWithSchoolIdResult {
  ok: string | null;
}

/** 'CreateUserStudentPartnerOrgInstanceWithSchoolId' query type */
export interface ICreateUserStudentPartnerOrgInstanceWithSchoolIdQuery {
  params: ICreateUserStudentPartnerOrgInstanceWithSchoolIdParams;
  result: ICreateUserStudentPartnerOrgInstanceWithSchoolIdResult;
}

const createUserStudentPartnerOrgInstanceWithSchoolIdIR: any = {"usedParamSet":{"userId":true,"schoolId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":147,"b":154}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":260,"b":269}]}],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    NULL,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.school_id = :schoolId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     spo.id,
 *     NULL,
 *     NOW(),
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.school_id = :schoolId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const createUserStudentPartnerOrgInstanceWithSchoolId = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceWithSchoolIdParams,ICreateUserStudentPartnerOrgInstanceWithSchoolIdResult>(createUserStudentPartnerOrgInstanceWithSchoolIdIR);


/** 'GetActiveStudentOrgInstance' parameters type */
export interface IGetActiveStudentOrgInstanceParams {
  spoId: string;
  studentId: string;
}

/** 'GetActiveStudentOrgInstance' return type */
export interface IGetActiveStudentOrgInstanceResult {
  id: string;
  name: string;
}

/** 'GetActiveStudentOrgInstance' query type */
export interface IGetActiveStudentOrgInstanceQuery {
  params: IGetActiveStudentOrgInstanceParams;
  result: IGetActiveStudentOrgInstanceResult;
}

const getActiveStudentOrgInstanceIR: any = {"usedParamSet":{"studentId":true,"spoId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":185,"b":195}]},{"name":"spoId","required":true,"transform":{"type":"scalar"},"locs":[{"a":236,"b":242}]}],"statement":"SELECT\n    spo.name,\n    spo.id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND uspoi.student_partner_org_id = :spoId!\n    AND deactivated_on IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.name,
 *     spo.id
 * FROM
 *     users_student_partner_orgs_instances uspoi
 *     JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
 * WHERE
 *     uspoi.user_id = :studentId!
 *     AND uspoi.student_partner_org_id = :spoId!
 *     AND deactivated_on IS NULL
 * ```
 */
export const getActiveStudentOrgInstance = new PreparedQuery<IGetActiveStudentOrgInstanceParams,IGetActiveStudentOrgInstanceResult>(getActiveStudentOrgInstanceIR);


/** 'GetSessionReport' parameters type */
export interface IGetSessionReportParams {
  end: DateOrString;
  highSchoolId?: string | null | void;
  sponsorOrg?: string | null | void;
  start: DateOrString;
  studentPartnerOrg?: string | null | void;
  studentPartnerSite?: string | null | void;
}

/** 'GetSessionReport' return type */
export interface IGetSessionReportResult {
  createdAt: Date;
  email: string;
  endedAt: Date | null;
  firstName: string;
  lastName: string;
  partnerSite: string;
  sessionId: string;
  sessionRating: number;
  sponsorOrg: string | null;
  subject: string;
  topic: string;
  totalMessages: number | null;
  volunteerJoined: string | null;
  volunteerJoinedAt: Date | null;
  waitTimeMins: number | null;
}

/** 'GetSessionReport' query type */
export interface IGetSessionReportQuery {
  params: IGetSessionReportParams;
  result: IGetSessionReportResult;
}

const getSessionReportIR: any = {"usedParamSet":{"start":true,"end":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"params":[{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":800,"b":806}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":843,"b":847}]},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":3817,"b":3829},{"a":3882,"b":3894}]},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":3903,"b":3920},{"a":3971,"b":3988}]},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"locs":[{"a":3997,"b":4015},{"a":4072,"b":4090}]},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":4099,"b":4109},{"a":4221,"b":4231},{"a":4322,"b":4332}]}],"statement":"WITH student_sessions AS (\n    SELECT\n        sessions.id AS session_id,\n        sessions.created_at,\n        ended_at,\n        volunteer_joined_at,\n        student_id,\n        subject_id,\n        (\n            CASE WHEN sessions.volunteer_id IS NOT NULL THEN\n                'YES'\n            ELSE\n                'NO'\n            END) AS volunteer_joined,\n        (\n            CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n                round(extract(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)\n            ELSE\n                NULL\n            END)::float AS wait_time_mins,\n        first_name,\n        last_name,\n        email\n    FROM\n        sessions\n        INNER JOIN users ON users.id = sessions.student_id\n    WHERE\n        sessions.created_at >= :start!\n        AND sessions.created_at <= :end!\n        AND sessions.ended_at IS NOT NULL\n),\nsession_ratings AS (\n    SELECT\n        users_surveys.session_id,\n        survey_response_choices.score AS session_rating\n    FROM\n        users_surveys\n        INNER JOIN users_surveys_submissions ON users_surveys.id = users_surveys_submissions.user_survey_id\n        INNER JOIN survey_questions ON users_surveys_submissions.survey_question_id = survey_questions.id\n        INNER JOIN survey_response_choices ON users_surveys_submissions.survey_response_choice_id = survey_response_choices.id\n    WHERE\n        survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'\n)\nSELECT\n    student_sessions.session_id AS session_id,\n    student_sessions.created_at AS created_at,\n    student_sessions.ended_at AS ended_at,\n    student_sessions.volunteer_joined AS volunteer_joined,\n    student_sessions.volunteer_joined_at AS volunteer_joined_at,\n    student_sessions.wait_time_mins AS wait_time_mins,\n    student_sessions.first_name AS first_name,\n    student_sessions.last_name AS last_name,\n    student_sessions.email AS email,\n    session_ratings.session_rating AS session_rating,\n    topics.name AS topic,\n    subjects.name AS subject,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    coalesce(messages.total, 0)::int AS total_messages\nFROM\n    student_sessions\n    JOIN subjects ON student_sessions.subject_id = subjects.id\n    JOIN topics ON subjects.topic_id = topics.id\n    JOIN student_profiles ON student_profiles.user_id = student_sessions.student_id\n    LEFT JOIN session_ratings ON session_ratings.session_id = student_sessions.session_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN LATERAL (\n        SELECT\n            session_id,\n            count(*) AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = student_sessions.session_id\n        GROUP BY\n            session_id) AS messages ON TRUE\nWHERE ((:highSchoolId)::uuid IS NULL\n    OR student_profiles.school_id = :highSchoolId)\nAND ((:studentPartnerOrg)::text IS NULL\n    OR student_partner_orgs.key = :studentPartnerOrg)\nAND ((:studentPartnerSite)::text IS NULL\n    OR student_partner_org_sites.name = :studentPartnerSite)\nAND ((:sponsorOrg)::text IS NULL\n    OR ((partner_org_sponsor_org.key IS NOT NULL\n            AND partner_org_sponsor_org.key = :sponsorOrg)\n        OR (school_sponsor_org.key IS NOT NULL\n            AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    student_sessions.created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * WITH student_sessions AS (
 *     SELECT
 *         sessions.id AS session_id,
 *         sessions.created_at,
 *         ended_at,
 *         volunteer_joined_at,
 *         student_id,
 *         subject_id,
 *         (
 *             CASE WHEN sessions.volunteer_id IS NOT NULL THEN
 *                 'YES'
 *             ELSE
 *                 'NO'
 *             END) AS volunteer_joined,
 *         (
 *             CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN
 *                 round(extract(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)
 *             ELSE
 *                 NULL
 *             END)::float AS wait_time_mins,
 *         first_name,
 *         last_name,
 *         email
 *     FROM
 *         sessions
 *         INNER JOIN users ON users.id = sessions.student_id
 *     WHERE
 *         sessions.created_at >= :start!
 *         AND sessions.created_at <= :end!
 *         AND sessions.ended_at IS NOT NULL
 * ),
 * session_ratings AS (
 *     SELECT
 *         users_surveys.session_id,
 *         survey_response_choices.score AS session_rating
 *     FROM
 *         users_surveys
 *         INNER JOIN users_surveys_submissions ON users_surveys.id = users_surveys_submissions.user_survey_id
 *         INNER JOIN survey_questions ON users_surveys_submissions.survey_question_id = survey_questions.id
 *         INNER JOIN survey_response_choices ON users_surveys_submissions.survey_response_choice_id = survey_response_choices.id
 *     WHERE
 *         survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
 * )
 * SELECT
 *     student_sessions.session_id AS session_id,
 *     student_sessions.created_at AS created_at,
 *     student_sessions.ended_at AS ended_at,
 *     student_sessions.volunteer_joined AS volunteer_joined,
 *     student_sessions.volunteer_joined_at AS volunteer_joined_at,
 *     student_sessions.wait_time_mins AS wait_time_mins,
 *     student_sessions.first_name AS first_name,
 *     student_sessions.last_name AS last_name,
 *     student_sessions.email AS email,
 *     session_ratings.session_rating AS session_rating,
 *     topics.name AS topic,
 *     subjects.name AS subject,
 *     student_partner_org_sites.name AS partner_site,
 *     (
 *         CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
 *             partner_org_sponsor_org.name
 *         WHEN school_sponsor_org.name IS NOT NULL THEN
 *             school_sponsor_org.name
 *         ELSE
 *             NULL
 *         END) AS sponsor_org,
 *     coalesce(messages.total, 0)::int AS total_messages
 * FROM
 *     student_sessions
 *     JOIN subjects ON student_sessions.subject_id = subjects.id
 *     JOIN topics ON subjects.topic_id = topics.id
 *     JOIN student_profiles ON student_profiles.user_id = student_sessions.student_id
 *     LEFT JOIN session_ratings ON session_ratings.session_id = student_sessions.session_id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
 *     LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
 *     LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
 *     LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             session_id,
 *             count(*) AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_id = student_sessions.session_id
 *         GROUP BY
 *             session_id) AS messages ON TRUE
 * WHERE ((:highSchoolId)::uuid IS NULL
 *     OR student_profiles.school_id = :highSchoolId)
 * AND ((:studentPartnerOrg)::text IS NULL
 *     OR student_partner_orgs.key = :studentPartnerOrg)
 * AND ((:studentPartnerSite)::text IS NULL
 *     OR student_partner_org_sites.name = :studentPartnerSite)
 * AND ((:sponsorOrg)::text IS NULL
 *     OR ((partner_org_sponsor_org.key IS NOT NULL
 *             AND partner_org_sponsor_org.key = :sponsorOrg)
 *         OR (school_sponsor_org.key IS NOT NULL
 *             AND school_sponsor_org.key = :sponsorOrg)))
 * ORDER BY
 *     student_sessions.created_at ASC
 * ```
 */
export const getSessionReport = new PreparedQuery<IGetSessionReportParams,IGetSessionReportResult>(getSessionReportIR);


/** 'GetUsageReport' parameters type */
export interface IGetUsageReportParams {
  highSchoolId?: string | null | void;
  joinedEnd: DateOrString;
  joinedStart: DateOrString;
  sessionEnd: DateOrString;
  sessionStart: DateOrString;
  sponsorOrg?: string | null | void;
  studentPartnerOrg?: string | null | void;
  studentPartnerSite?: string | null | void;
}

/** 'GetUsageReport' return type */
export interface IGetUsageReportResult {
  email: string;
  firstName: string;
  joinDate: Date;
  lastName: string;
  partnerSite: string;
  rangeSessionLengthMins: number | null;
  rangeTotalSessions: number | null;
  school: string;
  sponsorOrg: string | null;
  studentPartnerOrg: string;
  totalSessionLengthMins: number | null;
  totalSessions: number | null;
  userId: string;
}

/** 'GetUsageReport' query type */
export interface IGetUsageReportQuery {
  params: IGetUsageReportParams;
  result: IGetUsageReportResult;
}

const getUsageReportIR: any = {"usedParamSet":{"sessionStart":true,"sessionEnd":true,"joinedStart":true,"joinedEnd":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"params":[{"name":"sessionStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":2673,"b":2686},{"a":3148,"b":3161},{"a":3544,"b":3557}]},{"name":"sessionEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":2735,"b":2746},{"a":3210,"b":3221},{"a":3606,"b":3617}]},{"name":"joinedStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":4216,"b":4228}]},{"name":"joinedEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":4258,"b":4268}]},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":4280,"b":4292},{"a":4349,"b":4361}]},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":4370,"b":4387},{"a":4438,"b":4455}]},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"locs":[{"a":4464,"b":4482},{"a":4539,"b":4557}]},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":4566,"b":4576},{"a":4688,"b":4698},{"a":4789,"b":4799}]}],"statement":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS join_date,\n    student_partner_orgs.name AS student_partner_org,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    schools.name AS school,\n    COALESCE(sessions.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,\n    COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,\n    COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            sum(\n                CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN\n                    0\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS total_session_length_mins,\n            sum(\n                CASE WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd!\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS range_session_length_mins,\n            count(*)::int AS total_sessions,\n            sum(\n                CASE WHEN sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS range_total_sessions,\n            student_id\n        FROM\n            sessions\n    LEFT JOIN (\n        SELECT\n            MAX(created_at) AS created_at,\n            session_id\n        FROM\n            session_messages\n        GROUP BY\n            session_id) AS last_message ON last_message.session_id = sessions.id\n    WHERE\n        sessions.ended_at IS NOT NULL\n    GROUP BY\n        sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id\nWHERE\n    users.created_at >= :joinedStart!\n    AND users.created_at <= :joinedEnd!\n    AND ((:highSchoolId)::uuid IS NULL\n        OR student_profiles.school_id = :highSchoolId)\nAND ((:studentPartnerOrg)::text IS NULL\n    OR student_partner_orgs.key = :studentPartnerOrg)\nAND ((:studentPartnerSite)::text IS NULL\n    OR student_partner_org_sites.name = :studentPartnerSite)\nAND ((:sponsorOrg)::text IS NULL\n    OR ((partner_org_sponsor_org.key IS NOT NULL\n            AND partner_org_sponsor_org.key = :sponsorOrg)\n        OR (school_sponsor_org.key IS NOT NULL\n            AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    users.created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.email AS email,
 *     users.created_at AS join_date,
 *     student_partner_orgs.name AS student_partner_org,
 *     student_partner_org_sites.name AS partner_site,
 *     (
 *         CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
 *             partner_org_sponsor_org.name
 *         WHEN school_sponsor_org.name IS NOT NULL THEN
 *             school_sponsor_org.name
 *         ELSE
 *             NULL
 *         END) AS sponsor_org,
 *     schools.name AS school,
 *     COALESCE(sessions.total_sessions, 0) AS total_sessions,
 *     COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,
 *     COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,
 *     COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins
 * FROM
 *     student_profiles
 *     JOIN users ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
 *     LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
 *     LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
 *     LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 *     LEFT JOIN (
 *         SELECT
 *             sum(
 *                 CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN
 *                     0
 *                 WHEN sessions.volunteer_joined_at IS NOT NULL
 *                     AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1
 *                     AND last_message.created_at IS NOT NULL THEN
 *                     ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 WHEN sessions.volunteer_joined_at IS NOT NULL THEN
 *                     TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 ELSE
 *                     0
 *                 END)::int AS total_session_length_mins,
 *             sum(
 *                 CASE WHEN sessions.volunteer_joined_at IS NOT NULL
 *                     AND sessions.created_at >= :sessionStart!
 *                     AND sessions.created_at <= :sessionEnd!
 *                     AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1
 *                     AND last_message.created_at IS NOT NULL THEN
 *                     ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 WHEN sessions.volunteer_joined_at IS NOT NULL
 *                     AND sessions.created_at >= :sessionStart!
 *                     AND sessions.created_at <= :sessionEnd! THEN
 *                     TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 ELSE
 *                     0
 *                 END)::int AS range_session_length_mins,
 *             count(*)::int AS total_sessions,
 *             sum(
 *                 CASE WHEN sessions.created_at >= :sessionStart!
 *                     AND sessions.created_at <= :sessionEnd! THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS range_total_sessions,
 *             student_id
 *         FROM
 *             sessions
 *     LEFT JOIN (
 *         SELECT
 *             MAX(created_at) AS created_at,
 *             session_id
 *         FROM
 *             session_messages
 *         GROUP BY
 *             session_id) AS last_message ON last_message.session_id = sessions.id
 *     WHERE
 *         sessions.ended_at IS NOT NULL
 *     GROUP BY
 *         sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id
 * WHERE
 *     users.created_at >= :joinedStart!
 *     AND users.created_at <= :joinedEnd!
 *     AND ((:highSchoolId)::uuid IS NULL
 *         OR student_profiles.school_id = :highSchoolId)
 * AND ((:studentPartnerOrg)::text IS NULL
 *     OR student_partner_orgs.key = :studentPartnerOrg)
 * AND ((:studentPartnerSite)::text IS NULL
 *     OR student_partner_org_sites.name = :studentPartnerSite)
 * AND ((:sponsorOrg)::text IS NULL
 *     OR ((partner_org_sponsor_org.key IS NOT NULL
 *             AND partner_org_sponsor_org.key = :sponsorOrg)
 *         OR (school_sponsor_org.key IS NOT NULL
 *             AND school_sponsor_org.key = :sponsorOrg)))
 * ORDER BY
 *     users.created_at ASC
 * ```
 */
export const getUsageReport = new PreparedQuery<IGetUsageReportParams,IGetUsageReportResult>(getUsageReportIR);


/** 'GetStudentSignupSources' parameters type */
export type IGetStudentSignupSourcesParams = void;

/** 'GetStudentSignupSources' return type */
export interface IGetStudentSignupSourcesResult {
  id: number;
  name: string;
}

/** 'GetStudentSignupSources' query type */
export interface IGetStudentSignupSourcesQuery {
  params: IGetStudentSignupSourcesParams;
  result: IGetStudentSignupSourcesResult;
}

const getStudentSignupSourcesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name <> 'Roster'\nORDER BY\n    RANDOM()"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     signup_sources
 * WHERE
 *     name <> 'Roster'
 * ORDER BY
 *     RANDOM()
 * ```
 */
export const getStudentSignupSources = new PreparedQuery<IGetStudentSignupSourcesParams,IGetStudentSignupSourcesResult>(getStudentSignupSourcesIR);


/** 'DeleteSelfFavoritedVolunteers' parameters type */
export type IDeleteSelfFavoritedVolunteersParams = void;

/** 'DeleteSelfFavoritedVolunteers' return type */
export type IDeleteSelfFavoritedVolunteersResult = void;

/** 'DeleteSelfFavoritedVolunteers' query type */
export interface IDeleteSelfFavoritedVolunteersQuery {
  params: IDeleteSelfFavoritedVolunteersParams;
  result: IDeleteSelfFavoritedVolunteersResult;
}

const deleteSelfFavoritedVolunteersIR: any = {"usedParamSet":{},"params":[],"statement":"DELETE FROM student_favorite_volunteers\nWHERE student_id = volunteer_id"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM student_favorite_volunteers
 * WHERE student_id = volunteer_id
 * ```
 */
export const deleteSelfFavoritedVolunteers = new PreparedQuery<IDeleteSelfFavoritedVolunteersParams,IDeleteSelfFavoritedVolunteersResult>(deleteSelfFavoritedVolunteersIR);


/** 'UpdateStudentSchool' parameters type */
export interface IUpdateStudentSchoolParams {
  schoolId: string;
  userId: string;
}

/** 'UpdateStudentSchool' return type */
export interface IUpdateStudentSchoolResult {
  ok: string;
}

/** 'UpdateStudentSchool' query type */
export interface IUpdateStudentSchoolQuery {
  params: IUpdateStudentSchoolParams;
  result: IUpdateStudentSchoolResult;
}

const updateStudentSchoolIR: any = {"usedParamSet":{"schoolId":true,"userId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":48,"b":57}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":79,"b":86}]}],"statement":"UPDATE\n    student_profiles\nSET\n    school_id = :schoolId!\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     school_id = :schoolId!
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateStudentSchool = new PreparedQuery<IUpdateStudentSchoolParams,IUpdateStudentSchoolResult>(updateStudentSchoolIR);


/** 'GetActivePartnersForStudent' parameters type */
export interface IGetActivePartnersForStudentParams {
  studentId: string;
}

/** 'GetActivePartnersForStudent' return type */
export interface IGetActivePartnersForStudentResult {
  id: string;
  name: string;
  schoolId: string | null;
}

/** 'GetActivePartnersForStudent' query type */
export interface IGetActivePartnersForStudentQuery {
  params: IGetActivePartnersForStudentParams;
  result: IGetActivePartnersForStudentResult;
}

const getActivePartnersForStudentIR: any = {"usedParamSet":{"studentId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":214}]}],"statement":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NOT NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.name,
 *     spo.id,
 *     spo.school_id
 * FROM
 *     users_student_partner_orgs_instances uspoi
 *     JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
 * WHERE
 *     uspoi.user_id = :studentId!
 *     AND deactivated_on IS NOT NULL
 * ```
 */
export const getActivePartnersForStudent = new PreparedQuery<IGetActivePartnersForStudentParams,IGetActivePartnersForStudentResult>(getActivePartnersForStudentIR);


/** 'GetStudentsIdsForGradeLevelSgUpdate' parameters type */
export type IGetStudentsIdsForGradeLevelSgUpdateParams = void;

/** 'GetStudentsIdsForGradeLevelSgUpdate' return type */
export interface IGetStudentsIdsForGradeLevelSgUpdateResult {
  userId: string;
}

/** 'GetStudentsIdsForGradeLevelSgUpdate' query type */
export interface IGetStudentsIdsForGradeLevelSgUpdateQuery {
  params: IGetStudentsIdsForGradeLevelSgUpdateParams;
  result: IGetStudentsIdsForGradeLevelSgUpdateResult;
}

const getStudentsIdsForGradeLevelSgUpdateIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    sp.user_id\nFROM\n    student_profiles sp\n    JOIN current_grade_levels_mview cgl ON cgl.user_id = sp.user_id\nORDER BY\n    sp.created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sp.user_id
 * FROM
 *     student_profiles sp
 *     JOIN current_grade_levels_mview cgl ON cgl.user_id = sp.user_id
 * ORDER BY
 *     sp.created_at DESC
 * ```
 */
export const getStudentsIdsForGradeLevelSgUpdate = new PreparedQuery<IGetStudentsIdsForGradeLevelSgUpdateParams,IGetStudentsIdsForGradeLevelSgUpdateResult>(getStudentsIdsForGradeLevelSgUpdateIR);


/** 'CountDuplicateStudentVolunteerFavorites' parameters type */
export type ICountDuplicateStudentVolunteerFavoritesParams = void;

/** 'CountDuplicateStudentVolunteerFavorites' return type */
export interface ICountDuplicateStudentVolunteerFavoritesResult {
  duplicates: number | null;
}

/** 'CountDuplicateStudentVolunteerFavorites' query type */
export interface ICountDuplicateStudentVolunteerFavoritesQuery {
  params: ICountDuplicateStudentVolunteerFavoritesParams;
  result: ICountDuplicateStudentVolunteerFavoritesResult;
}

const countDuplicateStudentVolunteerFavoritesIR: any = {"usedParamSet":{},"params":[],"statement":"WITH favorites_partition AS (\n    SELECT\n        student_id,\n        volunteer_id,\n        updated_at,\n        created_at,\n        row_number() OVER (PARTITION BY student_id,\n            volunteer_id ORDER BY updated_at DESC) AS rn\n    FROM\n        upchieve.student_favorite_volunteers\n)\nSELECT\n    count(*)::int AS duplicates\nFROM\n    favorites_partition\nWHERE\n    rn <> 1"};

/**
 * Query generated from SQL:
 * ```
 * WITH favorites_partition AS (
 *     SELECT
 *         student_id,
 *         volunteer_id,
 *         updated_at,
 *         created_at,
 *         row_number() OVER (PARTITION BY student_id,
 *             volunteer_id ORDER BY updated_at DESC) AS rn
 *     FROM
 *         upchieve.student_favorite_volunteers
 * )
 * SELECT
 *     count(*)::int AS duplicates
 * FROM
 *     favorites_partition
 * WHERE
 *     rn <> 1
 * ```
 */
export const countDuplicateStudentVolunteerFavorites = new PreparedQuery<ICountDuplicateStudentVolunteerFavoritesParams,ICountDuplicateStudentVolunteerFavoritesResult>(countDuplicateStudentVolunteerFavoritesIR);


/** 'DeleteDuplicateStudentVolunteerFavorites' parameters type */
export type IDeleteDuplicateStudentVolunteerFavoritesParams = void;

/** 'DeleteDuplicateStudentVolunteerFavorites' return type */
export interface IDeleteDuplicateStudentVolunteerFavoritesResult {
  deleted: number | null;
}

/** 'DeleteDuplicateStudentVolunteerFavorites' query type */
export interface IDeleteDuplicateStudentVolunteerFavoritesQuery {
  params: IDeleteDuplicateStudentVolunteerFavoritesParams;
  result: IDeleteDuplicateStudentVolunteerFavoritesResult;
}

const deleteDuplicateStudentVolunteerFavoritesIR: any = {"usedParamSet":{},"params":[],"statement":"WITH favorites_partition AS (\n    SELECT\n        student_id,\n        volunteer_id,\n        updated_at,\n        created_at,\n        row_number() OVER (PARTITION BY student_id,\n            volunteer_id ORDER BY updated_at DESC) AS rn\n    FROM\n        upchieve.student_favorite_volunteers\n),\nduplicate_favorites AS (\n    SELECT\n        student_id,\n        volunteer_id,\n        updated_at,\n        created_at\n    FROM\n        favorites_partition\n    WHERE\n        rn <> 1\n),\ndeleted_rows AS (\n    DELETE FROM upchieve.student_favorite_volunteers\n    WHERE (student_id,\n            volunteer_id,\n            updated_at,\n            created_at) IN (\n            SELECT\n                *\n            FROM\n                duplicate_favorites)\n        RETURNING\n            *\n)\nSELECT\n    COUNT(*)::int AS deleted\nFROM\n    deleted_rows"};

/**
 * Query generated from SQL:
 * ```
 * WITH favorites_partition AS (
 *     SELECT
 *         student_id,
 *         volunteer_id,
 *         updated_at,
 *         created_at,
 *         row_number() OVER (PARTITION BY student_id,
 *             volunteer_id ORDER BY updated_at DESC) AS rn
 *     FROM
 *         upchieve.student_favorite_volunteers
 * ),
 * duplicate_favorites AS (
 *     SELECT
 *         student_id,
 *         volunteer_id,
 *         updated_at,
 *         created_at
 *     FROM
 *         favorites_partition
 *     WHERE
 *         rn <> 1
 * ),
 * deleted_rows AS (
 *     DELETE FROM upchieve.student_favorite_volunteers
 *     WHERE (student_id,
 *             volunteer_id,
 *             updated_at,
 *             created_at) IN (
 *             SELECT
 *                 *
 *             FROM
 *                 duplicate_favorites)
 *         RETURNING
 *             *
 * )
 * SELECT
 *     COUNT(*)::int AS deleted
 * FROM
 *     deleted_rows
 * ```
 */
export const deleteDuplicateStudentVolunteerFavorites = new PreparedQuery<IDeleteDuplicateStudentVolunteerFavoritesParams,IDeleteDuplicateStudentVolunteerFavoritesResult>(deleteDuplicateStudentVolunteerFavoritesIR);


/** 'GetStudentProfilesByUserIds' parameters type */
export interface IGetStudentProfilesByUserIdsParams {
  userIds: readonly (string)[];
}

/** 'GetStudentProfilesByUserIds' return type */
export interface IGetStudentProfilesByUserIdsResult {
  createdAt: Date;
  email: string;
  firstName: string;
  gradeLevel: string | null;
  id: string;
  lastName: string;
  schoolId: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'GetStudentProfilesByUserIds' query type */
export interface IGetStudentProfilesByUserIdsQuery {
  params: IGetStudentProfilesByUserIdsParams;
  result: IGetStudentProfilesByUserIdsResult;
}

const getStudentProfilesByUserIdsIR: any = {"usedParamSet":{"userIds":true},"params":[{"name":"userIds","required":true,"transform":{"type":"array_spread"},"locs":[{"a":508,"b":516}]}],"statement":"SELECT\n    student_profiles.user_id,\n    users.id,\n    first_name,\n    last_name,\n    email,\n    COALESCE(cgl.current_grade_name, grade_levels.name) AS grade_level,\n    users.created_at,\n    users.updated_at,\n    school_id\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\nWHERE\n    student_profiles.user_id IN :userIds!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id,
 *     users.id,
 *     first_name,
 *     last_name,
 *     email,
 *     COALESCE(cgl.current_grade_name, grade_levels.name) AS grade_level,
 *     users.created_at,
 *     users.updated_at,
 *     school_id
 * FROM
 *     student_profiles
 *     JOIN users ON student_profiles.user_id = users.id
 *     LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
 * WHERE
 *     student_profiles.user_id IN :userIds!
 * ```
 */
export const getStudentProfilesByUserIds = new PreparedQuery<IGetStudentProfilesByUserIdsParams,IGetStudentProfilesByUserIdsResult>(getStudentProfilesByUserIdsIR);


/** 'AddStudentsToTeacherClass' parameters type */
export interface IAddStudentsToTeacherClassParams {
  classId: string;
  studentIds: stringArray;
}

/** 'AddStudentsToTeacherClass' return type */
export type IAddStudentsToTeacherClassResult = void;

/** 'AddStudentsToTeacherClass' query type */
export interface IAddStudentsToTeacherClassQuery {
  params: IAddStudentsToTeacherClassParams;
  result: IAddStudentsToTeacherClassResult;
}

const addStudentsToTeacherClassIR: any = {"usedParamSet":{"studentIds":true,"classId":true},"params":[{"name":"studentIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":66,"b":77}]},{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":101}]}],"statement":"INSERT INTO student_classes (user_id, class_id)\nSELECT\n    UNNEST(:studentIds!::uuid[]),\n    :classId!\nON CONFLICT\n    DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_classes (user_id, class_id)
 * SELECT
 *     UNNEST(:studentIds!::uuid[]),
 *     :classId!
 * ON CONFLICT
 *     DO NOTHING
 * ```
 */
export const addStudentsToTeacherClass = new PreparedQuery<IAddStudentsToTeacherClassParams,IAddStudentsToTeacherClassResult>(addStudentsToTeacherClassIR);


/** 'GetStudentByCleverId' parameters type */
export interface IGetStudentByCleverIdParams {
  cleverStudentId: string;
}

/** 'GetStudentByCleverId' return type */
export interface IGetStudentByCleverIdResult {
  id: string;
}

/** 'GetStudentByCleverId' query type */
export interface IGetStudentByCleverIdQuery {
  params: IGetStudentByCleverIdParams;
  result: IGetStudentByCleverIdResult;
}

const getStudentByCleverIdIR: any = {"usedParamSet":{"cleverStudentId":true},"params":[{"name":"cleverStudentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":164,"b":180}]}],"statement":"SELECT\n    sp.user_id AS id\nFROM\n    student_profiles sp\n    JOIN federated_credentials fc ON sp.user_id = fc.user_id\nWHERE\n    issuer LIKE '%clever%'\n    AND id = :cleverStudentId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sp.user_id AS id
 * FROM
 *     student_profiles sp
 *     JOIN federated_credentials fc ON sp.user_id = fc.user_id
 * WHERE
 *     issuer LIKE '%clever%'
 *     AND id = :cleverStudentId!
 * ```
 */
export const getStudentByCleverId = new PreparedQuery<IGetStudentByCleverIdParams,IGetStudentByCleverIdResult>(getStudentByCleverIdIR);


