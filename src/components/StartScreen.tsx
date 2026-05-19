import { useCallback, useState } from 'react'

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [hovered, setHovered] = useState(false)

  const handleStart = useCallback(() => {
    onStart()
  }, [onStart])

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto text-center">
        <div className="mb-8">
          <h1
            className="text-5xl font-bold tracking-wider mb-2"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.4)',
              color: '#00d4ff',
            }}
          >
            PIXEL
          </h1>
          <h1
            className="text-5xl font-bold tracking-wider mb-4"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '0 0 20px rgba(255, 51, 102, 0.8), 0 0 40px rgba(255, 51, 102, 0.4)',
              color: '#ff3366',
            }}
          >
            MECHA
          </h1>
          <p
            className="text-lg tracking-widest"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffd700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
            }}
          >
            COMBAT
          </p>
        </div>

        <div
          className="mb-8 p-4 rounded"
          style={{
            background: 'rgba(26, 26, 46, 0.9)',
            border: '2px solid #2a2a4a',
          }}
        >
          <div className="grid grid-cols-2 gap-6 text-xs" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            <div className="text-left">
              <p className="mb-2" style={{ color: '#00d4ff' }}>P1 BLUE</p>
              <p style={{ color: '#8888aa' }}>A/D Move</p>
              <p style={{ color: '#8888aa' }}>J Attack</p>
              <p style={{ color: '#8888aa' }}>K Defend</p>
            </div>
            <div className="text-left">
              <p className="mb-2" style={{ color: '#ff3366' }}>P2 RED</p>
              <p style={{ color: '#8888aa' }}>&larr;/&rarr; Move</p>
              <p style={{ color: '#8888aa' }}>L Attack</p>
              <p style={{ color: '#8888aa' }}>; Defend</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
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
          START GAME
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
