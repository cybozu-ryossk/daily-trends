const TOKEN_KEY = 'daily-trends-admin-token';

export function getStoredToken(): string {
	try {
		return localStorage.getItem(TOKEN_KEY) ?? '';
	} catch {
		return '';
	}
}

export function setStoredToken(token: string) {
	try {
		localStorage.setItem(TOKEN_KEY, token);
	} catch {
		// localStorage unavailable (private browsing etc.) — silently ignore
	}
}

export function clearStoredToken() {
	try {
		localStorage.removeItem(TOKEN_KEY);
	} catch {
		// ignore
	}
}
