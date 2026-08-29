const API_BASE = 'https://daily-trends-interests-api.gooodev.workers.dev';

export type Tier = 'core' | 'rising' | 'watching' | 'suppressed';

export type InterestFlag = {
	id: number;
	label: string;
	tier: Tier;
	notes: string;
	updated_at: string;
};

export type Source = {
	id: number;
	group_name: string;
	source_type: string;
	url: string;
	label: string;
	enabled: number;
	notes: string;
	updated_at: string;
};

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${token}`,
			...(init.headers || {})
		}
	});
	if (res.status === 204) return undefined as T;
	const body = await res.json().catch(() => null);
	if (!res.ok) {
		throw new ApiError(res.status, body?.error ?? `HTTP ${res.status}`);
	}
	return body as T;
}

export function fetchAdminData(token: string) {
	return request<{ flags: InterestFlag[]; sources: Source[] }>('/admin', token);
}

export function createFlag(token: string, data: { label: string; tier: Tier; notes?: string }) {
	return request<InterestFlag>('/admin/flags', token, {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export function updateFlag(
	token: string,
	id: number,
	data: Partial<Pick<InterestFlag, 'label' | 'tier' | 'notes'>>
) {
	return request<InterestFlag>(`/admin/flags/${id}`, token, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
}

export function deleteFlag(token: string, id: number) {
	return request<void>(`/admin/flags/${id}`, token, { method: 'DELETE' });
}

export function createSource(
	token: string,
	data: {
		group_name: string;
		source_type: string;
		url: string;
		label?: string;
		enabled?: boolean;
		notes?: string;
	}
) {
	return request<Source>('/admin/sources', token, {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export function updateSource(
	token: string,
	id: number,
	data: Partial<{
		group_name: string;
		source_type: string;
		url: string;
		label: string;
		enabled: boolean;
		notes: string;
	}>
) {
	return request<Source>(`/admin/sources/${id}`, token, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
}

export function deleteSource(token: string, id: number) {
	return request<void>(`/admin/sources/${id}`, token, { method: 'DELETE' });
}
