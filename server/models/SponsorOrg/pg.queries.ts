/** Types generated for queries found in "server/models/SponsorOrg/sponsor_orgs.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'GetSponsorOrgs' parameters type */
export type IGetSponsorOrgsParams = void;

/** 'GetSponsorOrgs' return type */
export interface IGetSponsorOrgsResult {
  key: string;
  name: string;
  schoolIds: stringArray | null;
  studentPartnerOrgIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgs' query type */
export interface IGetSponsorOrgsQuery {
  params: IGetSponsorOrgsParams;
  result: IGetSponsorOrgsResult;
}

const getSponsorOrgsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    so.key,\n    so.name,\n    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,\n    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,\n    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids\nFROM\n    sponsor_orgs so\n    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id\n    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id\n    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id\nGROUP BY\n    so.key,\n    so.name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     so.key,
 *     so.name,
 *     COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
 *     COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
 *     COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
 * FROM
 *     sponsor_orgs so
 *     LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
 *     LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
 * GROUP BY
 *     so.key,
 *     so.name
 * ```
 */
export const getSponsorOrgs = new PreparedQuery<IGetSponsorOrgsParams,IGetSponsorOrgsResult>(getSponsorOrgsIR);


/** 'GetSponsorOrgsByKey' parameters type */
export interface IGetSponsorOrgsByKeyParams {
  sponsorOrg: string;
}

/** 'GetSponsorOrgsByKey' return type */
export interface IGetSponsorOrgsByKeyResult {
  key: string;
  name: string;
  schoolIds: stringArray | null;
  studentPartnerOrgIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgsByKey' query type */
export interface IGetSponsorOrgsByKeyQuery {
  params: IGetSponsorOrgsByKeyParams;
  result: IGetSponsorOrgsByKeyResult;
}

const getSponsorOrgsByKeyIR: any = {"usedParamSet":{"sponsorOrg":true},"params":[{"name":"sponsorOrg","required":true,"transform":{"type":"scalar"},"locs":[{"a":614,"b":625}]}],"statement":"SELECT\n    so.key,\n    so.name,\n    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,\n    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,\n    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids\nFROM\n    sponsor_orgs so\n    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id\n    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id\n    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id\nWHERE\n    so.key = :sponsorOrg!\nGROUP BY\n    so.key,\n    so.name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     so.key,
 *     so.name,
 *     COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
 *     COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
 *     COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
 * FROM
 *     sponsor_orgs so
 *     LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
 *     LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
 * WHERE
 *     so.key = :sponsorOrg!
 * GROUP BY
 *     so.key,
 *     so.name
 * ```
 */
export const getSponsorOrgsByKey = new PreparedQuery<IGetSponsorOrgsByKeyParams,IGetSponsorOrgsByKeyResult>(getSponsorOrgsByKeyIR);


/** 'MigrateExistingSponsorOrgs' parameters type */
export type IMigrateExistingSponsorOrgsParams = void;

/** 'MigrateExistingSponsorOrgs' return type */
export type IMigrateExistingSponsorOrgsResult = void;

/** 'MigrateExistingSponsorOrgs' query type */
export interface IMigrateExistingSponsorOrgsQuery {
  params: IMigrateExistingSponsorOrgsParams;
  result: IMigrateExistingSponsorOrgsResult;
}

const migrateExistingSponsorOrgsIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    so.id,\n    so.created_at,\n    NOW()\nFROM\n    sponsor_orgs so"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     so.id,
 *     so.created_at,
 *     NOW()
 * FROM
 *     sponsor_orgs so
 * ```
 */
export const migrateExistingSponsorOrgs = new PreparedQuery<IMigrateExistingSponsorOrgsParams,IMigrateExistingSponsorOrgsResult>(migrateExistingSponsorOrgsIR);


/** 'MigrateExistingPartnerOrgSponsorOrgRelationships' parameters type */
export type IMigrateExistingPartnerOrgSponsorOrgRelationshipsParams = void;

/** 'MigrateExistingPartnerOrgSponsorOrgRelationships' return type */
export type IMigrateExistingPartnerOrgSponsorOrgRelationshipsResult = void;

/** 'MigrateExistingPartnerOrgSponsorOrgRelationships' query type */
export interface IMigrateExistingPartnerOrgSponsorOrgRelationshipsQuery {
  params: IMigrateExistingPartnerOrgSponsorOrgRelationshipsParams;
  result: IMigrateExistingPartnerOrgSponsorOrgRelationshipsResult;
}

const migrateExistingPartnerOrgSponsorOrgRelationshipsIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)\nSELECT\n    sposo.student_partner_org_id,\n    sposo.sponsor_org_id,\n    sposo.created_at,\n    NOW()\nFROM\n    student_partner_orgs_sponsor_orgs sposo"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)
 * SELECT
 *     sposo.student_partner_org_id,
 *     sposo.sponsor_org_id,
 *     sposo.created_at,
 *     NOW()
 * FROM
 *     student_partner_orgs_sponsor_orgs sposo
 * ```
 */
export const migrateExistingPartnerOrgSponsorOrgRelationships = new PreparedQuery<IMigrateExistingPartnerOrgSponsorOrgRelationshipsParams,IMigrateExistingPartnerOrgSponsorOrgRelationshipsResult>(migrateExistingPartnerOrgSponsorOrgRelationshipsIR);


/** 'MigrateExistingSchoolsSponsorOrgRelationships' parameters type */
export type IMigrateExistingSchoolsSponsorOrgRelationshipsParams = void;

/** 'MigrateExistingSchoolsSponsorOrgRelationships' return type */
export type IMigrateExistingSchoolsSponsorOrgRelationshipsResult = void;

/** 'MigrateExistingSchoolsSponsorOrgRelationships' query type */
export interface IMigrateExistingSchoolsSponsorOrgRelationshipsQuery {
  params: IMigrateExistingSchoolsSponsorOrgRelationshipsParams;
  result: IMigrateExistingSchoolsSponsorOrgRelationshipsResult;
}

const migrateExistingSchoolsSponsorOrgRelationshipsIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)\nSELECT\n    sso.school_id,\n    sso.sponsor_org_id,\n    sso.created_at,\n    NOW()\nFROM\n    schools_sponsor_orgs sso"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)
 * SELECT
 *     sso.school_id,
 *     sso.sponsor_org_id,
 *     sso.created_at,
 *     NOW()
 * FROM
 *     schools_sponsor_orgs sso
 * ```
 */
export const migrateExistingSchoolsSponsorOrgRelationships = new PreparedQuery<IMigrateExistingSchoolsSponsorOrgRelationshipsParams,IMigrateExistingSchoolsSponsorOrgRelationshipsResult>(migrateExistingSchoolsSponsorOrgRelationshipsIR);


