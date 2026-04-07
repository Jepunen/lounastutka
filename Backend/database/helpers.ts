// TODO: Ensure integration with the PostGreatSQL
import { Pool } from "pg";
import type { UserModel, PasskeyModel } from "./models.ts"

// src: https://dev.to/yugjadvani/advanced-integration-connecting-postgresql-with-nodejs-in-a-typescript-ecosystem-3nnh

const pool = new Pool({
	// connectionString: process.env.DATABASE_URL,
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: process.env.POSTGRES_DB,
	password: process.env.POSTGRES_PASSWORD,
	port: Number(process.env.POSTGRES_PORT || "5432"),
});

// Helper for  the 
function mapUser(row: Record<string, unknown>): UserModel {
	return {
		id: row.id,
		email: String(row.email),
		// To be or not to be...
		passwordHash: (row.password_hash as string | null | undefined) ?? null,
		creationDate: row.creation_date as Date,
	};
}

export default {
	async getUserByEmail(email: string): Promise<UserModel | null> {
		const res = await pool.query("SELECT * FROM app.users WHERE email=$1", [email]);
		return res.rows[0] ? mapUser(res.rows[0]) : null;
	},

	async createUser(email: string): Promise<UserModel> {
		const res = await pool.query(
			"INSERT INTO app.users (email) VALUES ($1) RETURNING *",
			[email]
		);
		return mapUser(res.rows[0]);
	},

	// NOTE: Support for passwords 
	async createUserWithPassword(email: string, passwordHash: string): Promise<UserModel> {
		const res = await pool.query(
			"INSERT INTO app.users (email, password_hash) VALUES ($1, $2) RETURNING *",
			[email, passwordHash],
		);
		return mapUser(res.rows[0]);
	},

	async updateUserPassword(userId: number, passwordHash: string): Promise<void> {
		await pool.query(
			"UPDATE app.users SET password_hash=$1 WHERE id=$2",
			[passwordHash, userId],
		);
	},

	// NOTE: the challenge is the relevant data to be stored for authentication
	async storeChallenge(userId: number, challenge: string): Promise<void> {
		await pool.query(
			`
			INSERT INTO app.auth_challenges (challenge, fk_uid)
			VALUES ($1, $2)
			ON CONFLICT  (challenge) DO UPDATE SET fk_uid = EXCLUDED.fk_uid, created_at = NOW()
			`,
			[challenge, userId]
		);
	},

	async removeChallenge(userId: number, challenge: string): Promise<boolean> {
		const res = await pool.query(
			`
			DELETE FROM app.auth_challenges
			WHERE challenge = $1
			AND ($2::INTEGER IS NULL OR fk_uid = $2 OR fk_uid IS NULL)
			`,
			[challenge, userId],
		);
		// Can check that remove was success or failure in caller
		// if no deletes were made, should return false as zero rows DELETE'd
		if (res.rowCount == null) return false;
		return (res.rowCount > 0);
	},

	async getChallenge(userId: number) {
		const res = await pool.query(
			"SELECT challenge FROM auth_challenges WHERE fk_uid=$1",
			[userId]
		);
		// Kind of assume only one result with specific ID (which should be viable)
		return res.rows[0].challenge;
	},

	async storePasskey(passkey: {
		userId: number;
		credentialId: string; // Base64URL
		publicKey: Uint8Array;
		counter: number;
		deviceType: string;
		backedUp: boolean;
		transports?: string[];
	}): Promise<void> {
		const {
			userId,
			credentialId,
			publicKey,
			counter,
			deviceType,
			backedUp,
			transports,
		} = passkey;

		await pool.query(
			`
            INSERT INTO app.passkeys (
                id,
                public_key,
                fk_uid,
                counter,
                device_type,
                backed_up,
                transports
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
			[
				credentialId,
				publicKey,
				userId,
				counter,
				deviceType,
				backedUp,
				// Store csv for potential future use
				transports ? transports.join(",") : null,
			]
		);
	},

	async getPasskeys(userId: number): Promise<PasskeyModel[]> {
		const res = await pool.query(
			"SELECT * FROM app.passkeys WHERE fk_uid=$1",
			[userId]
		);
		// Give all viable 
		return res.rows.map((row) => ({
			id: row.id,
			publicKey: new Uint8Array(row.public_key),
			user: { id: row.user_id } as UserModel,
			counter: Number(row.counter),
			deviceType: row.device_type,
			backedUp: row.backed_up,
			// return the split CSV list not really currently used but for future
			transports: row.transports ? row.transports.split(",") : [],
		}));
	},

	async updateCounter(pkId: string, counter: number): Promise<void> {
		await pool.query(
			"UPDATE app.passkeys SET counter=$1 WHERE id=$2",
			[counter, pkId]
		);
	},
};

