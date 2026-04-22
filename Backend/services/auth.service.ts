import type { PasskeyModel } from "../database/models";

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

import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  GenerateRegistrationOptionsOpts,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/server";

// Global error class
import { AppError } from "../utils/error.ts";

import db from "../database/helpers";

// NOTE: backup authentication method in case passkeys do not work
export async function registerPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!(normalizedEmail.length > 0)) {
    throw new AppError("Email is too short, provide valid email.", 400);
  }
  const user = await db.getUserByEmail(normalizedEmail);

  if (!user) {
    const passwordHash = await Bun.password.hash(password);
    return await db.createUserWithPassword(normalizedEmail, passwordHash);
  }

  const existingPasskeys = await db.getPasskeys(user.id);
  if (existingPasskeys.length > 0 || user.passwordHash) {
    throw new AppError("Account already exists. Use login instead.", 409);
  }

  const passwordHash = await Bun.password.hash(password);
  await db.updateUserPassword(user.id, passwordHash);
  // Update the reference
  return await db.getUserByEmail(user.email);
}

export async function loginPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.getUserByEmail(normalizedEmail);
  if (!user?.passwordHash) {
    throw new AppError("Invalid email or password.", 401);
  }

  const verified = await Bun.password.verify(password, user.passwordHash);
  if (!verified) {
    throw new AppError("Invalid email or password.", 401);
  }

  return user;
}

// Used for the authentication for controller, its not best but should suffice for error logging.
export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return await db.getUserByEmail(normalizedEmail);
}

// src: https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
export async function createRegistrationOptions(
  email: string, rpID: string, rpName: string
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const normalizedEmail = email.trim().toLowerCase();
  let user = await db.getUserByEmail(normalizedEmail);

  if (!user) {
    user = await db.createUser(normalizedEmail);
  }

  const user_pks: PasskeyModel[] = await db.getPasskeys(user.id);

  // At this point, support only one passkey, for future multiple should be included
  if (user_pks.length > 0) {
    throw new AppError("Account already exists. Use login instead.", 409);
  }

  // Generates the options that can register the user through mobile passkeys
  // Also makes the challenge that the user needs to solve
  const generateOptions: GenerateRegistrationOptionsOpts = {
    rpName: rpName,
    rpID: rpID,
    userName: user.email,
    userDisplayName: user.email,
    attestationType: "none",
    timeout: 60000,
    excludeCredentials: user_pks.map((pk: PasskeyModel) => ({
      id: pk.id,
      type: "public-key",
      transports: pk.transports,
    })),
    authenticatorSelection: {
      residentKey: "discouraged",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257],
  };

  const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions(generateOptions);
  if (!options) throw new AppError("Could not create account.", 400);
  await db.storeChallenge(user.id, (options).challenge);

  return options;
}


export async function verifyRegistration(
  email: string,
  attestationResponse: RegistrationResponseJSON,
  expectedOrigin: string,
  expectedRPID: string):
  Promise<VerifiedRegistrationResponse> {

  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.getUserByEmail(normalizedEmail);

  if (!user) throw new AppError("Invalid authentication request", 400);

  const existingPasskeys = await db.getPasskeys(user.id);

  if (existingPasskeys.length > 0) {
    throw new AppError("Account already exists. Use login instead.", 409);
  }

  // Current challenge for the req user, could be a express-session object instead of row in db
  const expectedChallenge = await db.getChallenge(user.id);
  if (!expectedChallenge) throw new AppError("Challenge was invalid", 400);

  const verifyOptions: VerifyRegistrationResponseOpts = {
    response: attestationResponse,
    expectedChallenge,
    expectedOrigin,
    expectedRPID,
    requireUserVerification: true,
  };

  // Check if the user solved challenge correctly
  const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse(verifyOptions);

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
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.transports,
    });
    // NOTE: unlike authentication (login) we do not want to update counter in registration.

    // Remove the challenge once we can determine that the user successfully completed it.
    await db.removeChallenge(user.id, expectedChallenge);
  }

  return verification;
}

export async function createAuthenticationOptions(
  email: string, rpID: string
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.getUserByEmail(normalizedEmail);

  if (!user) throw new AppError("Invalid authentication request", 400);

  const passkeys = await db.getPasskeys(user.id);

  const authenticationOptions: GenerateAuthenticationOptionsOpts = {
    rpID,
    userVerification: "preferred",
    allowCredentials: passkeys.map((pk) => ({
      id: pk.id,
      type: "public-key",
      transports: pk.transports,
    })),
  };
  const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions(authenticationOptions);

  if (!options) throw new AppError("Could not verify account.", 400);

  const challenge = (options).challenge;
  await db.storeChallenge(user.id, challenge);

  return options;
}


export async function verifyAuthentication(
  email: string,
  assertionResponse: AuthenticationResponseJSON,
  expectedOrigin: string,
  expectedRPID: string,
): Promise<VerifiedAuthenticationResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.getUserByEmail(normalizedEmail);
  if (!user) throw new AppError("Unknown user", 400);

  const expectedChallenge = await db.getChallenge(user.id);
  if (!expectedChallenge) throw new AppError("Unknown challenge", 401);

  // NOTE: Probably should use only one or allow only one or properly support multiplpe
  const passkeys = await db.getPasskeys(user.id);
  const credId = assertionResponse.id;
  const validCred = passkeys.find(pk => pk.id === credId);
  if (!validCred) throw new AppError("Unknown credential.", 401);

  const verifyOptions: VerifyAuthenticationResponseOpts = {
    response: assertionResponse,
    expectedChallenge,
    expectedOrigin,
    expectedRPID,
    credential: {
      id: validCred.id,
      publicKey: new Uint8Array(validCred.publicKey),
      counter: validCred.counter,
      transports: validCred.transports,
    },
    requireUserVerification: true,
  };

  const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse(verifyOptions);

  if (verification.verified) {
    // For authentication (login) we should update the counter
    await db.updateCounter(validCred.id, verification.authenticationInfo.newCounter);
    // Also remove the current used challenge
    await db.removeChallenge(user.id, expectedChallenge);
  }

  return verification;
}

