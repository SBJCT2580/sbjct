import {
  type MechaColors,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
  GROUND_Y,
  type Star,
  type Building,
} from './types'

export function generateStars(count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * INTERNAL_WIDTH,
      y: Math.random() * (GROUND_Y - 40),
      brightness: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.02 + Math.random() * 0.04,
    })
  }
  return stars
}

export function generateBuildings(): Building[] {
  const buildings: Building[] = []
  let x = 0
  while (x < INTERNAL_WIDTH) {
    const width = 15 + Math.floor(Math.random() * 25)
    const height = 20 + Math.floor(Math.random() * 50)
    const shade = Math.floor(Math.random() * 3)
    const colors = ['#0d0d1a', '#111122', '#0a0a15']
    const windows: Building['windows'] = []
    for (let wy = 4; wy < height - 4; wy += 6) {
      for (let wx = 3; wx < width - 3; wx += 5) {
        windows.push({ wx, wy, lit: Math.random() > 0.6 })
      }
    }
    buildings.push({ x, width, height, color: colors[shade], windows })
    x += width + Math.floor(Math.random() * 5)
  }
  return buildings
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  buildings: Building[],
  frame: number
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  gradient.addColorStop(0, '#050510')
  gradient.addColorStop(0.5, '#0a0a20')
  gradient.addColorStop(1, '#151530')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, INTERNAL_WIDTH, GROUND_Y)

  for (const star of stars) {
    const twinkle = Math.sin(frame * star.twinkleSpeed) * 0.3 + 0.7
    const alpha = star.brightness * twinkle
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1)
  }

  for (const b of buildings) {
    ctx.fillStyle = b.color
    const by = GROUND_Y - b.height
    ctx.fillRect(b.x, by, b.width, b.height)

    for (const w of b.windows) {
      if (w.lit) {
        const flicker = Math.sin(frame * 0.01 + w.wx * 3) > -0.8
        ctx.fillStyle = flicker
          ? 'rgba(255, 220, 100, 0.6)'
          : 'rgba(255, 220, 100, 0.2)'
      } else {
        ctx.fillStyle = 'rgba(100, 100, 150, 0.15)'
      }
      ctx.fillRect(b.x + w.wx, by + w.wy, 2, 3)
    }
  }

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, GROUND_Y, INTERNAL_WIDTH, INTERNAL_HEIGHT - GROUND_Y)

  ctx.fillStyle = '#252540'
  ctx.fillRect(0, GROUND_Y, INTERNAL_WIDTH, 2)

  for (let i = 0; i < INTERNAL_WIDTH; i += 16) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.fillRect(i, GROUND_Y + 2, 1, INTERNAL_HEIGHT - GROUND_Y - 2)
  }

  const glowGrad = ctx.createRadialGradient(
    INTERNAL_WIDTH / 2, GROUND_Y, 10,
    INTERNAL_WIDTH / 2, GROUND_Y, 120
  )
  glowGrad.addColorStop(0, 'rgba(100, 80, 200, 0.08)')
  glowGrad.addColorStop(1, 'rgba(100, 80, 200, 0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, GROUND_Y - 60, INTERNAL_WIDTH, 80)
}

export function drawMecha(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: 1 | -1,
  state: string,
  animFrame: number,
  colors: MechaColors,
  hurt: boolean
) {
  ctx.save()
  ctx.translate(Math.floor(x), Math.floor(y))
  if (facing === -1) {
    ctx.scale(-1, 1)
  }

  if (hurt && Math.floor(animFrame / 2) % 2 === 0) {
    ctx.globalAlpha = 0.4
  }

  const d = (rx: number, ry: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(rx, ry, rw, rh)
  }

  // Antenna
  d(9, -2, 2, 2, colors.accent)

  // Head
  d(5, 0, 10, 3, colors.dark)
  d(6, 0, 8, 1, colors.primary)
  d(6, 1, 8, 1, colors.visor)
  d(7, 1, 2, 1, colors.glow)
  d(11, 1, 2, 1, colors.glow)
  d(5, 2, 10, 1, colors.dark)
  d(5, 3, 10, 2, colors.primary)

  // Neck
  d(7, 5, 6, 1, colors.joint)

  // Shoulders
  d(2, 6, 4, 4, colors.dark)
  d(3, 7, 2, 2, colors.primary)
  d(14, 6, 4, 4, colors.dark)
  d(15, 7, 2, 2, colors.primary)

  // Body
  d(6, 6, 8, 3, colors.primary)
  d(7, 7, 6, 1, colors.accent)
  d(6, 9, 8, 3, colors.dark)
  d(7, 10, 6, 1, colors.accent)
  d(6, 12, 8, 2, colors.primary)

  // Arms & Attack/Defend
  if (state === 'attack') {
    const progress = (animFrame % 28) / 28
    // Back arm (idle)
    d(2, 10, 3, 5, colors.primary)
    d(2, 15, 3, 2, colors.dark)

    if (progress < 0.25) {
      // Wind up
      d(15, 9, 3, 4, colors.primary)
      d(15, 13, 3, 2, colors.dark)
    } else if (progress < 0.5) {
      // Strike!
      d(15, 8, 6, 3, colors.primary)
      d(21, 7, 5, 5, colors.dark)
      d(22, 8, 3, 3, colors.visor)
      // Impact flash
      d(25, 6, 3, 2, '#ffffff')
      d(26, 8, 2, 3, '#ffffff')
    } else if (progress < 0.65) {
      // Hold
      d(15, 8, 4, 3, colors.primary)
      d(19, 7, 4, 4, colors.dark)
    } else {
      // Recovery
      d(15, 10, 3, 5, colors.primary)
      d(15, 15, 3, 2, colors.dark)
    }
  } else if (state === 'defend') {
    // Both arms forward with shield
    d(14, 8, 5, 5, colors.primary)
    d(2, 8, 5, 5, colors.primary)
    // Shield glow
    ctx.globalAlpha = 0.5 + Math.sin(animFrame * 0.15) * 0.2
    d(17, 5, 4, 12, colors.glow + 'aa')
    d(18, 4, 2, 14, colors.glow + '66')
    ctx.globalAlpha = hurt && Math.floor(animFrame / 2) % 2 === 0 ? 0.4 : 1
  } else {
    // Idle/Walk arms
    const armSwing = state === 'walk' ? Math.sin(animFrame * 0.3) * 2 : 0
    d(2, 10 + armSwing, 3, 5, colors.primary)
    d(2, 15 + armSwing, 3, 2, colors.dark)
    d(15, 10 - armSwing, 3, 5, colors.primary)
    d(15, 15 - armSwing, 3, 2, colors.dark)
  }

  // Waist
  d(7, 14, 6, 1, colors.joint)

  // Legs
  const legBaseY = 15
  if (state === 'walk') {
    const legSwing = Math.sin(animFrame * 0.3) * 3
    d(6, legBaseY + legSwing, 3, 5, colors.dark)
    d(5, legBaseY + 5 + legSwing, 4, 2, colors.primary)
    d(11, legBaseY - legSwing, 3, 5, colors.dark)
    d(11, legBaseY + 5 - legSwing, 4, 2, colors.primary)
  } else if (state === 'hurt') {
    d(5, legBaseY + 1, 3, 5, colors.dark)
    d(4, legBaseY + 6, 4, 2, colors.primary)
    d(12, legBaseY + 1, 3, 5, colors.dark)
    d(12, legBaseY + 6, 4, 2, colors.primary)
  } else {
    d(6, legBaseY, 3, 5, colors.dark)
    d(5, legBaseY + 5, 4, 2, colors.primary)
    d(11, legBaseY, 3, 5, colors.dark)
    d(11, legBaseY + 5, 4, 2, colors.primary)
  }

  // Defend aura
  if (state === 'defend') {
    ctx.globalAlpha = 0.15 + Math.sin(animFrame * 0.15) * 0.05
    d(1, -1, 18, 24, colors.glow + '44')
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

export function drawHPBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  hp: number,
  maxHp: number,
  color: string,
  flip: boolean
) {
  const ratio = Math.max(0, hp / maxHp)

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x - 1, y - 1, width + 2, 8)

  ctx.fillStyle = '#0a0a15'
  ctx.fillRect(x, y, width, 6)

  const barWidth = Math.floor(width * ratio)
  if (flip) {
    const barX = x + width - barWidth
    ctx.fillStyle = ratio > 0.3 ? color : '#ff3333'
    ctx.fillRect(barX, y + 1, barWidth, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(barX, y + 1, barWidth, 1)
  } else {
    ctx.fillStyle = ratio > 0.3 ? color : '#ff3333'
    ctx.fillRect(x, y + 1, barWidth, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(x, y + 1, barWidth, 1)
  }
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number
) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size)
  ctx.globalAlpha = 1
}
