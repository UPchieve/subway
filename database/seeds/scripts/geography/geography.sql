/* @name insertUsState */
INSERT INTO us_states (name, code, created_at, updated_at) VALUES (:name!, :code!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok;

/* @name insertZipCode */
INSERT INTO postal_codes (code, us_state_code, income, location, created_at, updated_at) VALUES (:code!, :usStateCode!, :income!, POINT(:lattitude!, :longitude!), NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING code AS ok;