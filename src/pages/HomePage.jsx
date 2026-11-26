import { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import Screen from '../components/Screen.jsx'

// Four suspects in a line-up. One is wearing a disguise. This is the whole game
// in one picture, so the title doesn't need to explain it.
const LINEUP = [
  { seat: 0, size: 76 },
  { seat: 3, size: 96, masked: true },
  { seat: 6, size: 82 },
  { seat: 9, size: 90 },
]

export default function HomePage({ onStart }) {
  const [showRules, setShowRules] = useState(false)

  return (
    <Screen
      tone="table"
      center
      footer={
        <>
          <button className="btn btn--primary" onClick={onStart}>
            Play on this phone
          </button>
          <button
            className="btn btn--quiet"
            aria-expanded={showRules}
            onClick={() => setShowRules((open) => !open)}
          >
            {showRules ? 'Hide the rules' : 'How to play'}
          </button>
        </>
      }
    >
      <div className="lineup" aria-hidden="true">
        {LINEUP.map((member, index) => (
          <div className="lineup__member" key={member.seat} style={{ '--i': index, '--s': `${member.size}px` }}>
            <Avatar seat={member.seat} masked={member.masked} />
          </div>
        ))}
      </div>

      <h1 className="display">
        <span>Guess the</span>
        <span>Impostor</span>
      </h1>
      <p className="lede">
        Everyone gets the same secret word. Except one of you, who only gets a clue.
      </p>
      <p className="note">One phone, passed around the table. No accounts.</p>

      {showRules && (
        <ol className="howto">
          <li>Add everyone&rsquo;s name and pick how many impostors there are.</li>
          <li>Pass the phone. Each person secretly sees their word, or the impostor&rsquo;s clue.</li>
          <li>Take turns saying one hint out loud. Never say the word itself.</li>
          <li>Talk it over, then vote in secret for who you think is bluffing.</li>
          <li>Vote out every impostor to win. If they last until they match the rest of you, they win.</li>
        </ol>
      )}
    </Screen>
  )
}
