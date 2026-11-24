// Placeholder for Milestone 4. It only shows the hint-phase instructions
// (guide section 3.2). Turn order and timers are built in Milestone 5.
export default function HintRoundPage({ onBack }) {
  return (
    <section className="screen">
      <h2>Everyone has seen their role</h2>
      <p className="notice" role="status">
        Next comes the spoken hint round: each player says one short hint out
        loud, without saying the secret word. The turn order and timer are built
        in Milestone 5.
      </p>
      <button className="btn btn--secondary" onClick={onBack}>
        Back to settings
      </button>
    </section>
  )
}
