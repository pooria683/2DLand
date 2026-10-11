// سایت از این می‌پرسد: کاربر وارد شده یا نه؟
export async function onRequestGet({ request, env }) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|;\s*)sid=([A-Za-z0-9-]+)/)
  if (!m || !env.SITE_KV) {
    return new Response(JSON.stringify({ ok: false }),
      { headers: { 'content-type': 'application/json; charset=utf-8' } })
  }
  const sess = await env.SITE_KV.get('sess:' + m[1], 'json')
  if (!sess) {
    return new Response(JSON.stringify({ ok: false }),
      { headers: { 'content-type': 'application/json; charset=utf-8' } })
  }
  return new Response(JSON.stringify({ ok: true, email: sess.email }),
    { headers: { 'content-type': 'application/json; charset=utf-8' } })
}
