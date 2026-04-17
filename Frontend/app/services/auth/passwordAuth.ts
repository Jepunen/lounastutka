// NOTE: Logic for the password authentication method.
import { postJSON } from "./api";

type PasswordAuthResult = {
	authenticated?: boolean;
	token?: string;
	user?: {
		email: string;
	};
};

// Nothing major going on here, a lot simpler than webauthn passkey but also less secure.
export async function registerWithPassword(email: string, password: string) {
	return postJSON<PasswordAuthResult>("/auth/register-password", { email, password });
}

export async function loginWithPassword(email: string, password: string) {
	return postJSON<PasswordAuthResult>("/auth/login-password", { email, password });
}

