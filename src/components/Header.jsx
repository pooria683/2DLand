import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import AuthModal from './AuthModal.jsx'
import { initialSync, startAutoSync, stopAutoSync, pushSaves, isSynced } from '../lib/saveSync.js'
import './Header.css'

export default function Header() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const cls = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then(async (d) => {
        if (d.ok) {
          setUser(d)
          if (!isSynced()) await initialSync()
          startAutoSync()
        }
      })
      .catch(() => {})
  }, [])

  const handleLoggedIn = async (profile) => {
    setUser(profile)
    await initialSync()
    startAutoSync()
    window.location.reload() // تا بازی با سیو اکانت از نو لود شود
  }

  const logout = async () => {
    try { await pushSaves(true) } catch {}   // آخرین سیو این دستگاه را بفرست
    await fetch('/api/logout', { method: 'POST' }).catch(() => {})
    stopAutoSync()
    window.location.reload()
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">🎮 بازی‌خونه</Link>
          <nav className="nav">
            <NavLink to="/" end className={cls}>خانه</NavLink>
            <NavLink to="/games" className={cls}>بازی‌ها</NavLink>
          </nav>
          {user ? (
            <div className="user-chip">
              <span className="user-name">
                👤 {user.firstName} {user.lastName}
              </span>
              <button className="logout-btn" onClick={logout}>خروج</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>ورود / ثبت‌نام</button>
          )}
        </div>
      </header>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLoggedIn={handleLoggedIn} />
      )}
    </>
  )
}
