// NOTE: Ment to be common utils, but mainly for the authentication process. 
// 			The idea is to have the repeating parts here so the logic could stay 
// 			easier to read.

// Format for the error cases from backend API calls, these should be shown to the user in some form:
export type APIErrorPayload = {
	error?: string;
	message?: string;
};

// Easier to be consistent with the token name, no other point really
export function storeJWTToken(token: string) {
	localStorage.setItem("jwt", token);
}

export function getStoredJWTToken() {
	return localStorage.getItem("jwt");
}

export function clearJWTToken() {
	localStorage.removeItem("jwt");
}

export function getJWTEmail(): string | null {
	const token = getStoredJWTToken();
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
		return payload.email ?? null;
	} catch {
		return null;
	}
}

// GET method helper
export async function getJSON<T>(path: string): Promise<T> {
	return requestJSON<T>(`/api${path}`, {
		method: "GET",
	});
}

// POST method helper
export async function postJSON<T>(path: string, body: unknown): Promise<T> {
	return requestJSON(`/api${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
}

// Internal wrapper to add the session token for post request if it exists and handle generic errors
// 	thats the idea at least.
async function requestJSON<T>(
	path: string,
	init: RequestInit,
): Promise<T> {
	// Form the headers for a request with the session token for authenticated routes:
	const headers = new Headers(init.headers);
	const token = getStoredJWTToken();
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}
	const response = await fetch(`${path}`, {
		...init,
		headers,
	});
	// If the token is expired, clear from local.
	if (response.status === 401) { clearJWTToken(); }
	// Since we have theoretically the error msg in case of failure during fetch / api call,
	//   we can and should check its existence and hopefully somewhere show it to user.
	const data = (await response.json().catch(() => null)) as T | APIErrorPayload | null;
	if (!response.ok) {
		const error =
			(data as APIErrorPayload)?.error ??
			(data as APIErrorPayload)?.message ??
			`Request failed with status: ${response.status}`;
		throw new Error(error);
	}

	if (!data) {
		throw new Error("No data received.");
	}
	return data as T;
}

