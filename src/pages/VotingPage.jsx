// Placeholder for Milestone 5. Private voting is built in Milestone 6.
export default function VotingPage({ onBack }) {
  return (
    <section className="screen">
      <span className="status-chip">Voting</span>
      <h2>Time to vote</h2>
      <p className="notice" role="status">
        Discussion is over. Private voting, with the phone passed from player to
        player, is built in Milestone 6.
      </p>
      <button className="btn btn--secondary" onClick={onBack}>
        Back to settings
      </button>
    </section>
  )
}
