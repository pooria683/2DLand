import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { games, saveRecent } from '../data/games.js'
import { initialSync, isSynced } from '../lib/saveSync.js'
import GameCard from '../components/GameCard.jsx'
import './GamePage.css'

export default function GamePage() {
  const { gameId } = useParams()
  const game = games.find((g) => g.id === gameId)
  const frameRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (game) saveRecent(game.id)
    if (game && game.saveFile === false) {
      try { localStorage.setItem(game.id + '_filesave', 'false') } catch (e) {}
    }
    window.scrollTo(0, 0)
  }, [game])

  /* قبل از لود بازی: اگر وارد شده‌ای، سیو اکانت را بیاور
     تا iframe با داده‌ی درست بالا بیاید */
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/me')
        const d = await r.json()
        if (d.ok && !isSynced()) await initialSync()
      } catch {}
      if (alive) setReady(true)
    })()
    return () => { alive = false }
  }, [])

  /* بعد از تمام‌صفحه، فوکوس را به بازی برگردان تا کیبورد فوراً کار کند */
  useEffect(() => {
    const focusGame = () => {
      const iframe = frameRef.current?.querySelector('iframe')
      if (!iframe) return
      setTimeout(() => {
        try { iframe.contentWindow?.focus() } catch (e) {}
      }, 120)
    }
    document.addEventListener('fullscreenchange', focusGame)
    document.addEventListener('webkitfullscreenchange', focusGame)
    return () => {
      document.removeEventListener('fullscreenchange', focusGame)
      document.removeEventListener('webkitfullscreenchange', focusGame)
    }
  }, [])

  if (!game) {
    return (
      <div className="container not-found">
        <h1>😕 بازی پیدا نشد</h1>
        <Link to="/games" className="back-link">بازگشت به بازی‌ها</Link>
      </div>
    )
  }

  const [rw, rh] = game.ratio || [16, 9]
  const frameStyle = { '--rw': rw, '--rh': rh }

  const sameCategory = games.filter(
    (g) => g.id !== game.id && g.category === game.category
  )
  const related = sameCategory.length
    ? sameCategory
    : games.filter((g) => g.id !== game.id)

  const goFullscreen = () => {
    const el = frameRef.current
    if (!el) return
    const iframe = el.querySelector('iframe')
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      }
    } catch (e) {}
    setTimeout(() => {
      try { iframe?.contentWindow?.focus() } catch (e) {}
    }, 200)
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
        {!ready ? (
          <div className="sync-loading">💾 در حال همگام‌سازی سیو با اکانت...</div>
        ) : (
          <iframe
            src={game.file}
            title={game.title}
            style={frameStyle}
            allow="fullscreen; autoplay"
            allowFullScreen
          />
        )}
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
