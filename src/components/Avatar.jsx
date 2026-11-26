import { getAvatarSpec } from './avatarSpec.js'

const INK = '#15171C'
const PAPER = '#FAFAF7'

function Head({ head, color }) {
  const common = { fill: color, stroke: INK, strokeWidth: 4 }
  switch (head) {
    case 'squircle':
      return <rect x="17" y="19" width="66" height="66" rx="24" {...common} />
    case 'egg':
      return <ellipse cx="50" cy="53" rx="31" ry="36" {...common} />
    case 'tall':
      return <rect x="22" y="14" width="56" height="76" rx="28" {...common} />
    case 'wide':
      return <rect x="12" y="26" width="76" height="58" rx="26" {...common} />
    default:
      return <circle cx="50" cy="53" r="34" {...common} />
  }
}

function Eyes({ eyes }) {
  switch (eyes) {
    case 'wide':
      return (
        <g stroke={INK} strokeWidth="3">
          <circle cx="38" cy="48" r="8" fill={PAPER} />
          <circle cx="62" cy="48" r="8" fill={PAPER} />
          <circle cx="38" cy="49" r="3.5" fill={INK} stroke="none" />
          <circle cx="62" cy="49" r="3.5" fill={INK} stroke="none" />
        </g>
      )
    case 'sleepy':
      return (
        <g fill={INK}>
          <path d="M30 48 h16 a8 8 0 0 1 -16 0 z" />
          <path d="M54 48 h16 a8 8 0 0 1 -16 0 z" />
        </g>
      )
    case 'wink':
      return (
        <g>
          <circle cx="38" cy="48" r="4.5" fill={INK} />
          <path d="M55 50 Q62 43 69 50" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      )
    case 'side':
      return (
        <g stroke={INK} strokeWidth="3">
          <circle cx="38" cy="48" r="7.5" fill={PAPER} />
          <circle cx="62" cy="48" r="7.5" fill={PAPER} />
          <circle cx="42" cy="48" r="3.5" fill={INK} stroke="none" />
          <circle cx="66" cy="48" r="3.5" fill={INK} stroke="none" />
        </g>
      )
    case 'x':
      return (
        <g stroke={INK} strokeWidth="4" strokeLinecap="round">
          <path d="M33 43 l10 10 M43 43 l-10 10" />
          <path d="M57 43 l10 10 M67 43 l-10 10" />
        </g>
      )
    default:
      return (
        <g fill={INK}>
          <circle cx="38" cy="48" r="4.5" />
          <circle cx="62" cy="48" r="4.5" />
        </g>
      )
  }
}

function Mouth({ mouth }) {
  const line = { fill: 'none', stroke: INK, strokeWidth: 4, strokeLinecap: 'round' }
  switch (mouth) {
    case 'flat':
      return <path d="M40 68 H60" {...line} />
    case 'open':
      return <ellipse cx="50" cy="69" rx="7" ry="6" fill={INK} />
    case 'smirk':
      return <path d="M40 69 Q52 69 62 62" {...line} />
    case 'tongue':
      return (
        <g>
          <path d="M45 68 q5 13 10 0 z" fill="#FF6B81" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M38 66 Q50 76 62 66" {...line} />
        </g>
      )
    default:
      return <path d="M38 66 Q50 77 62 66" {...line} />
  }
}

function Extra({ extra, trim }) {
  switch (extra) {
    case 'cap':
      return (
        <g stroke={INK} strokeWidth="4" strokeLinejoin="round" fill={trim}>
          <path d="M19 40 Q20 12 50 12 Q80 12 81 40 Z" />
          <path d="M60 36 h30 q2 6 -2 8 h-28 z" />
        </g>
      )
    case 'glasses':
      return (
        <g fill="rgba(255,255,255,0.55)" stroke={INK} strokeWidth="3.5">
          <circle cx="38" cy="48" r="11" />
          <circle cx="62" cy="48" r="11" />
          <path d="M49 48 h2" fill="none" />
        </g>
      )
    case 'beanie':
      return (
        <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
          <path d="M20 38 Q20 8 50 8 Q80 8 80 38 Z" fill={trim} />
          <rect x="18" y="33" width="64" height="10" rx="4" fill={trim === INK ? '#FF6B6B' : '#FF9F43'} />
          <circle cx="50" cy="7" r="5" fill={trim === INK ? '#FF6B6B' : '#FF9F43'} />
        </g>
      )
    case 'mustache':
      return (
        <path
          d="M34 64 Q42 55 50 62 Q58 55 66 64 Q57 70 50 65 Q43 70 34 64 Z"
          fill={INK}
        />
      )
    case 'headband':
      return <rect x="17" y="29" width="66" height="9" rx="3" fill={trim} stroke={INK} strokeWidth="3" />
    default:
      return null
  }
}

// Domino mask for the impostor reveal. It replaces the eyes.
function Mask() {
  return (
    <g>
      <path d="M15 41 Q50 31 85 41 L81 59 Q67 53 58 57 Q50 51 42 57 Q33 53 19 59 Z" fill={INK} />
      <ellipse cx="38" cy="49" rx="8" ry="6" fill={PAPER} />
      <ellipse cx="62" cy="49" rx="8" ry="6" fill={PAPER} />
      <circle cx="39" cy="49" r="3" fill={INK} />
      <circle cx="63" cy="49" r="3" fill={INK} />
    </g>
  )
}

// A decorative face. It is hidden from screen readers (the player's name is
// always written out next to it) and carries no role information unless the
// screen is explicitly one that may reveal it (`masked` for a revealed
// impostor, `out` for an eliminated player).
export default function Avatar({ seat, size = 'md', masked = false, out = false }) {
  const spec = getAvatarSpec(seat)
  return (
    <svg
      className={`avatar avatar--${size}${out ? ' avatar--out' : ''}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <Head head={spec.head} color={spec.color} />
      {masked ? <Mask /> : <Eyes eyes={out ? 'x' : spec.eyes} />}
      <Mouth mouth={out ? 'flat' : spec.mouth} />
      <Extra extra={spec.extra} trim={spec.trim} />
    </svg>
  )
}
