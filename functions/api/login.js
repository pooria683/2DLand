import { json, sessionCookie } from '../_auth.js'
import { hashPassword } from '../_crypto.js'

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  const kv = env.SITE_KV
  if (!kv) return json({ ok: false, error: 'سرور تنظیم نشده است' }, 500)

  const user = await kv.get('user:' + email, 'json')
  if (!user) return json({ ok: false, error: 'حسابی با این ایمیل نیست — ثبت‌نام کن' }, 400)

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.hash) return json({ ok: false, error: 'ایمیل یا رمز عبور اشتباه است' }, 400)

  const sid = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
  await kv.put('sess:' + sid, JSON.stringify({ email, at: Date.now() }), {
    expirationTtl: 60 * 60 * 24 * 30,
  })

  const res = json({ ok: true, email, firstName: user.firstName, lastName: user.lastName })
  res.headers.append('Set-Cookie', sessionCookie(sid))
  return res
}
