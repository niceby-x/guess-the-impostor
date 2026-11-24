import { useState } from 'react'
import HomePage from '../pages/HomePage.jsx'
import PlayerSetupPage from '../pages/PlayerSetupPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'

// Milestone 1: a simple screen switcher. No router package needed yet.
// Player names live here so they survive moving between Setup and Settings.
const STARTER_NAMES = ['', '', '', '']

export default function App() {
  const [screen, setScreen] = useState('HOME') // HOME | SETUP | SETTINGS
  const [names, setNames] = useState(STARTER_NAMES)

  return (
    <main className="app">
      {screen === 'HOME' && <HomePage onStart={() => setScreen('SETUP')} />}
      {screen === 'SETUP' && (
        <PlayerSetupPage
          names={names}
          onChange={setNames}
          onBack={() => setScreen('HOME')}
          onNext={() => setScreen('SETTINGS')}
        />
      )}
      {screen === 'SETTINGS' && (
        <SettingsPage
          playerCount={names.length}
          onBack={() => setScreen('SETUP')}
        />
      )}
    </main>
  )
}
