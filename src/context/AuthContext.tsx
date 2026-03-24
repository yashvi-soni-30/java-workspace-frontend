import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginApi, meApi, signupApi, type AuthUser } from "@/api/authApi";

const TOKEN_KEY = "cjw-token";
const USER_KEY = "cjw-user";

interface AuthContextType {
	user: AuthUser | null;
	token: string | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistSession(token: string, user: AuthUser) {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem(TOKEN_KEY);
		const storedUser = localStorage.getItem(USER_KEY);

		if (!storedToken || !storedUser) {
			setLoading(false);
			return;
		}

		let parsedUser: AuthUser | null = null;
		try {
			parsedUser = JSON.parse(storedUser) as AuthUser;
		} catch {
			clearSession();
			setLoading(false);
			return;
		}

		setToken(storedToken);
		setUser(parsedUser);

		meApi(storedToken)
			.then((profile) => {
				setUser(profile);
				localStorage.setItem(USER_KEY, JSON.stringify(profile));
			})
			.catch(() => {
				clearSession();
				setUser(null);
				setToken(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const login = async (email: string, password: string) => {
		const response = await loginApi({ email, password });
		const resolvedUser = { name: response.name, email: response.email };
		if (!response.token) {
			throw new Error("Invalid auth response");
		}
		setToken(response.token);
		setUser(resolvedUser);
		persistSession(response.token, resolvedUser);
	};

	const signup = async (name: string, email: string, password: string) => {
		const response = await signupApi({ name, email, password });
		const resolvedUser = { name: response.name, email: response.email };
		if (!response.token) {
			throw new Error("Invalid auth response");
		}
		setToken(response.token);
		setUser(resolvedUser);
		persistSession(response.token, resolvedUser);
	};

	const logout = () => {
		clearSession();
		setToken(null);
		setUser(null);
	};

	const value = useMemo<AuthContextType>(
		() => ({
			user,
			token,
			loading,
			isAuthenticated: Boolean(user && token),
			login,
			signup,
			logout,
		}),
		[user, token, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within AuthProvider");
	}
	return context;
};
