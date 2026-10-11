// بررسی کد و ساخت نشست ۳۰ روزه
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').trim().toLowerCase()
  const code = String(body.code || '').trim()
  const kv = env.SITE_KV
  if (!kv) return json({ ok: false, error: 'دیتابیس تنظیم نشده است' }, 500)

  const rec = await kv.get('otp:' + email, 'json')
  if (!rec) return json({ ok: false, error: 'کد منقضی شده — کد جدید بگیر' }, 400)

  if (rec.tries >= 5) {
    await kv.delete('otp:' + email)
    return json({ ok: false, error: 'تلاش‌های زیاد — کد جدید بگیر' }, 400)
  }
  if (code !== rec.code) {
    rec.tries++
    await kv.put('otp:' + email, JSON.stringify(rec), { expirationTtl: 600 })
    return json({ ok: false, error: 'کد اشتباه است' }, 400)
  }

  // کد درست بود → پاکش کن و یک نشست بساز
  await kv.delete('otp:' + email)
  const sid = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
  await kv.put('sess:' + sid, JSON.stringify({ email, at: Date.now() }), {
    expirationTtl: 60 * 60 * 24 * 30, // ۳۰ روز
  })

  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' })
  headers.append('Set-Cookie',
    `sid=${sid}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`)
  return new Response(JSON.stringify({ ok: true, email }), { headers })
}
