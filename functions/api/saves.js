import { getSessionEmail, json } from '../_auth.js'

/* GET → سیوهای اکانت را بده */
export async function onRequestGet({ request, env }) {
  const email = await getSessionEmail(request, env)
  if (!email || !env.SITE_KV) return json({ ok: false })
  const rec = await env.SITE_KV.get('save:' + email, 'json')
  return json({ ok: true, data: (rec && rec.data) || {}, at: (rec && rec.at) || 0 })
}

/* POST → سیوهای این دستگاه را در اکانت ذخیره کن */
export async function onRequestPost({ request, env }) {
  const email = await getSessionEmail(request, env)
  if (!email || !env.SITE_KV) return json({ ok: false, error: 'وارد نشده‌ای' }, 401)
  const body = await request.json().catch(() => ({}))
  await env.SITE_KV.put('save:' + email, JSON.stringify({
    data: body.data || {},
    at: Date.now(),
  }))
  return json({ ok: true })
}
