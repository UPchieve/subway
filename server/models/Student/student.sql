/* @name getGatesStudentById */
SELECT
    student_profiles.user_id AS id,
    COALESCE(cgl.current_grade_name, grade_levels.name) AS current_grade,
    student_partner_orgs.name AS student_partner_org,
    schools.partner AS is_partner_school,
    student_profiles.school_id AS approved_highschool
FROM
    student_profiles
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
    LEFT JOIN schools ON student_profiles.school_id = schools.id
WHERE
    student_profiles.user_id = :userId!;


/* @name getStudentContactInfoById */
SELECT
    users.id,
    first_name,
    email,
    student_partner_orgs.key AS student_partner_org,
    student_profiles.school_id
FROM
    users
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
WHERE
    ban_type IS DISTINCT FROM 'complete'
    AND deactivated IS FALSE
    AND test_user IS FALSE
    AND (users.id::uuid = :userId
        OR users.mongo_id::text = :mongoUserId);


/* @name getStudentByEmail */
SELECT
    users.id
FROM
    student_profiles
    LEFT JOIN users ON student_profiles.user_id = users.id
WHERE
    email = :email!;


/* @name isTestUser */
SELECT
    test_user
FROM
    users
WHERE
    id = :userId!;


/* @name getTotalFavoriteVolunteers */
SELECT
    COUNT(*)::int AS total
FROM
    student_favorite_volunteers
WHERE
    student_id = :userId!;


/* @name isFavoriteVolunteer */
SELECT
    volunteer_id
FROM
    student_favorite_volunteers
WHERE
    student_id = :studentId!
    AND volunteer_id = :volunteerId!;


/* @name getFavoriteVolunteersByStudentId */
SELECT
    student_favorite_volunteers.volunteer_id AS id
FROM
    student_favorite_volunteers
    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
WHERE
    student_favorite_volunteers.student_id = :studentId!;


/* @name getFavoriteVolunteersPaginated */
SELECT
    student_favorite_volunteers.volunteer_id AS volunteer_id,
    users.first_name AS first_name,
    COALESCE(sessions.total, 0)::int AS num_sessions
FROM
    student_favorite_volunteers
    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
    LEFT JOIN (
        SELECT
            count(*) AS total,
            sessions.volunteer_id
        FROM
            sessions
        WHERE
            sessions.student_id = :studentId!
        GROUP BY
            sessions.student_id,
            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id
WHERE
    student_favorite_volunteers.student_id = :studentId!
ORDER BY
    student_favorite_volunteers.created_at DESC
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name deleteFavoriteVolunteer */
DELETE FROM student_favorite_volunteers
WHERE student_id = :studentId!
    AND volunteer_id = :volunteerId!;


/* @name addFavoriteVolunteer */
INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)
    VALUES (:studentId!, :volunteerId!, NOW(), NOW())
ON CONFLICT
    DO NOTHING
RETURNING
    student_id, volunteer_id;


/* @name getStudentPartnerInfoById */
SELECT
    student_profiles.user_id AS id,
    student_partner_orgs.key AS student_partner_org,
    student_profiles.school_id AS approved_highschool
FROM
    student_profiles
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
WHERE
    student_profiles.user_id = :userId!;


/* @name deleteStudent */
UPDATE
    users
SET
    email = :email!,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name adminUpdateStudent */
UPDATE
    users
SET
    first_name = COALESCE(:firstName, first_name),
    last_name = COALESCE(:lastName, last_name),
    email = :email!,
    verified = :verified!,
    ban_type = :banType,
    deactivated = :deactivated!,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name adminUpdateStudentProfile */
UPDATE
    student_profiles
SET
    student_partner_org_id = :partnerOrgId,
    student_partner_org_site_id = :partnerOrgSiteId,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name getPartnerOrgsByStudent */
SELECT
    spo.name,
    spo.id,
    spo.school_id,
    sposite.name AS site_name
FROM
    users_student_partner_orgs_instances uspoi
    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
    LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id
WHERE
    uspoi.user_id = :studentId!
    AND deactivated_on IS NULL;


/* @name adminDeactivateStudentPartnershipInstance */
UPDATE
    users_student_partner_orgs_instances
SET
    deactivated_on = NOW()
WHERE
    user_id = :userId!
    AND student_partner_org_id = :spoId!
RETURNING
    user_id AS ok;


/* @name insertStudentPartnershipInstance */
INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
    VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())
RETURNING
    user_id AS ok;


/* @name getPartnerOrgByKey */
SELECT
    student_partner_orgs.id AS partner_id,
    student_partner_orgs.key AS partner_key,
    student_partner_orgs.name AS partner_name,
    student_partner_orgs.school_id AS school_id,
    student_partner_org_sites.id AS site_id,
    student_partner_org_sites.name AS site_name
FROM
    student_partner_orgs
    LEFT JOIN (
        SELECT
            name,
            id,
            student_partner_org_id
        FROM
            student_partner_org_sites
        WHERE
            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id
WHERE
    student_partner_orgs.key = :partnerOrgKey
LIMIT 1;


/* @name updateStudentInGatesStudy */
UPDATE
    user_product_flags
SET
    in_gates_study = COALESCE(:inGatesStudy, in_gates_study)
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name createStudentUser */
INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
    VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
ON CONFLICT (email)
    DO NOTHING
RETURNING
    id, first_name, last_name, email, verified, ban_type, test_user, deactivated, created_at;


/* @name createStudentProfile */
INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
    VALUES (:userId!, :postalCode, (
            SELECT
                id
            FROM
                student_partner_orgs
            WHERE
                student_partner_orgs.key = :partnerOrg
            LIMIT 1),
        (
            SELECT
                id
            FROM
                student_partner_org_sites
            WHERE
                student_partner_org_sites.name = :partnerSite
            LIMIT 1),
        (
            SELECT
                id
            FROM
                grade_levels
            WHERE
                grade_levels.name = :gradeLevel
            LIMIT 1),
        :schoolId,
        :college,
        NOW(),
        NOW())
RETURNING
    user_id,
    postal_code,
    :partnerOrg AS student_partner_org,
    :partnerSite AS partner_site,
    :gradeLevel AS grade_level,
    school_id,
    college,
    created_at,
    updated_at;


/* @name upsertStudentProfile */
INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
    VALUES (:userId!, :postalCode, (
            SELECT
                id
            FROM
                student_partner_orgs
            WHERE
                student_partner_orgs.key = :studentPartnerOrgKey
            LIMIT 1),
        (
            SELECT
                id
            FROM
                student_partner_org_sites
            WHERE
                student_partner_org_sites.name = :studentPartnerOrgSiteName
            LIMIT 1),
        (
            SELECT
                id
            FROM
                grade_levels
            WHERE
                grade_levels.name = :gradeLevel
            LIMIT 1),
        :schoolId,
        :college,
        NOW(),
        NOW())
ON CONFLICT (user_id)
    DO UPDATE SET
        postal_code = COALESCE(:postalCode, student_profiles.postal_code),
    student_partner_org_id = COALESCE(EXCLUDED.student_partner_org_id, student_profiles.student_partner_org_id),
    student_partner_org_site_id = CASE WHEN EXCLUDED.student_partner_org_id IS NOT NULL THEN
        EXCLUDED.student_partner_org_site_id
    ELSE
        student_profiles.student_partner_org_site_id
    END,
    school_id = COALESCE(:schoolId, student_profiles.school_id),
    college = COALESCE(:college, student_profiles.college),
    updated_at = NOW()
RETURNING
    user_id,
    postal_code,
    COALESCE(:studentPartnerOrgKey, (
            SELECT
                KEY FROM student_partner_orgs
            WHERE
                id = student_profiles.student_partner_org_id)) AS student_partner_org_key,
    COALESCE(:studentPartnerOrgSiteName, (
            SELECT
                name FROM student_partner_org_sites
            WHERE
                id = student_profiles.student_partner_org_site_id)) AS student_partner_org_site_name,
    COALESCE(:gradeLevel, (
            SELECT
                name FROM grade_levels
            WHERE
                id = student_profiles.grade_level_id)) AS grade_level,
    school_id,
    college,
    created_at,
    updated_at,
    (xmax = 0) AS is_created;


/* @name createUserStudentPartnerOrgInstance */
INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
SELECT
    :userId!,
    spo.id,
    CASE WHEN (:spoSiteName)::text IS NOT NULL THEN
        sposite.id
    ELSE
        NULL
    END,
    NOW(),
    NOW()
FROM
    student_partner_orgs spo
    LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id
WHERE
    spo.name = :spoName!
    AND ((:spoSiteName)::text IS NULL
        OR (:spoSiteName)::text = sposite.name)
LIMIT 1
RETURNING
    user_id AS ok;


/* @name createUserStudentPartnerOrgInstanceWithSchoolId */
INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
SELECT
    :userId!,
    spo.id,
    NULL,
    NOW(),
    NOW()
FROM
    student_partner_orgs spo
WHERE
    spo.school_id = :schoolId!
RETURNING
    user_id AS ok;


/* @name getActiveStudentOrgInstance */
SELECT
    spo.name,
    spo.id
FROM
    users_student_partner_orgs_instances uspoi
    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
WHERE
    uspoi.user_id = :studentId!
    AND uspoi.student_partner_org_id = :spoId!
    AND deactivated_on IS NULL;


/* @name getSessionReport */
WITH student_sessions AS (
    SELECT
        sessions.id AS session_id,
        sessions.created_at,
        ended_at,
        volunteer_joined_at,
        student_id,
        subject_id,
        (
            CASE WHEN sessions.volunteer_id IS NOT NULL THEN
                'YES'
            ELSE
                'NO'
            END) AS volunteer_joined,
        (
            CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN
                round(extract(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)
            ELSE
                NULL
            END)::float AS wait_time_mins,
        first_name,
        last_name,
        email
    FROM
        sessions
        INNER JOIN users ON users.id = sessions.student_id
    WHERE
        sessions.created_at >= :start!
        AND sessions.created_at <= :end!
        AND sessions.ended_at IS NOT NULL
),
session_ratings AS (
    SELECT
        users_surveys.session_id,
        survey_response_choices.score AS session_rating
    FROM
        users_surveys
        INNER JOIN users_surveys_submissions ON users_surveys.id = users_surveys_submissions.user_survey_id
        INNER JOIN survey_questions ON users_surveys_submissions.survey_question_id = survey_questions.id
        INNER JOIN survey_response_choices ON users_surveys_submissions.survey_response_choice_id = survey_response_choices.id
    WHERE
        survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
)
SELECT
    student_sessions.session_id AS session_id,
    student_sessions.created_at AS created_at,
    student_sessions.ended_at AS ended_at,
    student_sessions.volunteer_joined AS volunteer_joined,
    student_sessions.volunteer_joined_at AS volunteer_joined_at,
    student_sessions.wait_time_mins AS wait_time_mins,
    student_sessions.first_name AS first_name,
    student_sessions.last_name AS last_name,
    student_sessions.email AS email,
    session_ratings.session_rating AS session_rating,
    topics.name AS topic,
    subjects.name AS subject,
    student_partner_org_sites.name AS partner_site,
    (
        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
            partner_org_sponsor_org.name
        WHEN school_sponsor_org.name IS NOT NULL THEN
            school_sponsor_org.name
        ELSE
            NULL
        END) AS sponsor_org,
    coalesce(messages.total, 0)::int AS total_messages
FROM
    student_sessions
    JOIN subjects ON student_sessions.subject_id = subjects.id
    JOIN topics ON subjects.topic_id = topics.id
    JOIN student_profiles ON student_profiles.user_id = student_sessions.student_id
    LEFT JOIN session_ratings ON session_ratings.session_id = student_sessions.session_id
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
    LEFT JOIN schools ON student_profiles.school_id = schools.id
    LEFT JOIN LATERAL (
        SELECT
            session_id,
            count(*) AS total
        FROM
            session_messages
        WHERE
            session_id = student_sessions.session_id
        GROUP BY
            session_id) AS messages ON TRUE
WHERE ((:highSchoolId)::uuid IS NULL
    OR student_profiles.school_id = :highSchoolId)
AND ((:studentPartnerOrg)::text IS NULL
    OR student_partner_orgs.key = :studentPartnerOrg)
AND ((:studentPartnerSite)::text IS NULL
    OR student_partner_org_sites.name = :studentPartnerSite)
AND ((:sponsorOrg)::text IS NULL
    OR ((partner_org_sponsor_org.key IS NOT NULL
            AND partner_org_sponsor_org.key = :sponsorOrg)
        OR (school_sponsor_org.key IS NOT NULL
            AND school_sponsor_org.key = :sponsorOrg)))
ORDER BY
    student_sessions.created_at ASC;


/* @name getUsageReport */
SELECT
    users.id AS user_id,
    users.first_name AS first_name,
    users.last_name AS last_name,
    users.email AS email,
    users.created_at AS join_date,
    student_partner_orgs.name AS student_partner_org,
    student_partner_org_sites.name AS partner_site,
    (
        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
            partner_org_sponsor_org.name
        WHEN school_sponsor_org.name IS NOT NULL THEN
            school_sponsor_org.name
        ELSE
            NULL
        END) AS sponsor_org,
    schools.name AS school,
    COALESCE(sessions.total_sessions, 0) AS total_sessions,
    COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,
    COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,
    COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins
FROM
    student_profiles
    JOIN users ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
    LEFT JOIN schools ON student_profiles.school_id = schools.id
    LEFT JOIN (
        SELECT
            sum(
                CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN
                    0
                WHEN sessions.volunteer_joined_at IS NOT NULL
                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1
                    AND last_message.created_at IS NOT NULL THEN
                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)
                WHEN sessions.volunteer_joined_at IS NOT NULL THEN
                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)
                ELSE
                    0
                END)::int AS total_session_length_mins,
            sum(
                CASE WHEN sessions.volunteer_joined_at IS NOT NULL
                    AND sessions.created_at >= :sessionStart!
                    AND sessions.created_at <= :sessionEnd!
                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1
                    AND last_message.created_at IS NOT NULL THEN
                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)
                WHEN sessions.volunteer_joined_at IS NOT NULL
                    AND sessions.created_at >= :sessionStart!
                    AND sessions.created_at <= :sessionEnd! THEN
                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)
                ELSE
                    0
                END)::int AS range_session_length_mins,
            count(*)::int AS total_sessions,
            sum(
                CASE WHEN sessions.created_at >= :sessionStart!
                    AND sessions.created_at <= :sessionEnd! THEN
                    1
                ELSE
                    0
                END)::int AS range_total_sessions,
            student_id
        FROM
            sessions
    LEFT JOIN (
        SELECT
            MAX(created_at) AS created_at,
            session_id
        FROM
            session_messages
        GROUP BY
            session_id) AS last_message ON last_message.session_id = sessions.id
    WHERE
        sessions.ended_at IS NOT NULL
    GROUP BY
        sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id
WHERE
    users.created_at >= :joinedStart!
    AND users.created_at <= :joinedEnd!
    AND ((:highSchoolId)::uuid IS NULL
        OR student_profiles.school_id = :highSchoolId)
AND ((:studentPartnerOrg)::text IS NULL
    OR student_partner_orgs.key = :studentPartnerOrg)
AND ((:studentPartnerSite)::text IS NULL
    OR student_partner_org_sites.name = :studentPartnerSite)
AND ((:sponsorOrg)::text IS NULL
    OR ((partner_org_sponsor_org.key IS NOT NULL
            AND partner_org_sponsor_org.key = :sponsorOrg)
        OR (school_sponsor_org.key IS NOT NULL
            AND school_sponsor_org.key = :sponsorOrg)))
ORDER BY
    users.created_at ASC;


/* @name getStudentSignupSources */
SELECT
    id,
    name
FROM
    signup_sources
WHERE
    name <> 'Roster'
ORDER BY
    RANDOM();


/* @name deleteSelfFavoritedVolunteers */
DELETE FROM student_favorite_volunteers
WHERE student_id = volunteer_id;


/* @name updateStudentSchool */
UPDATE
    student_profiles
SET
    school_id = :schoolId!
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name getActivePartnersForStudent */
SELECT
    spo.name,
    spo.id,
    spo.school_id
FROM
    users_student_partner_orgs_instances uspoi
    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
WHERE
    uspoi.user_id = :studentId!
    AND deactivated_on IS NOT NULL;


/* @name getStudentsIdsForGradeLevelSgUpdate */
SELECT
    sp.user_id
FROM
    student_profiles sp
    JOIN current_grade_levels_mview cgl ON cgl.user_id = sp.user_id
ORDER BY
    sp.created_at DESC;


/* @name countDuplicateStudentVolunteerFavorites */
WITH favorites_partition AS (
    SELECT
        student_id,
        volunteer_id,
        updated_at,
        created_at,
        row_number() OVER (PARTITION BY student_id,
            volunteer_id ORDER BY updated_at DESC) AS rn
    FROM
        upchieve.student_favorite_volunteers
)
SELECT
    count(*)::int AS duplicates
FROM
    favorites_partition
WHERE
    rn <> 1;


/* @name deleteDuplicateStudentVolunteerFavorites */
WITH favorites_partition AS (
    SELECT
        student_id,
        volunteer_id,
        updated_at,
        created_at,
        row_number() OVER (PARTITION BY student_id,
            volunteer_id ORDER BY updated_at DESC) AS rn
    FROM
        upchieve.student_favorite_volunteers
),
duplicate_favorites AS (
    SELECT
        student_id,
        volunteer_id,
        updated_at,
        created_at
    FROM
        favorites_partition
    WHERE
        rn <> 1
),
deleted_rows AS (
    DELETE FROM upchieve.student_favorite_volunteers
    WHERE (student_id,
            volunteer_id,
            updated_at,
            created_at) IN (
            SELECT
                *
            FROM
                duplicate_favorites)
        RETURNING
            *
)
SELECT
    COUNT(*)::int AS deleted
FROM
    deleted_rows;


/* @name getStudentProfilesByUserIds 
 @param userIds -> (...)
 */
SELECT
    student_profiles.user_id,
    users.id,
    first_name,
    last_name,
    email,
    COALESCE(cgl.current_grade_name, grade_levels.name) AS grade_level,
    users.created_at,
    users.updated_at,
    school_id
FROM
    student_profiles
    JOIN users ON student_profiles.user_id = users.id
    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
WHERE
    student_profiles.user_id IN :userIds!;


/*
 @name addStudentsToTeacherClass
 */
INSERT INTO student_classes (user_id, class_id)
SELECT
    UNNEST(:studentIds!::uuid[]),
    :classId!
ON CONFLICT
    DO NOTHING;


/* @name getStudentByCleverId */
SELECT
    sp.user_id AS id
FROM
    student_profiles sp
    JOIN federated_credentials fc ON sp.user_id = fc.user_id
WHERE
    issuer LIKE '%clever%'
    AND id = :cleverStudentId!;

