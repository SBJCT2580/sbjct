import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { GameEngine } from '@/game/engine'
import type { GamePhase } from '@/game/types'

interface GameCanvasProps {
  onStateChange: (phase: GamePhase, p1Hp: number, p2Hp: number, winner: number) => void
}

export interface GameCanvasHandle {
  startGame: () => void
  resetGame: () => void
}

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  function GameCanvas({ onStateChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<GameEngine | null>(null)

    const handleStateChange = useCallback(
      (phase: GamePhase, p1Hp: number, p2Hp: number, winner: number) => {
        onStateChange(phase, p1Hp, p2Hp, winner)
      },
      [onStateChange]
    )

    useImperativeHandle(ref, () => ({
      startGame: () => {
        engineRef.current?.startGame()
      },
      resetGame: () => {
        engineRef.current?.resetGame()
      },
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resize()
      window.addEventListener('resize', resize)

      const engine = new GameEngine(canvas, handleStateChange)
      engineRef.current = engine
      engine.start()

      return () => {
        engine.stop()
        engineRef.current = null
        window.removeEventListener('resize', resize)
      }
    }, [handleStateChange])

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    )
  }
)

export default GameCanvas
