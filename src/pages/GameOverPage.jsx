// Placeholder for Milestone 6. It only announces the winning team so the game
// never gets stuck. The full reveal of every role, the word and the clue, plus
// Play Again, is built in Milestone 7.
export default function GameOverPage({ winner, onBack }) {
  return (
    <section className="screen">
      <span className="status-chip">Game over</span>
      <h2>{winner === 'IMPOSTORS' ? 'The impostors win' : 'The regular players win'}</h2>
      <p className="notice" role="status">
        The final reveal of every role, the secret word and the clue, and a Play
        Again button, are built in Milestone 7.
      </p>
      <button className="btn btn--secondary" onClick={onBack}>
        Back to settings
      </button>
    </section>
  )
}
