import { json, sessionCookie } from '../_auth.js'
import { makeSalt, hashPassword } from '../_crypto.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}))
  const firstName = (body.firstName || '').trim()
  const lastName = (body.lastName || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!firstName || !lastName) return json({ ok: false, error: 'نام و نام خانوادگی را وارد کن' }, 400)
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'ایمیل معتبر نیست' }, 400)
  if (password.length < 6) return json({ ok: false, error: 'رمز عبور حداقل ۶ کاراکتر باشد' }, 400)

  const kv = env.SITE_KV
  if (!kv) return json({ ok: false, error: 'سرور تنظیم نشده است' }, 500)

  // ایمیل تکراری؟
  if (await kv.get('user:' + email)) {
    return json({ ok: false, error: 'این ایمیل قبلاً ثبت شده — وارد شو' }, 400)
  }

  const salt = makeSalt()
  const hash = await hashPassword(password, salt)
  await kv.put('user:' + email, JSON.stringify({
    firstName, lastName, salt, hash, createdAt: Date.now(),
  }))

  // بلافاصله واردش کن
  const sid = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
  await kv.put('sess:' + sid, JSON.stringify({ email, at: Date.now() }), {
    expirationTtl: 60 * 60 * 24 * 30,
  })

  const res = json({ ok: true, email, firstName, lastName })
  res.headers.append('Set-Cookie', sessionCookie(sid))
  return res
}
