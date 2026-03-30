// WARNING: Development stuff, production is a bit different
const rpName = "Lounastutka";
const rpID = "localhost";
const origin = `https://${rpID}`;

import type {
	AuthenticatorTransportFuture,
	CredentialDeviceType,
	Base64URLString,
} from '@simplewebauthn/server';
import type { UserModel, PasskeyModel } from "../database/models";

// NOTE: Documentation used to make these services:
// src: https://simplewebauthn.dev/docs/packages/server
// src: https://simplewebauthn.dev/docs/advanced/example-project
// src: https://github.com/MasterKale/SimpleWebAuthn/tree/master/example

// NOTE: If multiple origin support is required, 
// 	would probably need to send some expectedorigin between client and server:
// src: https://simplewebauthn.dev/docs/packages/server#2-verify-authentication-response 
// 					Note at "SUPPORT FOR MULTIPLE ORIGINS AND RP IDS"

import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from "@simplewebauthn/server";

// import db from "../database/helpers";
// WARNING: In memory mock db
import db from "../testdb/helpers"

// src: https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
export async function createRegistrationOptions(email: string) {
	let user = await db.getUserByEmail(email);
	if (!user) user = await db.createUser(email);

	// Generates the options that can register the user through mobile passkeys
	// Also makes the challenge that the user needs to solve
	const options = generateRegistrationOptions({
		rpName,
		rpID,
		userID: new Uint8Array(user.id),
		userName: user.email,
		attestationType: "none",
	});

	// 								  Dunno, LSP said so
	await db.storeChallenge(user.id, (await options).challenge);

	return options;
}

export async function verifyRegistration(email: string, attestationResponse: any) {
	const user: UserModel = await db.getUserByEmail(email);
	if (!user) return null;

	const expectedChallenge = await db.getChallenge(user.id);

	// Check if the user solved challenge correctly
	const verification = await verifyRegistrationResponse({
		response: attestationResponse,
		expectedChallenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
	});

	const { verified, registrationInfo } = verification;

	// If the challenge was successfully completed, 
	//  we can go ahead and store the credential for the user
	// src: https://simplewebauthn.dev/docs/packages/server#3-post-registration-responsibilities
	if (verified && registrationInfo) {
		const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

		await db.storePasskey({
			userId: user.id,
			credentialId: credential.id,
			publicKey: credential.publicKey,
			counter: credential.counter,
			// webauthnUserID: credential.userHandle,
			deviceType: credentialDeviceType,
			backedUp: credentialBackedUp,
			transports: credential.transports,
		});
	}

	return verification;
}

export async function createAuthenticationOptions(email: string) {
	const user = await db.getUserByEmail(email);
	if (!user) return null;
	const passkeys = await db.getPasskeys(user.id);

	const options = generateAuthenticationOptions({
		rpID,
		userVerification: "preferred",
		allowCredentials: passkeys.map((pk) => ({
			id: pk.id,
			transports: pk.transports,
		})),
	});

	const challenge = (await options).challenge;
	// NOTE: Ideally we would store the full options as json object
	await db.storeChallenge(user.id, challenge);

	return options;
}

export async function verifyAuthentication(email: string, assertionResponse: any) {
	const user = await db.getUserByEmail(email);
	if (!user) return null;

	const expectedChallenge = await db.getChallenge(user.id);

	// NOTE: Probably should use only one or allow only one or properly support multiplpe
	const passkeys = await db.getPasskeys(user.id);
	const credId = assertionResponse.id;
	const validCred = passkeys.find(pk => pk.id === credId);
	if (!validCred) return { verified: false, error: "Unknown credential" };

	const verification = await verifyAuthenticationResponse({
		response: assertionResponse,
		expectedChallenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
		credential: {
			id: validCred.id,
			publicKey: new Uint8Array(validCred.publicKey),
			counter: validCred.counter,
			transports: validCred.transports,
		},
	});

	if (verification.verified) {
		await db.updateCounter(validCred.id, verification.authenticationInfo.newCounter);
	}

	return verification;
}

