import { create } from 'zustand'
import type { GamePhase } from '@/game/types'

interface GameState {
  phase: GamePhase
  p1Hp: number
  p2Hp: number
  winner: number
  updateState: (phase: GamePhase, p1Hp: number, p2Hp: number, winner: number) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'title',
  p1Hp: 100,
  p2Hp: 100,
  winner: -1,
  updateState: (phase: GamePhase, p1Hp: number, p2Hp: number, winner: number) => {
    set({ phase, p1Hp, p2Hp, winner })
  },
  reset: () => {
    set({ phase: 'title', p1Hp: 100, p2Hp: 100, winner: -1 })
  },
}))
