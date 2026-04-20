// NOTE: Helps typing the request and response objects
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
} from "@simplewebauthn/server";


export type FinishRegistrationResponse = VerifiedRegistrationResponse & {
  token?: string;
};

export type FinishAuthenticationResponse = VerifiedAuthenticationResponse & {
  token?: string;
};

export type PasswordAuthenticationResponse = {
  authenticated: boolean;
  token?: string;
  user: {
    email: string;
  };
};

export type BeginRegistrationBody = {
  email: string;
};

export type FinishRegistrationBody = {
  email: string;
  attestationResponse: RegistrationResponseJSON;
};

export type BeginAuthenticationBody = {
  email: string;
};

export type FinishAuthenticationBody = {
  email: string;
  assertionResponse: AuthenticationResponseJSON;
};

export type PasswordLoginBody = {
  email: string;
  password: string;
};

