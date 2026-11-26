import { Fragment, useCallback, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import EndGameLink from '../components/EndGameLink.jsx'
import PrivateVotePanel from '../components/PrivateVotePanel.jsx'
import Screen from '../components/Screen.jsx'
import StepTracker from '../components/StepTracker.jsx'
import VoteHandoff from '../components/VoteHandoff.jsx'
import { seatOf } from '../components/avatarSpec.js'
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
      <Screen
        tone="table"
        center
        hud={<StepTracker step="vote" round={game.roundNumber} />}
        footer={
          <>
            <button className="btn btn--primary" onClick={onStartRevote}>
              Start revote
            </button>
            <EndGameLink onEnd={onEnd} />
          </>
        }
      >
        <h1 className="title center">It&rsquo;s a tie</h1>
        <div className="versus">
          {voting.candidateIds.map((id, index) => (
            <Fragment key={id}>
              {index > 0 && (
                <span className="versus__vs" aria-hidden="true">
                  vs
                </span>
              )}
              <div className="versus__side">
                <Avatar seat={seatOf(id)} size="lg" />
                <span>{nameOf(id)}</span>
              </div>
            </Fragment>
          ))}
        </div>
        <p className="lede center">
          {voting.candidateIds.map(nameOf).join(' and ')} got the same number of votes. Everyone votes
          again, but only for them.
        </p>
      </Screen>
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
      seat={seatOf(voter.id)}
      round={game.roundNumber}
      position={voting.currentVoterIndex + 1}
      total={voting.voterIds.length}
      justSaved={voting.currentVoterIndex > 0}
      isRevote={voting.stage === 'REVOTE'}
      onStart={() => setBallotOpen(true)}
      onEnd={onEnd}
    />
  )
}
