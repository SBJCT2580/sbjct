import { useCallback, useState } from 'react'

interface ResultScreenProps {
  winner: number
  onRestart: () => void
}

export default function ResultScreen({ winner, onRestart }: ResultScreenProps) {
  const [hovered, setHovered] = useState(false)
  const isP1 = winner === 0
  const winColor = isP1 ? '#00d4ff' : '#ff3366'
  const winLabel = isP1 ? 'P1 BLUE' : 'P2 RED'

  const handleRestart = useCallback(() => {
    onRestart()
  }, [onRestart])

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(5, 5, 16, 0.7)' }}>
      <div className="text-center">
        <div className="mb-6">
          <p
            className="text-4xl font-bold tracking-wider mb-3"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: winColor,
              textShadow: `0 0 30px ${winColor}88, 0 0 60px ${winColor}44`,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            {winLabel}
          </p>
          <p
            className="text-2xl font-bold tracking-wider"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffd700',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
            }}
          >
            WINS!
          </p>
        </div>

        <div className="mb-8">
          <p
            className="text-sm tracking-widest"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffd700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
            }}
          >
            &#9733; VICTORY &#9733;
          </p>
        </div>

        <button
          onClick={handleRestart}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="px-8 py-3 text-sm tracking-wider transition-all duration-150"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            background: hovered
              ? 'linear-gradient(180deg, #ffd700, #cc9900)'
              : 'linear-gradient(180deg, #ffd700, #e6a800)',
            color: '#0a0a1a',
            border: '3px solid',
            borderColor: hovered ? '#ffee88' : '#cc9900',
            borderBottomWidth: '4px',
            borderRightWidth: '4px',
            boxShadow: hovered
              ? '0 0 20px rgba(255, 215, 0, 0.6)'
              : '0 4px 0 #996600',
            transform: hovered ? 'translateY(2px)' : 'none',
          }}
        >
          PLAY AGAIN
        </button>

        <p
          className="mt-4 text-xs animate-pulse"
          style={{ fontFamily: '"Press Start 2P", monospace', color: '#8888aa' }}
        >
          OR PRESS SPACE
        </p>
      </div>
    </div>
  )
}
