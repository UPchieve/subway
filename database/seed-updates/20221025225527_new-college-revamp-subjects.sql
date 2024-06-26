-- migrate:up
UPDATE
    upchieve.topics
SET
    display_name = 'College Advising',
    updated_at = NOW()
WHERE
    upchieve.topics.name = 'college';

INSERT INTO upchieve.subjects (name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at)
SELECT
    new_subjects.name,
    new_subjects.display_name,
    new_subjects.display_priority::int,
    subquery.topic_id,
    subquery.tool_type_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.topics.id AS topic_id,
        upchieve.tool_types.id AS tool_type_id
    FROM
        upchieve.topics
        JOIN upchieve.tool_types ON upchieve.tool_types.name = 'documenteditor'
    WHERE
        upchieve.topics.name = 'college') AS subquery
    JOIN UNNEST(ARRAY[1, 2, 3, 4, 5], ARRAY['collegePrep', 'collegeList', 'collegeApps', 'applicationEssays', 'financialAid'], ARRAY['College Prep', 'College List', 'Applications', 'Application Essays', 'Financial Aid']) AS new_subjects (display_priority,
        name,
        display_name) ON TRUE;

INSERT INTO upchieve.certifications (name, created_at, updated_at)
    VALUES ('collegePrep', NOW(), NOW()), ('collegeList', NOW(), NOW()), ('collegeApps', NOW(), NOW()), ('applicationEssays', NOW(), NOW()), ('financialAid', NOW(), NOW())
ON CONFLICT ON CONSTRAINT certifications_name_key
    DO NOTHING;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'collegePrep'
    WHERE
        upchieve.certifications.name = 'collegePrep') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'collegeList'
    WHERE
        upchieve.certifications.name = 'collegeList') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'collegeApps'
    WHERE
        upchieve.certifications.name = 'collegeApps') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'applicationEssays'
    WHERE
        upchieve.certifications.name = 'applicationEssays') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'financialAid'
    WHERE
        upchieve.certifications.name = 'financialAid') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'collegePrep'
    WHERE
        upchieve.certifications.name = 'collegePrep') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'collegeList'
    WHERE
        upchieve.certifications.name = 'collegeList') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'collegeApps'
    WHERE
        upchieve.certifications.name = 'collegeApps') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'applicationEssays'
    WHERE
        upchieve.certifications.name = 'applicationEssays') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'financialAid'
    WHERE
        upchieve.certifications.name = 'financialAid') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

-- migrate:down
UPDATE
    upchieve.topics
SET
    display_name = 'College Counseling',
    updated_at = NOW()
WHERE
    upchieve.topics.name = 'college';

DELETE FROM upchieve.quiz_certification_grants USING upchieve.quizzes
WHERE upchieve.quizzes.id = upchieve.quiz_certification_grants.quiz_id
    AND upchieve.quizzes.name IN ('collegePrep', 'collegeList', 'collegeApps', 'applicationEssays', 'financialAid');

DELETE FROM upchieve.certification_subject_unlocks USING upchieve.subjects
WHERE upchieve.subjects.id = upchieve.certification_subject_unlocks.subject_id
    AND upchieve.subjects.name IN ('collegePrep', 'collegeList', 'collegeApps', 'applicationEssays', 'financialAid');

DELETE FROM upchieve.certifications
WHERE upchieve.certifications.name IN ('collegePrep', 'collegeList', 'collegeApps', 'applicationEssays', 'financialAid');

DELETE FROM upchieve.subjects
WHERE upchieve.subjects.name IN ('collegePrep', 'collegeList', 'collegeApps', 'applicationEssays', 'financialAid');

