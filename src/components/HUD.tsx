interface HUDProps {
  p1Hp: number
  p2Hp: number
  visible: boolean
}

export default function HUD({ p1Hp, p2Hp, visible }: HUDProps) {
  if (!visible) return null

  const p1Ratio = Math.max(0, p1Hp / 100)
  const p2Ratio = Math.max(0, p2Hp / 100)
  const p1Color = p1Ratio > 0.3 ? '#00d4ff' : '#ff3333'
  const p2Color = p2Ratio > 0.3 ? '#ff3366' : '#ff3333'

  return (
    <div className="fixed top-0 left-0 right-0 z-10 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-1">
          <p
            className="text-xs mb-1 tracking-wider"
            style={{ fontFamily: '"Press Start 2P", monospace', color: '#00d4ff' }}
          >
            P1
          </p>
          <div className="h-4 relative" style={{ background: '#0a0a15', border: '2px solid #2a2a4a' }}>
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${p1Ratio * 100}%`,
                background: `linear-gradient(180deg, ${p1Color}cc, ${p1Color})`,
                boxShadow: `0 0 8px ${p1Color}88`,
              }}
            />
            <div
              className="absolute top-0 left-0 h-1 transition-all duration-200"
              style={{
                width: `${p1Ratio * 100}%`,
                background: 'rgba(255,255,255,0.3)',
              }}
            />
          </div>
          <p
            className="text-xs mt-1"
            style={{ fontFamily: '"Press Start 2P", monospace', color: '#8888aa' }}
          >
            {Math.ceil(p1Hp)}/100
          </p>
        </div>

        <div
          className="text-lg font-bold px-3"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffd700',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
          }}
        >
          VS
        </div>

        <div className="flex-1">
          <p
            className="text-xs mb-1 tracking-wider text-right"
            style={{ fontFamily: '"Press Start 2P", monospace', color: '#ff3366' }}
          >
            P2
          </p>
          <div className="h-4 relative" style={{ background: '#0a0a15', border: '2px solid #2a2a4a' }}>
            <div
              className="h-full transition-all duration-200 ml-auto"
              style={{
                width: `${p2Ratio * 100}%`,
                background: `linear-gradient(180deg, ${p2Color}cc, ${p2Color})`,
                boxShadow: `0 0 8px ${p2Color}88`,
              }}
            />
            <div
              className="absolute top-0 right-0 h-1 transition-all duration-200 ml-auto"
              style={{
                width: `${p2Ratio * 100}%`,
                background: 'rgba(255,255,255,0.3)',
              }}
            />
          </div>
          <p
            className="text-xs mt-1 text-right"
            style={{ fontFamily: '"Press Start 2P", monospace', color: '#8888aa' }}
          >
            {Math.ceil(p2Hp)}/100
          </p>
        </div>
      </div>
    </div>
  )
}
