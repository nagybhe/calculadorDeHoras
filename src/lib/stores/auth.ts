import { browser } from '$app/environment';
import type { AuthCredentials, User } from '$lib/api/runrun';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'runrun_auth';

interface AuthState {
	credentials: AuthCredentials | null;
	user: User | null;
	isAuthenticated: boolean;
}

function createAuthStore() {
	const initialState: AuthState = {
		credentials: null,
		user: null,
		isAuthenticated: false
	};

	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				initialState.credentials = parsed.credentials;
				initialState.user = parsed.user;
				initialState.isAuthenticated = true;
			} catch {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}

	const { subscribe, set } = writable<AuthState>(initialState);

	return {
		subscribe,
		login: (credentials: AuthCredentials, user: User) => {
			const newState: AuthState = {
				credentials,
				user,
				isAuthenticated: true
			};

			if (browser) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ credentials, user }));
			}

			set(newState);
		},
		logout: () => {
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}

			set({
				credentials: null,
				user: null,
				isAuthenticated: false
			});
		}
	};
}

export const auth = createAuthStore();
