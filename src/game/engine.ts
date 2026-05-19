import {
  type Mecha,
  type Particle,
  type Star,
  type Building,
  type GamePhase,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
  GROUND_Y,
  WALK_SPEED,
  ATTACK_DURATION,
  ATTACK_HIT_START,
  ATTACK_HIT_END,
  HURT_DURATION,
  KNOCKBACK_SPEED,
  ATTACK_DAMAGE,
  DEFEND_DAMAGE,
  MAX_HP,
  MECHA_WIDTH,
  ATTACK_RANGE,
  ARENA_LEFT,
  ARENA_RIGHT,
  BLUE_COLORS,
  RED_COLORS,
} from './types'
import {
  generateStars,
  generateBuildings,
  drawBackground,
  drawMecha,
  drawHPBar,
  drawParticle,
} from './renderer'

type StateCallback = (
  phase: GamePhase,
  p1Hp: number,
  p2Hp: number,
  winner: number
) => void

const P1_KEYS = { left: 'a', right: 'd', attack: 'j', defend: 'k' }
const P2_KEYS = { left: 'ArrowLeft', right: 'ArrowRight', attack: 'l', defend: ';' }

function createMecha(x: number, facing: 1 | -1, colors: Mecha['colors']): Mecha {
  return {
    x,
    y: GROUND_Y - 22,
    vx: 0,
    hp: MAX_HP,
    maxHp: MAX_HP,
    facing,
    state: 'idle',
    stateTimer: 0,
    animFrame: 0,
    attackHit: false,
    colors,
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private buffer: HTMLCanvasElement
  private bufCtx: CanvasRenderingContext2D
  private animId = 0
  private keys = new Set<string>()
  private mechas: [Mecha, Mecha]
  private particles: Particle[] = []
  private phase: GamePhase = 'title'
  private winner = -1
  private screenShake = 0
  private flashTimer = 0
  private onStateChange: StateCallback
  private frameCount = 0
  private stars: Star[]
  private buildings: Building[]
  private titleAnimFrame = 0
  private running = false

  constructor(canvas: HTMLCanvasElement, onStateChange: StateCallback) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.onStateChange = onStateChange
    this.buffer = document.createElement('canvas')
    this.buffer.width = INTERNAL_WIDTH
    this.buffer.height = INTERNAL_HEIGHT
    this.bufCtx = this.buffer.getContext('2d')!
    this.mechas = [
      createMecha(60, 1, BLUE_COLORS),
      createMecha(240, -1, RED_COLORS),
    ]
    this.stars = generateStars(60)
    this.buildings = generateBuildings()
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.loop = this.loop.bind(this)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.keys.add(e.key)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (this.phase === 'title') {
        this.startGame()
      } else if (this.phase === 'result') {
        this.resetGame()
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.key)
  }

  start() {
    this.running = true
    this.loop()
  }

  stop() {
    this.running = false
    if (this.animId) {
      cancelAnimationFrame(this.animId)
    }
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  startGame() {
    this.phase = 'playing'
    this.mechas = [
      createMecha(60, 1, BLUE_COLORS),
      createMecha(240, -1, RED_COLORS),
    ]
    this.particles = []
    this.screenShake = 0
    this.winner = -1
    this.notifyState()
  }

  resetGame() {
    this.phase = 'title'
    this.mechas = [
      createMecha(60, 1, BLUE_COLORS),
      createMecha(240, -1, RED_COLORS),
    ]
    this.particles = []
    this.screenShake = 0
    this.winner = -1
    this.titleAnimFrame = 0
    this.notifyState()
  }

  getPhase() {
    return this.phase
  }

  private notifyState() {
    this.onStateChange(
      this.phase,
      this.mechas[0].hp,
      this.mechas[1].hp,
      this.winner
    )
  }

  private loop() {
    if (!this.running) return
    this.frameCount++
    if (this.phase === 'playing') {
      this.updateGame()
    } else if (this.phase === 'title') {
      this.titleAnimFrame++
    }
    this.render()
    this.animId = requestAnimationFrame(this.loop)
  }

  private updateGame() {
    const [p1, p2] = this.mechas
    this.updateFacing()
    this.updateMecha(p1, P1_KEYS)
    this.updateMecha(p2, P2_KEYS)
    this.checkCombat(p1, p2)
    this.checkCombat(p2, p1)
    for (const m of this.mechas) {
      m.x += m.vx
      m.vx *= 0.85
      if (m.x < ARENA_LEFT) m.x = ARENA_LEFT
      if (m.x > ARENA_RIGHT) m.x = ARENA_RIGHT
    }
    this.updateParticles()
    if (this.screenShake > 0) this.screenShake -= 0.5
    if (this.flashTimer > 0) this.flashTimer--
    if (p1.hp <= 0 && this.winner === -1) {
      this.winner = 1
      this.phase = 'result'
      this.spawnVictoryParticles(p2)
      this.notifyState()
    } else if (p2.hp <= 0 && this.winner === -1) {
      this.winner = 0
      this.phase = 'result'
      this.spawnVictoryParticles(p1)
      this.notifyState()
    }
    this.notifyState()
  }

  private updateMecha(mecha: Mecha, keys: typeof P1_KEYS) {
    mecha.animFrame++
    if (mecha.state === 'hurt') {
      mecha.stateTimer--
      mecha.vx = mecha.facing === 1 ? -KNOCKBACK_SPEED : KNOCKBACK_SPEED
      if (mecha.stateTimer <= 0) {
        mecha.state = 'idle'
        mecha.vx = 0
      }
      return
    }
    if (mecha.state === 'attack') {
      mecha.stateTimer--
      if (mecha.stateTimer <= 0) {
        mecha.state = 'idle'
        mecha.attackHit = false
      }
      return
    }
    if (this.keys.has(keys.defend)) {
      if (mecha.state !== 'defend') {
        mecha.state = 'defend'
        mecha.vx = 0
      }
      return
    } else if (mecha.state === 'defend') {
      mecha.state = 'idle'
    }
    if (this.keys.has(keys.attack)) {
      mecha.state = 'attack'
      mecha.stateTimer = ATTACK_DURATION
      mecha.attackHit = false
      mecha.animFrame = 0
      mecha.vx = 0
      return
    }
    let moving = false
    if (this.keys.has(keys.left)) {
      mecha.vx = -WALK_SPEED
      moving = true
    } else if (this.keys.has(keys.right)) {
      mecha.vx = WALK_SPEED
      moving = true
    }
    mecha.state = moving ? 'walk' : 'idle'
  }

  private updateFacing() {
    const [p1, p2] = this.mechas
    if (p1.state !== 'hurt') {
      p1.facing = p1.x < p2.x ? 1 : -1
    }
    if (p2.state !== 'hurt') {
      p2.facing = p2.x < p1.x ? 1 : -1
    }
  }

  private checkCombat(attacker: Mecha, defender: Mecha) {
    if (attacker.state !== 'attack') return
    if (attacker.attackHit) return
    const elapsed = ATTACK_DURATION - attacker.stateTimer
    if (elapsed < ATTACK_HIT_START || elapsed > ATTACK_HIT_END) return
    const attackX =
      attacker.facing === 1
        ? attacker.x + MECHA_WIDTH
        : attacker.x - ATTACK_RANGE
    const attackBox = { x: attackX, y: attacker.y, w: ATTACK_RANGE, h: 22 }
    const defenderBox = { x: defender.x, y: defender.y, w: MECHA_WIDTH, h: 22 }
    if (
      attackBox.x < defenderBox.x + defenderBox.w &&
      attackBox.x + attackBox.w > defenderBox.x &&
      attackBox.y < defenderBox.y + defenderBox.h &&
      attackBox.y + attackBox.h > defenderBox.y
    ) {
      attacker.attackHit = true
      const isDefending = defender.state === 'defend'
      const damage = isDefending ? DEFEND_DAMAGE : ATTACK_DAMAGE
      defender.hp = Math.max(0, defender.hp - damage)
      defender.state = 'hurt'
      defender.stateTimer = HURT_DURATION
      this.screenShake = isDefending ? 2 : 5
      this.flashTimer = 4
      const hitX = defender.x + MECHA_WIDTH / 2
      const hitY = defender.y + 11
      this.spawnHitParticles(hitX, hitY, isDefending, attacker.colors.glow)
      if (isDefending) {
        this.spawnDefendParticles(hitX, hitY, defender.colors.glow)
      }
    }
  }

  private spawnHitParticles(x: number, y: number, blocked: boolean, color: string) {
    const count = blocked ? 6 : 12
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 2
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 15 + Math.floor(Math.random() * 10),
        maxLife: 25,
        color: blocked ? color : '#ffaa33',
        size: blocked ? 1 : 1 + Math.floor(Math.random() * 2),
      })
    }
    if (!blocked) {
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: -2 - Math.random() * 2,
          life: 10 + Math.floor(Math.random() * 8),
          maxLife: 18,
          color: '#ffffff',
          size: 1,
        })
      }
    }
  }

  private spawnDefendParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2
      this.particles.push({
        x: x + Math.cos(angle) * 8,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * 1.5,
        vy: Math.sin(angle) * 1.5,
        life: 12,
        maxLife: 12,
        color,
        size: 2,
      })
    }
  }

  private spawnVictoryParticles(mecha: Mecha) {
    const cx = mecha.x + MECHA_WIDTH / 2
    const cy = mecha.y + 11
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 30 + Math.floor(Math.random() * 30),
        maxLife: 60,
        color: mecha.colors.primary,
        size: 1 + Math.floor(Math.random() * 2),
      })
    }
  }

  private updateParticles() {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.life--
      return p.life > 0
    })
  }

  private render() {
    const ctx = this.bufCtx
    ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT)
    drawBackground(ctx, this.stars, this.buildings, this.frameCount)
    if (this.phase === 'title') {
      this.renderTitle(ctx)
    } else {
      this.renderGame(ctx)
    }
    this.ctx.imageSmoothingEnabled = false
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    let shakeX = 0
    let shakeY = 0
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake * 2
      shakeY = (Math.random() - 0.5) * this.screenShake * 2
    }
    const scaleX = this.canvas.width / INTERNAL_WIDTH
    const scaleY = this.canvas.height / INTERNAL_HEIGHT
    const scale = Math.min(scaleX, scaleY)
    const drawW = INTERNAL_WIDTH * scale
    const drawH = INTERNAL_HEIGHT * scale
    const offsetX = (this.canvas.width - drawW) / 2 + shakeX
    const offsetY = (this.canvas.height - drawH) / 2 + shakeY
    this.ctx.drawImage(this.buffer, offsetX, offsetY, drawW, drawH)
    if (this.flashTimer > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashTimer * 0.08})`
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  private renderTitle(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT)
    drawMecha(ctx, 80, GROUND_Y - 22, 1, 'idle', this.titleAnimFrame, BLUE_COLORS, false)
    drawMecha(ctx, 220, GROUND_Y - 22, -1, 'idle', this.titleAnimFrame, RED_COLORS, false)
  }

  private renderGame(ctx: CanvasRenderingContext2D) {
    const [p1, p2] = this.mechas
    for (const m of this.mechas) {
      drawMecha(ctx, m.x, m.y, m.facing, m.state, m.animFrame, m.colors, m.state === 'hurt')
    }
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife
      drawParticle(ctx, p.x, p.y, p.size, p.color, alpha)
    }
    drawHPBar(ctx, 10, 6, 120, p1.hp, p1.maxHp, '#00d4ff', false)
    drawHPBar(ctx, 190, 6, 120, p2.hp, p2.maxHp, '#ff3366', true)
    ctx.font = '4px monospace'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#00d4ff'
    ctx.fillText('P1', 10, 4)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#ff3366'
    ctx.fillText('P2', 310, 4)
    if (this.phase === 'result') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT)
    }
  }
}
