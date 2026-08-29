export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (url.pathname === "/" || url.pathname === "/interests") {
      const [flags, sources] = await Promise.all([
        env.DB.prepare(
          "SELECT label, tier, notes, updated_at FROM interest_flags ORDER BY tier, id"
        ).all(),
        env.DB.prepare(
          "SELECT group_name, source_type, url, label, enabled, notes, updated_at FROM sources WHERE enabled = 1 ORDER BY group_name, id"
        ).all(),
      ]);

      return new Response(
        JSON.stringify({ flags: flags.results, sources: sources.results }, null, 2),
        {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
