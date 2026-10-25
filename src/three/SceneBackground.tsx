import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { attachPointer, pointer } from './pointer'

function makeRoundStar() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const tex = new THREE.CanvasTexture(canvas)
  if (!ctx) return tex
  const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.4, 'rgba(255,255,255,0.75)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  tex.needsUpdate = true
  return tex
}

const starMap = makeRoundStar()

function makeParticleGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const seeded = Math.sin(i * 12.9898) * 43758.5453
    const rand = seeded - Math.floor(seeded)
    const rand2 = Math.sin(i * 78.233) * 43758.5453 - Math.floor(Math.sin(i * 78.233) * 43758.5453)
    const rand3 = Math.sin(i * 39.346) * 43758.5453 - Math.floor(Math.sin(i * 39.346) * 43758.5453)
    positions[i * 3] = (rand - 0.5) * 24
    positions[i * 3 + 1] = (rand2 - 0.5) * 18
    positions[i * 3 + 2] = (rand3 - 0.5) * 14
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geo
}

function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const geometry = useMemo(() => makeParticleGeometry(count), [count])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.012 + pointer.x * 0.08
    points.current.rotation.x = pointer.y * 0.05
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        map={starMap}
        size={0.04}
        color="#c4b5fd"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.05}
      />
    </points>
  )
}

function FarStars({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const geometry = useMemo(() => makeParticleGeometry(Math.floor(count * 0.35)), [count])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.012 + pointer.x * 0.08
    points.current.rotation.x = pointer.y * 0.05
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        map={starMap}
        size={0.07}
        color="#f4f0ff"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.05}
      />
    </points>
  )
}

function CameraRig() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      pointer.x * 0.7,
      0.035,
    )
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      pointer.y * 0.35,
      0.035,
    )
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function SceneBackground() {
  const layer = useRef<HTMLDivElement>(null)
  const [count] = useState(() =>
    window.matchMedia('(max-width: 768px)').matches ? 280 : 900,
  )

  useEffect(() => attachPointer(), [])

  useEffect(() => {
    const node = layer.current
    if (!node) return
    const onScroll = () => {
      const start = window.innerHeight * 0.7
      const end = window.innerHeight * 1.45
      const t = Math.min(Math.max((window.scrollY - start) / (end - start), 0), 1)
      node.style.opacity = String(t)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={layer}
      className="pointer-events-none fixed inset-0 z-0 opacity-0"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#100c18']} />
        <fog attach="fog" args={['#100c18', 7, 18]} />
        <ambientLight intensity={0.2} />
        <Particles count={count} />
        <FarStars count={count} />
        <CameraRig />
      </Canvas>
    </div>
  )
}
