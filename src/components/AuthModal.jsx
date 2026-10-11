import { useState } from 'react'
import './AuthModal.css'

export default function AuthModal({ onClose, onLoggedIn }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async () => {
    setErr('')
    setBusy(true)
    try {
      const url = mode === 'login' ? '/api/login' : '/api/register'
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (d.ok) { onLoggedIn(d); return }
      setErr(d.error || 'خطایی رخ داد')
    } catch { setErr('خطای شبکه — دوباره امتحان کن') }
    setBusy(false)
  }

  const enter = (e) => { if (e.key === 'Enter') submit() }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-box" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr('') }}>ورود</button>
          <button className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setErr('') }}>ثبت‌نام</button>
        </div>

        <h2>{mode === 'login' ? 'خوش برگشتی! 👋' : 'ساخت اکانت جدید 🎮'}</h2>
        <p className="auth-sub">
          {mode === 'login'
            ? 'با ایمیل و رمز عبورت وارد شو — سیو بازی‌هات همین‌جاست.'
            : 'اکانت بساز تا سیو بازی‌هایت به اکانتت وصل شود و از هر دستگاهی ادامه بدهی.'}
        </p>

        {mode === 'signup' && (
          <div className="auth-row">
            <input className="auth-input" placeholder="نام" value={form.firstName} onChange={set('firstName')} autoFocus />
            <input className="auth-input" placeholder="نام خانوادگی" value={form.lastName} onChange={set('lastName')} />
          </div>
        )}

        <input className="auth-input" type="email" dir="ltr" placeholder="you@example.com"
          value={form.email} onChange={set('email')} onKeyDown={enter}
          autoFocus={mode === 'login'} />
        <input className="auth-input" type="password" dir="ltr" placeholder="رمز عبور"
          value={form.password} onChange={set('password')} onKeyDown={enter} />

        <button className="auth-btn" onClick={submit} disabled={busy}>
          {busy ? 'لطفاً صبر کن...' : mode === 'login' ? 'ورود' : 'ساخت اکانت'}
        </button>

        {err && <div className="auth-err">{err}</div>}
      </div>
    </div>
  )
}
