import { Link } from 'react-router-dom'
import { games, getRecent } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import './HomePage.css'

export default function HomePage() {
  const featured = games.find((g) => g.featured) || games[0]
  const recent = getRecent()
    .map((id) => games.find((g) => g.id === id))
    .filter(Boolean)

  return (
    <div className="container">
      <section className="hero">
        <h1>به <span className="grad">بازی‌خونه</span> خوش اومدی! 🎮</h1>
        <p>بازی‌های خلاقانه‌ی مرورگر، همه فارسی و بدون نصب — همون‌جا که هستی بازی کن.</p>
        <div className="hero-btns">
          {featured && (
            <Link className="btn primary" to={`/game/${featured.id}`}>
              ▶ بازی شاخص: {featured.title}
            </Link>
          )}
          <Link className="btn ghost" to="/games">دیدن همه‌ی بازی‌ها</Link>
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="section-title">🕐 اخیراً بازی کردی</h2>
          <div className="games-grid">
            {recent.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">⭐ همه‌ی بازی‌ها</h2>
        <div className="games-grid">
          {games.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </section>
    </div>
  )
}
