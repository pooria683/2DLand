export async function onRequestPost({ request, env }) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|;\s*)sid=([A-Za-z0-9-]+)/)
  if (m && env.SITE_KV) await env.SITE_KV.delete('sess:' + m[1])
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' })
  headers.append('Set-Cookie', 'sid=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0')
  return new Response(JSON.stringify({ ok: true }), { headers })
}
