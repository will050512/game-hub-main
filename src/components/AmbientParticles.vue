<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  colorIndex: number
  pulsePhase: number
}

const props = withDefaults(defineProps<{
  count?: number
  colors?: string[]
  speed?: number
  maxSize?: number
  minSize?: number
}>(), {
  count: 30,
  colors: () => [
    'rgba(142, 207, 173, 0.25)',
    'rgba(245, 168, 194, 0.25)',
    'rgba(240, 180, 75, 0.2)',
    'rgba(169, 139, 216, 0.2)',
    'rgba(0, 212, 255, 0.18)',
  ],
  speed: 0.4,
  maxSize: 6,
  minSize: 2,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId = 0
let particles: Particle[] = []
let frameCount = 0

// Detect if we should enable particles (desktop/tablet only)
const isMobile = (): boolean => {
  return window.innerWidth < 768
}

function createParticle(canvas: HTMLCanvasElement): Particle {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * props.speed,
    vy: (Math.random() - 0.5) * props.speed,
    size: props.minSize + Math.random() * (props.maxSize - props.minSize),
    alpha: 0.15 + Math.random() * 0.2,
    colorIndex: Math.floor(Math.random() * props.colors.length),
    pulsePhase: Math.random() * Math.PI * 2,
  }
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const parent = canvas.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function drawParticles(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width / (window.devicePixelRatio || 1)
  const height = canvas.height / (window.devicePixelRatio || 1)

  ctx.clearRect(0, 0, width, height)

  for (const p of particles) {
    // Pulse effect
    const pulse = Math.sin(frameCount * 0.02 + p.pulsePhase) * 0.5 + 0.5
    const currentAlpha = p.alpha * (0.5 + pulse * 0.5)

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * (0.7 + pulse * 0.3), 0, Math.PI * 2)
    ctx.fillStyle = (props.colors[p.colorIndex] ?? 'rgba(255,255,255,0.2)').replace(/[\d.]+\)$/, `${currentAlpha})`)
    ctx.fill()

    // Glow
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
    ctx.fillStyle = (props.colors[p.colorIndex] ?? 'rgba(255,255,255,0.2)').replace(/[\d.]+\)$/, `${currentAlpha * 0.3})`)
    ctx.fill()
  }

  // Draw connections
  const len = particles.length
  for (let i = 0; i < len; i++) {
    const pi = particles[i]!
    for (let j = i + 1; j < len; j++) {
      const pj = particles[j]!
      const dx = pi.x - pj.x
      const dy = pi.y - pj.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.08
        ctx.beginPath()
        ctx.moveTo(pi.x, pi.y)
        ctx.lineTo(pj.x, pj.y)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

function updateParticles(): void {
  const canvas = canvasRef.value
  if (!canvas) return

  const width = canvas.width / (window.devicePixelRatio || 1)
  const height = canvas.height / (window.devicePixelRatio || 1)

  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.pulsePhase += 0.03

    // Wrap around edges
    if (p.x < 0) p.x = width
    if (p.x > width) p.x = 0
    if (p.y < 0) p.y = height
    if (p.y > height) p.y = 0
  }
}

function animate(): void {
  frameCount++
  const canvas = canvasRef.value
  if (canvas) {
    updateParticles()
    drawParticles(canvas)
  }
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  resizeCanvas(canvas)
  particles = Array.from({ length: props.count }, () => createParticle(canvas))
  animate()

  const handleResize = (): void => {
    resizeCanvas(canvas)
  }
  window.addEventListener('resize', handleResize)

  // Cleanup
  const cleanup = (): void => {
    window.removeEventListener('resize', handleResize)
  }
  onUnmounted(cleanup)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas ref="canvasRef" class="ambient-particles" aria-hidden="true"></canvas>
</template>

<style scoped>
.ambient-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
