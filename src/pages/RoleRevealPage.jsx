import { useCallback, useState } from 'react'
import HandoffScreen from '../components/HandoffScreen.jsx'
import RoleRevealCard from '../components/RoleRevealCard.jsx'
import {
  coverRole,
  createRevealState,
  getRevealView,
  goBackOnePlayer,
  hideAndPass,
  isRevealComplete,
  revealCurrentRole,
} from '../game/roleReveal.js'
import usePageHidden from '../hooks/usePageHidden.js'

// Walks the phone around the group, one private reveal at a time.
// The screens below render only what getRevealView returns.
export default function RoleRevealPage({ game, onFinished, onQuit }) {
  const [reveal, setReveal] = useState(createRevealState)

  // Privacy cover: if the tab is hidden while a role shows, clear it.
  const cover = useCallback(() => setReveal(coverRole), [])
  usePageHidden(cover)

  const view = getRevealView(game, reveal)

  function handleHideAndPass() {
    const next = hideAndPass(reveal, game.players.length)
    if (isRevealComplete(next)) onFinished()
    else setReveal(next)
  }

  if (view.kind === 'REVEALED') {
    return (
      <RoleRevealCard
        // A new key per player guarantees the old card is fully replaced.
        key={`reveal-${reveal.index}`}
        playerName={view.playerName}
        seat={reveal.index}
        display={view.display}
        onHide={handleHideAndPass}
      />
    )
  }

  return (
    <HandoffScreen
      key={`handoff-${reveal.index}`}
      playerName={view.playerName}
      seat={reveal.index}
      position={view.position}
      total={view.total}
      canGoBack={view.canGoBack}
      onReveal={() => setReveal(revealCurrentRole)}
      onGoBack={() => setReveal(goBackOnePlayer)}
      onQuit={onQuit}
    />
  )
}
