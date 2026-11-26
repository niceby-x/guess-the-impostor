import { useEffect, useState } from 'react'
import { createGame } from '../game/createGame.js'
import { DEFAULT_SETTINGS, STARTER_NAMES, resetGame } from '../game/resetGame.js'
import {
  advanceHintTurn,
  beginHintRound,
  continueFromResult,
  finishDiscussion,
} from '../game/phaseTransitions.js'
import { acknowledgeTie, submitPrivateVote } from '../game/voting.js'
import DiscussionPage from '../pages/DiscussionPage.jsx'
import GameOverPage from '../pages/GameOverPage.jsx'
import HintRoundPage from '../pages/HintRoundPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import PlayerSetupPage from '../pages/PlayerSetupPage.jsx'
import RoleRevealPage from '../pages/RoleRevealPage.jsx'
import RoundResultPage from '../pages/RoundResultPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import VotingPage from '../pages/VotingPage.jsx'

// A simple screen switcher. No router package needed yet.
// Player names, settings, the current match and the previous word pair's id
// all live here, so they survive moving between screens.
export default function App() {
  const [screen, setScreen] = useState('HOME') // HOME | SETUP | SETTINGS | GAME
  const [names, setNames] = useState(() => [...STARTER_NAMES])
  // Settings also live here, so they are kept when the host goes back and forth.
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS }))
  const [game, setGame] = useState(null)
  // Only the ID of the previous match's word pair, so a new match never repeats
  // it back to back. The word, clue and roles themselves are never kept.
  const [lastPairId, setLastPairId] = useState(null)

  const session = { names, settings, game, lastPairId }
  function applySession(next) {
    setNames(next.names)
    setSettings(next.settings)
    setGame(next.game)
    setLastPairId(next.lastPairId)
  }

  // A match is in progress while the GAME screen is showing and the game is not
  // over yet. Refreshing or closing the tab would lose it, so the browser asks
  // first (guide section 10.2). Nothing is saved to localStorage.
  const matchActive = screen === 'GAME' && game?.phase !== 'GAME_OVER'
  useEffect(() => {
    if (!matchActive) return undefined
    function warn(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [matchActive])

  // Setup has already validated the names and passes back the cleaned list.
  function handleSetupDone(cleanedNames) {
    setNames(cleanedNames)
    setScreen('SETTINGS')
  }

  // Creates a match. The previous match's word pair id is passed in so the same
  // pair is not picked twice in a row. Returns the result so the Settings
  // screen can show any errors.
  function handleStartGame(chosen) {
    setSettings(chosen)
    const result = createGame({
      names,
      ...chosen,
      lastPairId: game ? game.wordPairId : lastPairId,
    })
    if (result.ok) {
      setGame(result.game)
      setScreen('GAME')
    }
    return result
  }

  // Phase changes. Each guards on the phase, so a timer and a button tap that
  // fire at the same moment cannot move the game on twice.
  const finishReveal = () =>
    setGame((g) => (g.phase === 'ROLE_REVEAL' ? beginHintRound(g) : g))
  const nextSpeaker = (fromIndex) =>
    setGame((g) => (g.phase === 'HINTING' ? advanceHintTurn(g, fromIndex) : g))
  const endDiscussion = () =>
    setGame((g) => (g.phase === 'DISCUSSION' ? finishDiscussion(g) : g))
  // A repeated tap for a vote that is already saved is ignored by
  // submitPrivateVote, so a double-tap cannot count twice.
  const castVote = (voterId, targetId) =>
    setGame((g) => (g.phase === 'VOTING' ? submitPrivateVote(g, voterId, targetId) : g))
  const startRevote = () => setGame((g) => (g.phase === 'VOTING' ? acknowledgeTie(g) : g))
  const continueRound = () =>
    setGame((g) => (g.phase === 'ROUND_RESULT' ? continueFromResult(g) : g))

  // Every way out of a match goes through resetGame, so nothing from the old
  // match (roles, votes, round, word, clue) can show up in the next one.
  // Cancel game, End game and "Change players or settings" keep names and
  // settings; they return to the Settings screen.
  const endGame = () => {
    applySession(resetGame(session))
    setScreen('SETTINGS')
  }
  // Play again: same players and settings, brand new roles and word.
  const playAgain = () => {
    const next = resetGame(session)
    const result = createGame({ names: next.names, ...next.settings, lastPairId: next.lastPairId })
    applySession({ ...next, game: result.ok ? result.game : null })
    setScreen(result.ok ? 'GAME' : 'SETTINGS')
  }
  // Home: forget everything except the previous pair's id.
  const goHome = () => {
    applySession(resetGame(session, { clearNames: true }))
    setScreen('HOME')
  }

  return (
    <main>
      {screen === 'HOME' && <HomePage onStart={() => setScreen('SETUP')} />}
      {screen === 'SETUP' && (
        <PlayerSetupPage
          names={names}
          onChange={setNames}
          onBack={() => setScreen('HOME')}
          onNext={handleSetupDone}
        />
      )}
      {screen === 'SETTINGS' && (
        <SettingsPage
          names={names}
          settings={settings}
          onSettingsChange={setSettings}
          onBack={() => setScreen('SETUP')}
          onStart={handleStartGame}
        />
      )}
      {screen === 'GAME' && game?.phase === 'ROLE_REVEAL' && (
        <RoleRevealPage game={game} onFinished={finishReveal} onQuit={endGame} />
      )}
      {screen === 'GAME' && game?.phase === 'HINTING' && (
        <HintRoundPage
          key={`${game.roundNumber}-${game.currentHintIndex}`}
          game={game}
          onNextSpeaker={nextSpeaker}
          onEnd={endGame}
        />
      )}
      {screen === 'GAME' && game?.phase === 'DISCUSSION' && (
        <DiscussionPage game={game} onFinish={endDiscussion} onEnd={endGame} />
      )}
      {screen === 'GAME' && game?.phase === 'VOTING' && (
        <VotingPage
          key={`${game.voting.stage}-${game.voting.currentVoterIndex}-${game.voting.tieNoticePending}`}
          game={game}
          onVote={castVote}
          onStartRevote={startRevote}
          onEnd={endGame}
        />
      )}
      {screen === 'GAME' && game?.phase === 'ROUND_RESULT' && (
        <RoundResultPage game={game} onContinue={continueRound} />
      )}
      {screen === 'GAME' && game?.phase === 'GAME_OVER' && (
        <GameOverPage
          game={game}
          onPlayAgain={playAgain}
          onChangeSettings={endGame}
          onHome={goHome}
        />
      )}
    </main>
  )
}
