/* توابع مشترک احراز هویت — فایل‌هایی که اولشان _ است روت حساب نمی‌شوند */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function getSessionEmail(request, env) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|;\s*)sid=([A-Za-z0-9-]+)/)
  if (!m || !env.SITE_KV) return null
  const sess = await env.SITE_KV.get('sess:' + m[1], 'json')
  return sess ? sess.email : null
}

export function sessionCookie(sid) {
  return `sid=${sid}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
}
