export type MechaState = 'idle' | 'walk' | 'attack' | 'defend' | 'hurt'
export type GamePhase = 'title' | 'playing' | 'result'
export type Facing = 1 | -1

export interface MechaColors {
  primary: string
  dark: string
  accent: string
  visor: string
  joint: string
  glow: string
}

export interface Mecha {
  x: number
  y: number
  vx: number
  hp: number
  maxHp: number
  facing: Facing
  state: MechaState
  stateTimer: number
  animFrame: number
  attackHit: boolean
  colors: MechaColors
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface Star {
  x: number
  y: number
  brightness: number
  twinkleSpeed: number
}

export interface Building {
  x: number
  width: number
  height: number
  color: string
  windows: { wx: number; wy: number; lit: boolean }[]
}

export const INTERNAL_WIDTH = 320
export const INTERNAL_HEIGHT = 180
export const GROUND_Y = 148
export const WALK_SPEED = 1.4
export const ATTACK_DURATION = 24
export const ATTACK_HIT_START = 3
export const ATTACK_HIT_END = 14
export const HURT_DURATION = 14
export const KNOCKBACK_SPEED = 3
export const ATTACK_DAMAGE = 12
export const DEFEND_DAMAGE = 5
export const MAX_HP = 100
export const MECHA_WIDTH = 20
export const MECHA_HEIGHT = 22
export const ATTACK_RANGE = 34
export const ARENA_LEFT = 10
export const ARENA_RIGHT = 310

export const BLUE_COLORS: MechaColors = {
  primary: '#00d4ff',
  dark: '#0088aa',
  accent: '#004466',
  visor: '#ffffff',
  joint: '#5588aa',
  glow: '#00aaff',
}

export const RED_COLORS: MechaColors = {
  primary: '#ff3366',
  dark: '#aa2244',
  accent: '#661133',
  visor: '#ffffff',
  joint: '#aa5577',
  glow: '#ff2266',
}
