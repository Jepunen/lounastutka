// Custom hook for the authentication via passwords and passkeys
import { useState, useCallback } from "react";
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { storeJWTToken, clearJWTToken } from "../services/auth/api";
import { registerWithPassword, loginWithPassword } from "../services/auth/passwordAuth";
import { registerWebauthnPasskey, loginWebauthnPasskey } from "../services/auth/webauthn";

// src: https://hhpendleton.medium.com/useauth-265512bbde3c

// Props obj that should be passed between UI logic and the HOOK
type UseAuthReturn = {
	loading: boolean;
	error?: string;
	loginWithPW: (email: string, password: string) => Promise<void>;
	loginWithWebauth: (email: string) => Promise<void>;
	registerWithPW: (email: string, password: string) => Promise<void>;
	registerWithWebauth: (email: string) => Promise<void>;
	logout: () => void;
};

// The custom hook to be called from UI layout logic
export function useAuth(onSuccess?: () => void): UseAuthReturn {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	// Each internal callback logic for the actions, which call the services
	// We define both webauthn related and password related callbacks here
	const loginWithWebauth = useCallback(
		async (email: string) => {
			if (!browserSupportsWebAuthn()) {
				setError("Passkeys not supported by the browser, use password.");
				return;
			}
			setLoading(true);
			setError(undefined);
			try {
				const res = await loginWebauthnPasskey(email);
				const token = (res as any)?.token;
				if (!token) throw new Error("Login failed, no token given.");
				storeJWTToken(token);
				onSuccess?.();
			} catch (err: any) {
				setError(err?.message ?? "Login failed");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[onSuccess],
	);

	const registerWithWebauth = useCallback(
		async (email: string) => {
			if (!browserSupportsWebAuthn()) {
				setError("Passkeys not supported by the browser, use password.");
				return;
			}
			setLoading(true);
			setError(undefined);
			try {
				const res = await registerWebauthnPasskey(email);
				const token = (res as any)?.token;
				if (!token) throw new Error("Register failed, no token given.");
				storeJWTToken(token);
				onSuccess?.();
			} catch (err: any) {
				setError(err?.message ?? "Register failed");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[onSuccess],
	);

	const loginWithPW = useCallback(
		async (email: string, password: string) => {
			setLoading(true);
			setError(undefined);
			try {
				const res = await loginWithPassword(email, password);
				const token = (res as any)?.token;
				if (!token) throw new Error("Login failed, no token given.");
				storeJWTToken(token);
				onSuccess?.();
			} catch (err: any) {
				setError(err?.message ?? "Login failed");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[onSuccess],
	);

	const registerWithPW = useCallback(
		async (email: string, password: string) => {
			setLoading(true);
			setError(undefined);
			try {
				const res = await registerWithPassword(email, password);
				const token = (res as any)?.token;
				if (!token) throw new Error("Register failed, no token given.");
				storeJWTToken(token);
				onSuccess?.();
			} catch (err: any) {
				setError(err?.message ?? "Register failed");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[onSuccess],
	);

	const logout = useCallback(() => {
		clearJWTToken();
	}, []);

	return {
		loading,
		error,
		loginWithPW,
		loginWithWebauth,
		registerWithPW,
		registerWithWebauth,
		logout,
	};
};

