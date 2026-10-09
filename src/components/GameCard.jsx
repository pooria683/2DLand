import { Link } from 'react-router-dom'
import './GameCard.css'

export default function GameCard({ game }) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="game-card"
      style={{ '--card-gradient': game.gradient }}
    >
      <div className="card-art">{game.emoji}</div>
      <div className="card-info">
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        <span className="card-category">{game.category}</span>
      </div>
    </Link>
  )
}
