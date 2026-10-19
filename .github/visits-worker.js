const SOURCE = 'https://mapmyvisitors.com/ajax/live_hits?id=2238843&last_hit_id=1&max_hit_id=1';
const KEEP = 40;
const SHARED = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' };

function convert(data) {
  const visits = [];
  for (const hit of data.hits.slice(0, KEEP)) {
    const found = /^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d)$/.exec(hit && hit[6]);
    if (found) {
      visits.push({ t: found[1] + 'T' + found[2] + 'Z', place: typeof hit[2] === 'string' && hit[2].trim() ? hit[2] : null });
    }
  }
  visits.sort((first, second) => (first.t < second.t ? 1 : -1));
  const document = { updated: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), visits };
  if (/^\d+$/.test(String(data.last_hit_id))) {
    document.last = String(data.last_hit_id);
  }
  return document;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET') {
      return new Response(null, { status: 405 });
    }
    const key = new Request(new URL(request.url).origin + '/', { method: 'GET' });
    const cached = await caches.default.match(key);
    if (cached) {
      return cached;
    }
    try {
      const upstream = await fetch(SOURCE, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; visit-log)' } });
      if (!upstream.ok) {
        throw new Error('upstream ' + upstream.status);
      }
      const document = convert(await upstream.json());
      if (!document.visits.length) {
        throw new Error('no visits');
      }
      const response = new Response(JSON.stringify(document), { headers: Object.assign({ 'cache-control': 'public, max-age=20' }, SHARED) });
      ctx.waitUntil(caches.default.put(key, response.clone()));
      return response;
    } catch (error) {
      return new Response('{}', { status: 502, headers: Object.assign({ 'cache-control': 'no-store' }, SHARED) });
    }
  },
};
