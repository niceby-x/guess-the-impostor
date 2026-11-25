import { useCallback, useState } from 'react'
import EndGameLink from '../components/EndGameLink.jsx'
import PrivateVotePanel from '../components/PrivateVotePanel.jsx'
import VoteHandoff from '../components/VoteHandoff.jsx'
import { getCurrentVoter, getVoteTargets } from '../game/voting.js'
import usePageHidden from '../hooks/usePageHidden.js'

// Private voting, one player at a time. App gives this page a new key for
// every voter, so a fresh ballot never remembers the previous choice.
export default function VotingPage({ game, onVote, onStartRevote, onEnd }) {
  const [ballotOpen, setBallotOpen] = useState(false)

  // Privacy cover: if the tab is hidden while a ballot is open, close it. The
  // unsent choice is thrown away and the voter starts again from the handoff.
  const cover = useCallback(() => setBallotOpen(false), [])
  usePageHidden(cover)

  const { voting } = game
  const nameOf = (id) => game.players.find((player) => player.id === id).name

  if (voting.tieNoticePending) {
    return (
      <section className="screen">
        <span className="status-chip">Tie</span>
        <h2>It is a tie</h2>
        <p className="notice" role="status">
          {voting.candidateIds.map(nameOf).join(' and ')} got the same number of votes. Everyone
          votes again, but only for them.
        </p>
        <button className="btn btn--primary" onClick={onStartRevote}>
          Start revote
        </button>
        <EndGameLink onEnd={onEnd} />
      </section>
    )
  }

  const voter = getCurrentVoter(game)

  if (ballotOpen) {
    return (
      <PrivateVotePanel
        voterName={voter.name}
        targets={getVoteTargets(game, voter.id)}
        onConfirm={(targetId) => onVote(voter.id, targetId)}
      />
    )
  }

  return (
    <VoteHandoff
      voterName={voter.name}
      position={voting.currentVoterIndex + 1}
      total={voting.voterIds.length}
      justSaved={voting.currentVoterIndex > 0}
      isRevote={voting.stage === 'REVOTE'}
      onStart={() => setBallotOpen(true)}
      onEnd={onEnd}
    />
  )
}
