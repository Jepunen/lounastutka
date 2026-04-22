import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { postJSON } from "./api";

// Considering the amount of UI logic and business logic with the registration / login, 
// 		I think this is the wisest direction
// Src: https://stackoverflow.com/questions/69332889/reactjs-separation-of-ui-and-business-logic

type RegistrationOptions = {
	verified?: boolean;
	error?: string;
};

type AuthenticationResult = {
	verified?: boolean;
	error?: string;
	token?: string;

};

// The basic process for creating a passkey and registration and login functionality.
// I think I have it here...
// SRC: https://simplewebauthn.dev/docs/packages/browser
// **Includes also the conditional which could be integrated.
export async function registerWebauthnPasskey(email: string) {
	// First, we need to get the registration options from the backend service:
	const options = await postJSON<any>("/auth/create-registration-options", { email, });

	// We can then pass them to the browsers simplewebauthn internal logic handler
	const attestationResponse = await startRegistration({ optionsJSON: options });

	// After that is done, we can send the attestation result back to backend for verification:
	return postJSON<RegistrationOptions>("/auth/finish-registration", { email, attestationResponse });
}

export async function loginWebauthnPasskey(email: string) {
	// First, we need to get the authenticaiton options from the backend service, similar to registration:
	const options = await postJSON<any>("/auth/create-authentication-options", { email, });

	// We can then pass them to the browsers simplewebauthn internal logic handler 
	const assertionResponse = await startAuthentication({ optionsJSON: options });

	// After that is done, we can send the attestation result back to backend for verification:
	return postJSON<AuthenticationResult>("/auth/finish-authentication", { email, assertionResponse });
}

// TODO: Conditional authentication ???

