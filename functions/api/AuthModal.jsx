import { useState } from 'react'
import './AuthModal.css'

export default function AuthModal({ onClose, onLoggedIn }) {
  const [step, setStep] = useState('email') // email | code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const sendCode = async () => {
    setErr(''); setMsg('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('ایمیل معتبر نیست'); return
    }
    setBusy(true)
    try {
      const r = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await r.json()
      if (d.ok) {
        setStep('code')
        setMsg('کد ۶ رقمی به ایمیلت رفت — پوشه‌ی Spam را هم چک کن')
      } else setErr(d.error || 'ارسال کد ناموفق بود')
    } catch { setErr('خطای شبکه — دوباره امتحان کن') }
    setBusy(false)
  }

  const verify = async () => {
    setErr(''); setMsg('')
    if (code.trim().length !== 6) { setErr('کد باید ۶ رقم باشد'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const d = await r.json()
      if (d.ok) { onLoggedIn(d.email); onClose() }
      else setErr(d.error || 'کد اشتباه است')
    } catch { setErr('خطای شبکه') }
    setBusy(false)
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-box" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>
        <h2>{step === 'email' ? 'ورود به بازی‌خونه 🎮' : 'کد را وارد کن 🔢'}</h2>
        <p className="auth-sub">
          {step === 'email'
            ? 'ایمیلت را بزن، یک کد ۶ رقمی برایت می‌فرستیم.'
            : `کد ۶ رقمی فرستاده‌شده به ${email} را وارد کن.`}
        </p>

        {step === 'email' ? (
          <>
            <input
              className="auth-input"
              type="email"
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendCode()}
              autoFocus
            />
            <button className="auth-btn" onClick={sendCode} disabled={busy}>
              {busy ? 'در حال ارسال...' : 'ارسال کد'}
            </button>
          </>
        ) : (
          <>
            <input
              className="auth-input code"
              type="text"
              inputMode="numeric"
              dir="ltr"
              placeholder="- - - - - -"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              autoFocus
            />
            <button className="auth-btn" onClick={verify} disabled={busy}>
              {busy ? 'در حال بررسی...' : 'ورود'}
            </button>
            <button className="auth-link" onClick={() => { setStep('email'); setErr(''); setMsg('') }}>
              ← تغییر ایمیل / ارسال دوباره
            </button>
          </>
        )}

        {msg && <div className="auth-msg">{msg}</div>}
        {err && <div className="auth-err">{err}</div>}
      </div>
    </div>
  )
}
