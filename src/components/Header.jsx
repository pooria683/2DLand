import { NavLink, Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const cls = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">🎮 بازی‌خونه</Link>
        <nav className="nav">
          <NavLink to="/" end className={cls}>خانه</NavLink>
          <NavLink to="/games" className={cls}>بازی‌ها</NavLink>
          <NavLink to="/about" className={cls}>درباره</NavLink>
        </nav>
      </div>
    </header>
  )
}
