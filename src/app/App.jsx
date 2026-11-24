import { useEffect, useState } from 'react'
import { createGame } from '../game/createGame.js'
import { beginHintRound } from '../game/phaseTransitions.js'
import HintRoundPage from '../pages/HintRoundPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import PlayerSetupPage from '../pages/PlayerSetupPage.jsx'
import RoleRevealPage from '../pages/RoleRevealPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'

// A simple screen switcher. No router package needed yet.
// Player names live here so they survive moving between Setup and Settings.
const STARTER_NAMES = ['', '', '', '']
const DEFAULT_SETTINGS = { impostorCount: 1, hintSeconds: 30, discussionSeconds: 60 }

export default function App() {
  const [screen, setScreen] = useState('HOME') // HOME | SETUP | SETTINGS | REVEAL | HINTS
  const [names, setNames] = useState(STARTER_NAMES)
  // Settings also live here, so they are kept when the host goes back and forth.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [game, setGame] = useState(null)

  // A match is in progress while roles are being revealed or hints are running.
  // Refreshing or closing the tab would lose it, so the browser asks first
  // (guide section 10.2). Nothing is saved to localStorage.
  const matchActive = screen === 'REVEAL' || screen === 'HINTS'
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

  // Creates a match. The previous match's word pair is passed in so the same
  // pair is not picked twice in a row. Returns the result so the Settings
  // screen can show any errors.
  function handleStartGame(chosen) {
    setSettings(chosen)
    const result = createGame({
      names,
      ...chosen,
      lastPairId: game ? game.wordPairId : null,
    })
    if (result.ok) {
      setGame(result.game)
      setScreen('REVEAL')
    }
    return result
  }

  return (
    <main className="app">
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
      {screen === 'REVEAL' && game && (
        <RoleRevealPage
          game={game}
          onFinished={() => {
            setGame(beginHintRound(game))
            setScreen('HINTS')
          }}
          onQuit={() => setScreen('SETTINGS')}
        />
      )}
      {screen === 'HINTS' && game && (
        <HintRoundPage onBack={() => setScreen('SETTINGS')} />
      )}
    </main>
  )
}
