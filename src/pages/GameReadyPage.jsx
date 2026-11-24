// Temporary neutral checkpoint for Milestone 3. It shows counts only: never a
// word, a clue, a role, or a player's name next to a role. Milestone 4 replaces
// this screen with the real "Pass the phone to..." handoff.
export default function GameReadyPage({ game, onBack }) {
  const impostors = game.impostorIds.length
  const regulars = game.players.length - impostors

  return (
    <section className="screen">
      <button className="link-back" onClick={onBack}>
        &larr; Back to settings
      </button>
      <h2>Game ready</h2>
      <p className="notice" role="status">
        Roles have been assigned in secret: {regulars} regular players and{' '}
        {impostors} impostor{impostors > 1 ? 's' : ''}. The private role reveal
        is built in Milestone 4.
      </p>
    </section>
  )
}
