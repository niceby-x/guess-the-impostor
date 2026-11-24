import { useState } from 'react'

export default function HomePage({ onStart }) {
  const [showRules, setShowRules] = useState(false)

  return (
    <section className="screen screen--center">
      <h1 className="title">
        Guess the <span className="title__accent">Impostor</span>
      </h1>
      <p className="tagline">A social deduction word game for friends.</p>

      <div className="role-preview" aria-label="The two roles">
        <div className="role-preview__card role-preview__card--regular">
          <span className="badge badge--regular">Regular player</span>
          <p>Receives the exact secret word.</p>
        </div>
        <div className="role-preview__card role-preview__card--impostor">
          <span className="badge badge--impostor">Impostor</span>
          <p>Receives one related clue only.</p>
        </div>
      </div>

      <button className="btn btn--primary" onClick={onStart}>
        Classic Mode
      </button>
      <p className="hint-text">Pass the phone around. No accounts needed.</p>

      <button
        className="btn btn--ghost"
        aria-expanded={showRules}
        onClick={() => setShowRules((v) => !v)}
      >
        How to Play
      </button>

      {showRules && (
        <ol className="rules">
          <li>Everyone enters their name, and the host picks how many impostors.</li>
          <li>Pass the phone. Each player privately sees their word or clue.</li>
          <li>Take turns saying one short spoken hint. Never say the word itself.</li>
          <li>Discuss, then vote privately for who you think the impostor is.</li>
          <li>Keep going until all impostors are out, or they outnumber everyone else.</li>
        </ol>
      )}
    </section>
  )
}
