import { useCallback, useRef } from 'react'
import GameCanvas, { type GameCanvasHandle } from '@/components/GameCanvas'
import StartScreen from '@/components/StartScreen'
import HUD from '@/components/HUD'
import ResultScreen from '@/components/ResultScreen'
import { useGameStore } from '@/store/gameStore'
import type { GamePhase } from '@/game/types'

export default function Home() {
  const { phase, p1Hp, p2Hp, winner, updateState, reset } = useGameStore()
  const canvasRef = useRef<GameCanvasHandle>(null)

  const handleStateChange = useCallback(
    (newPhase: GamePhase, newP1Hp: number, newP2Hp: number, newWinner: number) => {
      updateState(newPhase, newP1Hp, newP2Hp, newWinner)
    },
    [updateState]
  )

  const handleStart = useCallback(() => {
    canvasRef.current?.startGame()
  }, [])

  const handleRestart = useCallback(() => {
    canvasRef.current?.resetGame()
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden" style={{ background: '#050510' }}>
      <GameCanvas ref={canvasRef} onStateChange={handleStateChange} />
      {phase === 'title' && <StartScreen onStart={handleStart} />}
      {phase === 'playing' && <HUD p1Hp={p1Hp} p2Hp={p2Hp} visible />}
      {phase === 'result' && winner >= 0 && (
        <ResultScreen winner={winner} onRestart={handleRestart} />
      )}
    </div>
  )
}
