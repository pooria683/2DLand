import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { games, saveRecent } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import './GamePage.css'

export default function GamePage() {
  const { gameId } = useParams()
  const game = games.find((g) => g.id === gameId)
  const frameRef = useRef(null)

  useEffect(() => {
    if (game) saveRecent(game.id)
    window.scrollTo(0, 0)
  }, [game])

  if (!game) {
    return (
      <div className="container not-found">
        <h1>😕 بازی پیدا نشد</h1>
        <Link to="/games" className="back-link">بازگشت به بازی‌ها</Link>
      </div>
    )
  }

  const sameCategory = games.filter(
    (g) => g.id !== game.id && g.category === game.category
  )
  const related = sameCategory.length
    ? sameCategory
    : games.filter((g) => g.id !== game.id)

  const goFullscreen = () => {
    const el = frameRef.current
    if (!el) return
    if (el.requestFullscreen) el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  }

  return (
    <div className="container game-page">
      <div className="game-toolbar">
        <Link to="/games" className="back-link">→ همه‌ی بازی‌ها</Link>
        <h1>{game.title}</h1>
        <button className="fullscreen-btn" onClick={goFullscreen}>
          ⛶ تمام‌صفحه
        </button>
      </div>

      <div className="game-frame" ref={frameRef}>
        <iframe
          src={game.file}
          title={game.title}
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="section-title">🎲 بازی‌های مشابه</h2>
          <div className="games-grid">
            {related.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}
    </div>
  )
}
