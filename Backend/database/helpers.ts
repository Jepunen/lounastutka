// TODO: Ensure integration with the PostGreatSQL
import { Pool } from "pg";
import type { UserModel, PasskeyModel } from "./models.ts"

// NOTE:    Now, the database schematic is a bit miss currently but it shouldn't be hard to accomodate the 
// 			implementation once the database connection is actually working so for now we assume that user
// 			has their current_challenge stored to their "users" table row for authentication verification.

// src: https://dev.to/yugjadvani/advanced-integration-connecting-postgresql-with-nodejs-in-a-typescript-ecosystem-3nnh

const pool = new Pool({
	// connectionString: process.env.DATABASE_URL,
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: Number(process.env.DB_PORT),
});

export default {
	async getUserByEmail(email: string): Promise<UserModel> {
		const res = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
		return res.rows[0];
	},

	async createUser(email: string): Promise<UserModel> {
		const res = await pool.query(
			"INSERT INTO users (email) VALUES ($1) RETURNING *",
			[email]
		);
		return res.rows[0];
	},

	// NOTE: the challenge is the relevant data to be stored for authentication
	async storeChallenge(userId: number, challenge: string): Promise<void> {
		await pool.query(
			"UPDATE users SET current_challenge=$1 WHERE id=$2",
			[challenge, userId]
		);
	},

	async getChallenge(userId: number) {
		const res = await pool.query(
			"SELECT current_challenge FROM users WHERE id=$1",
			[userId]
		);
		// Kind of assume only one result with specific ID (which should be viable)
		return res.rows[0].current_challenge;
	},
	async storePasskey(passkey: {
		userId: number;
		credentialId: string; // Base64URL
		publicKey: Uint8Array;
		counter: number;
		// webauthnUserID: string; // NOTE: Not stored as we do not support passwordless authentication
		deviceType: string;
		backedUp: boolean;
		transports?: string[];
	}): Promise<void> {
		const {
			userId,
			credentialId,
			publicKey,
			counter,
			// webauthnUserID, // NOTE: passwordless not supported 
			deviceType,
			backedUp,
			transports,
		} = passkey;

		await pool.query(
			`
            INSERT INTO passkeys (
                id,
                public_key,
                user_id,
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
	// WARNING: Explosion at this point?
	// async storePasskey(userId: number, credentialId: unknown, publicKey: Uint8Array, counter: number) {
	// 	await pool.query(
	// 		`INSERT INTO passkeys (user_id, credential_id, public_key, counter)
	//       VALUES ($1, $2, $3, $4)`,
	// 		[userId, credentialId, publicKey, counter]
	// 	);
	// },
	//
	// WARNING: Or perhaps here? 
	// I wonder whether we should allow multiple passkeys for a single user...
	async getPasskeys(userId: number): Promise<PasskeyModel[]> {
		const res = await pool.query(
			"SELECT * FROM passkeys WHERE user_id=$1",
			[userId]
		);
		// Give all viable 
		return res.rows.map((row) => ({
			id: row.id,
			publicKey: new Uint8Array(row.public_key),
			user: { id: row.user_id } as UserModel,
			// webauthnUserID: row.webauthn_user_id, // NOTE: not supported
			counter: Number(row.counter),
			deviceType: row.device_type,
			backedUp: row.backed_up,
			// return the split CSV list not really currently used but for future
			transports: row.transports ? row.transports.split(",") : [],
		}));
	},

	async updateCounter(pkId: string, counter: number): Promise<void> {
		await pool.query(
			"UPDATE passkeys SET counter=$1 WHERE id=$2",
			[counter, pkId]
		);
	},
};

