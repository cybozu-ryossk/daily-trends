// Authenticated, fully client-rendered page: emit a static shell and let the
// browser fetch/mutate data at runtime instead of prerendering real content.
export const prerender = true;
export const ssr = false;
