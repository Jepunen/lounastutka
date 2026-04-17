/* Create a database schema here */

CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION lounastutka;

/* NOTE: Needs to follow the backend UserModel */
CREATE TABLE IF NOT EXISTS app.users (
	id SERIAL PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT DEFAULT NULL,
	creation_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.passkeys (
	id TEXT PRIMARY KEY,
	public_key BYTEA NOT NULL,
	fk_uid INTEGER NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
	counter BIGINT NOT NULL DEFAULT 0,
	device_type VARCHAR(32),
	backed_up BOOLEAN DEFAULT false,
	/* NOTE: STORE AS CSV for future use */
	transports VARCHAR(255)
);

/* Could be a session / cache information */
CREATE TABLE IF NOT EXISTS app.auth_challenges (
	challenge TEXT PRIMARY KEY,
	fk_uid INTEGER REFERENCES app.users(id) ON DELETE CASCADE,
	created_at TIMESTAMP DEFAULT NOW()
);

