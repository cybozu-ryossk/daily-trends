const CORS_HEADERS = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
	"access-control-allow-headers": "Content-Type, Authorization",
};

const TIERS = ["core", "rising", "watching", "suppressed"];

function json(data, init = {}) {
	return new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			"content-type": "application/json; charset=utf-8",
			...CORS_HEADERS,
			...(init.headers || {}),
		},
	});
}

function isAuthorized(request, env) {
	const auth = request.headers.get("authorization") || "";
	const match = auth.match(/^Bearer\s+(.+)$/i);
	return !!match && !!env.ADMIN_TOKEN && match[1] === env.ADMIN_TOKEN;
}

async function readJson(request) {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname.replace(/\/+$/, "") || "/";
		const method = request.method;

		if (method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		// Public read: enabled sources only, all flags. Used by the `collect` skill.
		if (method === "GET" && (path === "/" || path === "/interests")) {
			const [flags, sources] = await Promise.all([
				env.DB.prepare(
					"SELECT label, tier, notes, updated_at FROM interest_flags ORDER BY tier, id"
				).all(),
				env.DB.prepare(
					"SELECT group_name, source_type, url, label, enabled, notes, updated_at FROM sources WHERE enabled = 1 ORDER BY group_name, id"
				).all(),
			]);
			return json({ flags: flags.results, sources: sources.results });
		}

		// Admin read: everything, including disabled sources and row ids. Used by the admin UI.
		if (method === "GET" && path === "/admin") {
			if (!isAuthorized(request, env)) return json({ error: "unauthorized" }, { status: 401 });
			const [flags, sources] = await Promise.all([
				env.DB.prepare(
					"SELECT id, label, tier, notes, updated_at FROM interest_flags ORDER BY tier, id"
				).all(),
				env.DB.prepare(
					"SELECT id, group_name, source_type, url, label, enabled, notes, updated_at FROM sources ORDER BY group_name, id"
				).all(),
			]);
			return json({ flags: flags.results, sources: sources.results });
		}

		// --- interest_flags CRUD ---
		const flagMatch = path.match(/^\/admin\/flags(?:\/(\d+))?$/);
		if (flagMatch) {
			if (!isAuthorized(request, env)) return json({ error: "unauthorized" }, { status: 401 });
			const id = flagMatch[1] ? Number(flagMatch[1]) : null;

			if (method === "POST" && id === null) {
				const body = await readJson(request);
				if (!body) return json({ error: "invalid JSON body" }, { status: 400 });
				const { label, tier, notes = "" } = body;
				if (!label || !TIERS.includes(tier)) {
					return json({ error: "label and a valid tier (core/rising/watching/suppressed) are required" }, { status: 400 });
				}
				const result = await env.DB.prepare(
					"INSERT INTO interest_flags (label, tier, notes, updated_at) VALUES (?, ?, ?, strftime('%Y-%m-%d','now')) RETURNING *"
				)
					.bind(label, tier, notes)
					.first();
				return json(result, { status: 201 });
			}

			if (method === "PATCH" && id !== null) {
				const body = await readJson(request);
				if (!body) return json({ error: "invalid JSON body" }, { status: 400 });
				const fields = [];
				const values = [];
				if (body.label !== undefined) {
					fields.push("label = ?");
					values.push(body.label);
				}
				if (body.tier !== undefined) {
					if (!TIERS.includes(body.tier)) return json({ error: "invalid tier" }, { status: 400 });
					fields.push("tier = ?");
					values.push(body.tier);
				}
				if (body.notes !== undefined) {
					fields.push("notes = ?");
					values.push(body.notes);
				}
				if (fields.length === 0) return json({ error: "no fields to update" }, { status: 400 });
				fields.push("updated_at = strftime('%Y-%m-%d','now')");
				values.push(id);
				const result = await env.DB.prepare(
					`UPDATE interest_flags SET ${fields.join(", ")} WHERE id = ? RETURNING *`
				)
					.bind(...values)
					.first();
				if (!result) return json({ error: "not found" }, { status: 404 });
				return json(result);
			}

			if (method === "DELETE" && id !== null) {
				await env.DB.prepare("DELETE FROM interest_flags WHERE id = ?").bind(id).run();
				return new Response(null, { status: 204, headers: CORS_HEADERS });
			}
		}

		// Public read: which article URLs on a given day are marked interesting.
		// Anyone can read (harmless), only the token holder can write.
		if (method === "GET" && path === "/marks") {
			const date = url.searchParams.get("date");
			if (!date) return json({ error: "date query param is required" }, { status: 400 });
			const rows = await env.DB.prepare("SELECT url FROM article_marks WHERE date = ?")
				.bind(date)
				.all();
			return json({ urls: rows.results.map((r) => r.url) });
		}

		// --- article marks (per-article "興味あり" star) ---
		if (path === "/admin/marks") {
			if (!isAuthorized(request, env)) return json({ error: "unauthorized" }, { status: 401 });

			if (method === "POST") {
				const body = await readJson(request);
				if (!body) return json({ error: "invalid JSON body" }, { status: 400 });
				const { date, url: articleUrl, title_ja = "" } = body;
				if (!date || !articleUrl) {
					return json({ error: "date and url are required" }, { status: 400 });
				}
				const result = await env.DB.prepare(
					`INSERT INTO article_marks (date, url, title_ja) VALUES (?, ?, ?)
					 ON CONFLICT(date, url) DO UPDATE SET title_ja = excluded.title_ja
					 RETURNING *`
				)
					.bind(date, articleUrl, title_ja)
					.first();
				return json(result, { status: 201 });
			}

			if (method === "DELETE") {
				const date = url.searchParams.get("date");
				const articleUrl = url.searchParams.get("url");
				if (!date || !articleUrl) {
					return json({ error: "date and url query params are required" }, { status: 400 });
				}
				await env.DB.prepare("DELETE FROM article_marks WHERE date = ? AND url = ?")
					.bind(date, articleUrl)
					.run();
				return new Response(null, { status: 204, headers: CORS_HEADERS });
			}
		}

		// --- sources CRUD ---
		const sourceMatch = path.match(/^\/admin\/sources(?:\/(\d+))?$/);
		if (sourceMatch) {
			if (!isAuthorized(request, env)) return json({ error: "unauthorized" }, { status: 401 });
			const id = sourceMatch[1] ? Number(sourceMatch[1]) : null;

			if (method === "POST" && id === null) {
				const body = await readJson(request);
				if (!body) return json({ error: "invalid JSON body" }, { status: 400 });
				const { group_name, source_type, url: sourceUrl, label = "", enabled = 1, notes = "" } = body;
				if (!group_name || !source_type || !sourceUrl) {
					return json({ error: "group_name, source_type, and url are required" }, { status: 400 });
				}
				const result = await env.DB.prepare(
					"INSERT INTO sources (group_name, source_type, url, label, enabled, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%d','now')) RETURNING *"
				)
					.bind(group_name, source_type, sourceUrl, label, enabled ? 1 : 0, notes)
					.first();
				return json(result, { status: 201 });
			}

			if (method === "PATCH" && id !== null) {
				const body = await readJson(request);
				if (!body) return json({ error: "invalid JSON body" }, { status: 400 });
				const fields = [];
				const values = [];
				for (const key of ["group_name", "source_type", "url", "label", "notes"]) {
					if (body[key] !== undefined) {
						fields.push(`${key} = ?`);
						values.push(body[key]);
					}
				}
				if (body.enabled !== undefined) {
					fields.push("enabled = ?");
					values.push(body.enabled ? 1 : 0);
				}
				if (fields.length === 0) return json({ error: "no fields to update" }, { status: 400 });
				fields.push("updated_at = strftime('%Y-%m-%d','now')");
				values.push(id);
				const result = await env.DB.prepare(
					`UPDATE sources SET ${fields.join(", ")} WHERE id = ? RETURNING *`
				)
					.bind(...values)
					.first();
				if (!result) return json({ error: "not found" }, { status: 404 });
				return json(result);
			}

			if (method === "DELETE" && id !== null) {
				await env.DB.prepare("DELETE FROM sources WHERE id = ?").bind(id).run();
				return new Response(null, { status: 204, headers: CORS_HEADERS });
			}
		}

		return json({ error: "Not Found" }, { status: 404 });
	},
};
