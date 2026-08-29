const API_BASE = 'https://daily-trends-interests-api.gooodev.workers.dev';

export async function fetchMarks(date: string): Promise<Set<string>> {
	try {
		const res = await fetch(`${API_BASE}/marks?date=${encodeURIComponent(date)}`);
		if (!res.ok) return new Set();
		const body = (await res.json().catch(() => null)) as { urls?: string[] } | null;
		return new Set(body?.urls ?? []);
	} catch {
		return new Set();
	}
}

export async function addMark(token: string, date: string, articleUrl: string, titleJa: string) {
	const res = await fetch(`${API_BASE}/admin/marks`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
		body: JSON.stringify({ date, url: articleUrl, title_ja: titleJa })
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function removeMark(token: string, date: string, articleUrl: string) {
	const res = await fetch(
		`${API_BASE}/admin/marks?date=${encodeURIComponent(date)}&url=${encodeURIComponent(articleUrl)}`,
		{ method: 'DELETE', headers: { authorization: `Bearer ${token}` } }
	);
	if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
}
