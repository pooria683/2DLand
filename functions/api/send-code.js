// ارسال کد ورود به ایمیل
const CODE_TTL = 600 // کد ۱۰ دقیقه اعتبار دارد

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'ایمیل معتبر نیست' }, 400)
  }
  const kv = env.SITE_KV
  if (!kv) return json({ ok: false, error: 'دیتابیس تنظیم نشده است' }, 500)

  // ضد اسپم: بین دو ارسال حداقل ۶۰ ثانیه فاصله
  const old = await kv.get('otp:' + email, 'json')
  if (old && Date.now() - old.sentAt < 60000) {
    return json({ ok: false, error: 'کد همین الان فرستاده شد — یک دقیقه صبر کن' }, 429)
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  await kv.put('otp:' + email, JSON.stringify({ code, sentAt: Date.now(), tries: 0 }), {
    expirationTtl: CODE_TTL,
  })

  const key = env.RESEND_API_KEY
  if (!key) return json({ ok: false, error: 'سرویس ایمیل تنظیم نشده است' }, 500)

  const from = env.MAIL_FROM || 'بازی‌خونه <onboarding@resend.dev>'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'کد ورود به بازی‌خونه: ' + code,
      html: `
        <div style="direction:rtl;text-align:center;font-family:Tahoma,sans-serif;background:#0d0d17;color:#f0f0fa;padding:32px;border-radius:16px;max-width:480px;margin:0 auto">
          <h2 style="color:#7c5cff;margin:0 0 12px">🎮 ورود به بازی‌خونه</h2>
          <p>کد ورود تو:</p>
          <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#00d1c7;padding:12px 0">${code}</div>
          <p style="color:#9a9ab5;font-size:13px;line-height:2">این کد ۱۰ دقیقه اعتبار دارد.<br>اگر تو این درخواست را ندادی، این ایمیل را نادیده بگیر.</p>
        </div>`,
    }),
  })
  if (!res.ok) return json({ ok: false, error: 'ارسال ایمیل ناموفق بود' }, 500)
  return json({ ok: true })
}
