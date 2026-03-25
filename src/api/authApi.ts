const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface AuthUser {
	name: string;
	email: string;
}

export interface AuthResponse {
	token: string | null;
	tokenType: string;
	name: string;
	email: string;
}

interface LoginPayload {
	email: string;
	password: string;
}

interface SignupPayload {
	name: string;
	email: string;
	password: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
	const text = await response.text();
	const data = text ? JSON.parse(text) : {};

	if (!response.ok) {
		const message = data?.error || data?.message || "Request failed";
		throw new Error(message);
	}

	return data as T;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	return parseResponse<AuthResponse>(response);
}

export async function signupApi(payload: SignupPayload): Promise<AuthResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	return parseResponse<AuthResponse>(response);
}

export async function meApi(token: string): Promise<AuthUser> {
	const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await parseResponse<AuthResponse>(response);
	return { name: data.name, email: data.email };
}
