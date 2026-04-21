import { SQL } from "bun";
import type {
  UserModel,
  PasskeyModel,
  RestaurantModel,
  MenuItemModel
} from "./models.ts"

// src: https://bun.com/docs/runtime/sql
const pg = new SQL(
  process.env.POSTGRES_URL || "postgres://lounastutka:changeme@db:5432/lounastutka");

// Helper for translating postgres to typescript format for user
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
    const res = await pg`SELECT * FROM app.users WHERE email=${email}`;

    if (!res || res === undefined) {
      throw new Error("Database query returned no result");
    }
    return res[0] ? mapUser(res[0]) : null;
  },

  async createUser(email: string): Promise<UserModel> {
    const res = await pg` 
			INSERT INTO app.users (email) VALUES (${email}) RETURNING *`;
    if (!res || res === undefined) {
      throw new Error("Database returned no rows");
    }
    return mapUser(res[0]);
  },

  // NOTE: Support for passwords 
  async createUserWithPassword(email: string, passwordHash: string): Promise<UserModel> {
    const res = await pg`
			INSERT INTO app.users (email, password_hash) VALUES (${email}, ${passwordHash}) RETURNING *`;
    if (!res || res === undefined) {
      throw new Error("Database returned no rows");
    }
    return mapUser(res[0]);
  },

  async updateUserPassword(userId: number, passwordHash: string): Promise<void> {
    await pg`
			UPDATE app.users SET password_hash = ${passwordHash} WHERE id = ${userId}
		`;
  },

  // NOTE: the challenge is the relevant data to be stored for authentication
  async storeChallenge(userId: number, challenge: string): Promise<void> {
    await pg`
			INSERT INTO app.auth_challenges(challenge, fk_uid)
			VALUES(${challenge}, ${userId})
			ON CONFLICT(challenge) DO UPDATE SET fk_uid = EXCLUDED.fk_uid, created_at = NOW()
			`;
  },

  async removeChallenge(userId: number, challenge: string): Promise<boolean> {
    const res = await pg`
			DELETE FROM app.auth_challenges
			WHERE challenge = ${challenge}
			AND fk_uid = ${userId}
		`;
    // Can check that remove was success or failure in caller
    // if no deletes were made, should return false as zero rows DELETE'd
    if (!res || res === undefined) return false;
    return (res.count > 0);
  },

  async getChallenge(userId: number) {
    const res = await pg`
			SELECT challenge FROM app.auth_challenges WHERE fk_uid = ${userId}`;
    if (!res || res === undefined || !Array.isArray(res)) {
      throw new Error("Database result was undefined");
    }
    if (res.length === 0) return undefined;
    // Kind of assume only one result with specific ID (which should be viable)
    return res[0].challenge;
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

    await pg`
            INSERT INTO app.passkeys(
				id,
				public_key,
				fk_uid,
				counter,
				device_type,
				backed_up,
				transports
			)
		VALUES(
			${credentialId},
			${publicKey}, 
			${userId}, 
			${counter}, 
			${deviceType}, 
			${backedUp}, 
			${(transports ?? []).join(",")})
			`;
  },

  async getPasskeys(userId: number): Promise<PasskeyModel[]> {
    const res = await pg`
			SELECT * FROM app.passkeys WHERE fk_uid = ${userId}`;
    if (!res || res === undefined) throw new Error("Database result was undefined");
    // Give all viable 
    return res.map((row: any) => ({
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
    await pg`
			UPDATE app.passkeys SET counter = ${counter} WHERE id = ${pkId} `;
  },

  // Get restaurant info based on ID
  async getRestaurantById(restId: number): Promise<RestaurantModel | null> {
    const res = await pg`
      SELECT * FROM app.restaurants WHERE id = ${restId}`;
    return res.length > 0 ? res[0] : null;
  },
  // Get restaurant info based on name
  async getRestaurantByName(restName: string): Promise<RestaurantModel | null> {
    const res = await pg`
      SELECT * FROM app.restaurants WHERE name = ${restName}`;
    return res.length > 0 ? res[0] : null;
  },

  // Adds restaurant information to the table 
  async addRestaurantData(data: RestaurantModel): Promise<number> {
    // As the typescript model defines lot of properties as "could be", be explicit for postgres
    const restaurantRes = await pg`
			INSERT INTO app.restaurants 
			(name, address, lat, lon, category, description, phone, website, price_level, stars, reviews)
			VALUES (
				${data.name},
				${data.address ?? null},
				${data.lat ?? null},
				${data.lon ?? null},
				${data.category ?? null},
				${data.description ?? null},
				${data.phone ?? null},
				${data.website ?? null},
				${data.priceLevel ?? null},
				${data.stars ?? null},
				${data.reviews ?? null}
			)
			RETURNING id
		`;

    if (!restaurantRes) throw new Error("Database addition failed");

    return restaurantRes[0].id;
  },
  async removeRestaurant(restId: number): Promise<number | null> {
    const res = await pg`DELETE FROM app.restaurants WHERE id = ${restId}`;
    return res.length > 0 ? res[0].id : null;
  },

  // NOTE: Verifying the restId is on the hands of caller. 
  async addMenuToRestaurant(restId: number, todayMenuItemNames: string[]): Promise<number> {
    if (!(todayMenuItemNames.length > 0)) throw new Error("Empty menu given.");

    const menuRes = await pg`
			INSERT INTO app.menus (fk_restaurant)
			VALUES (${restId})
			RETURNING id
		`;

    if (!menuRes) throw new Error("Failed to insert menu");

    const menuId = menuRes[0].id;
    for (const item of todayMenuItemNames) {
      await pg`
					INSERT INTO app.menu_items (fk_menu, name)
					VALUES (${menuId}, ${item})
				`;
    }

    return menuId;
  },

  async getRestaurantMenu(restId: number): Promise<MenuItemModel[] | null> {
    const res = await pg`
      SELECT menuitem.* FROM app.menu_items menuitem
      JOIN app.menus m ON menuitem.fk_menu = m.id 
      WHERE m.fk_restaurant = ${restId}
      ORDER BY menuitem.id
      `;
    // We don't want to throw, because most restaurants might not have menu currently
    if (!res || res.length === 0) return null;

    return res.map((menuitem: any) => ({
      id: menuitem.id,
      menuId: menuitem.fk_menu,
      name: menuitem.name
    }));
  },
}
