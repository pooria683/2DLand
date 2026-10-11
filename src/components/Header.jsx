import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import AuthModal from './AuthModal.jsx'
import './Header.css'

export default function Header() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const cls = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setUser(d.email) })
      .catch(() => {})
  }, [])

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
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
              <span className="user-email" dir="ltr" title={user}>{user}</span>
              <button className="logout-btn" onClick={logout}>خروج</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>ورود</button>
          )}
        </div>
      </header>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLoggedIn={(email) => setUser(email)} />
      )}
    </>
  )
}
