import { useMemo, useState } from 'react'
import { games, categories } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import './GamesPage.css'

export default function GamesPage() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('همه')

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const okCat = cat === 'همه' || g.category === cat
      const okQuery =
        g.title.includes(query) || g.description.includes(query)
      return okCat && okQuery
    })
  }, [query, cat])

  return (
    <div className="container">
      <h1 className="page-title">🎯 همه‌ی بازی‌ها</h1>

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="🔍 جستجوی بازی..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip${cat === c ? ' active' : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">بازی‌ای با این مشخصات پیدا نشد 🤷</p>
      ) : (
        <div className="games-grid">
          {filtered.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  )
}
