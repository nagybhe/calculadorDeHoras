const BASE_URL = 'https://runrun.it/api/v1.0';

export interface AuthCredentials {
	appKey: string;
	userToken: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
}

export interface ManualWorkPeriod {
	id: number;
	user_id: string;
	task_id: number;
	seconds: number;
	date_to_apply: string;
	worker_name?: string;
	team_name?: string;
	board_stage_name?: string;
}

async function apiRequest<T>(
	endpoint: string,
	credentials: AuthCredentials,
	options: RequestInit = {}
): Promise<T> {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		headers: {
			'App-Key': credentials.appKey,
			'User-Token': credentials.userToken,
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`API Error: ${response.status} - ${error}`);
	}

	return response.json();
}

export async function getCurrentUser(credentials: AuthCredentials): Promise<User> {
	return apiRequest<User>('/users/me', credentials);
}

export async function getManualWorkPeriods(
	credentials: AuthCredentials,
	params: {
		start_date?: string;
		end_date?: string;
		user_id?: string;
		limit?: number;
		page?: number;
	} = {}
): Promise<ManualWorkPeriod[]> {
	const searchParams = new URLSearchParams();

	if (params.start_date) searchParams.append('start_date', params.start_date);
	if (params.end_date) searchParams.append('end_date', params.end_date);
	if (params.user_id) searchParams.append('user_id', params.user_id);
	if (params.limit) searchParams.append('limit', params.limit.toString());
	if (params.page) searchParams.append('page', params.page.toString());

	const query = searchParams.toString();
	const endpoint = `/manual_work_periods${query ? `?${query}` : ''}`;
	return apiRequest<ManualWorkPeriod[]>(endpoint, credentials);
}

export async function validateCredentials(credentials: AuthCredentials): Promise<boolean> {
	try {
		await getCurrentUser(credentials);
		return true;
	} catch {
		return false;
	}
}

export function formatSecondsToHours(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${hours}h ${minutes}m`;
}
