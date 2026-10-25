import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { attachPointer, pointer } from './pointer'

const NIGHT = '#100c18'

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

function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function makeField(count: number, spread: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (seeded(i + 1) - 0.5) * spread
    positions[i * 3 + 1] = (seeded(i + 19) - 0.42) * spread * 0.62
    positions[i * 3 + 2] = (seeded(i + 37) - 0.5) * spread * 0.8
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geo
}

function ParticleLayer({
  count,
  spread,
  size,
  color,
  speed,
  parallax,
}: {
  count: number
  spread: number
  size: number
  color: string
  speed: number
  parallax: number
}) {
  const points = useRef<THREE.Points>(null)
  const geometry = useMemo(() => makeField(count, spread), [count, spread])

  useFrame((state) => {
    if (!points.current) return
    const t = state.clock.elapsedTime
    points.current.rotation.y = t * speed + pointer.x * parallax
    points.current.rotation.x = Math.sin(t * speed) * 0.04 + pointer.y * parallax * 0.65
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        map={starMap}
        size={size}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.05}
      />
    </points>
  )
}

function makeWash() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const tex = new THREE.CanvasTexture(canvas)
  if (!ctx) return tex
  const fade = ctx.createLinearGradient(0, 0, 0, 256)
  fade.addColorStop(0, 'rgba(196,181,253,0)')
  fade.addColorStop(0.46, 'rgba(196,181,253,0.85)')
  fade.addColorStop(0.54, 'rgba(244,240,255,0.95)')
  fade.addColorStop(1, 'rgba(124,58,237,0)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, 1024, 256)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

function MilkyBand() {
  const map = useMemo(() => makeWash(), [])
  const band = useRef<THREE.Mesh>(null)

  useEffect(
    () => () => {
      map.dispose()
    },
    [map],
  )

  useFrame((state) => {
    if (!band.current) return
    const t = state.clock.elapsedTime
    band.current.position.x = Math.sin(t * 0.05) * 0.6 + pointer.x * 0.8
    band.current.rotation.z = Math.sin(t * 0.04) * 0.04
  })

  return (
    <mesh ref={band} position={[0, 1.1, -18]} rotation={[0.15, 0, -0.18]}>
      <planeGeometry args={[36, 7]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={0.28}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function HorizonGlow() {
  const map = useMemo(() => makeWash(), [])

  useEffect(
    () => () => {
      map.dispose()
    },
    [map],
  )

  return (
    <mesh position={[0, -2.6, -12]} rotation={[-0.35, 0, 0]}>
      <planeGeometry args={[42, 6]} />
      <meshBasicMaterial
        map={map}
        color="#7c3aed"
        transparent
        opacity={0.22}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function Glow() {
  const light = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!light.current) return
    const t = state.clock.elapsedTime
    light.current.position.x = Math.sin(t * 0.15) * 2 + pointer.x * 1.4
    light.current.position.y = -0.4 + pointer.y * 0.4
  })

  return <pointLight ref={light} position={[0, -0.2, 2]} color="#7c3aed" intensity={18} distance={16} />
}

function NightRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      pointer.x * 0.85 + Math.sin(t * 0.08) * 0.15,
      0.045,
    )
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      0.35 + pointer.y * 0.35,
      0.045,
    )
    state.camera.lookAt(0, -0.35, -6)
  })
  return null
}

function NightWorld({ mobile }: { mobile: boolean }) {
  return (
    <>
      <color attach="background" args={[NIGHT]} />
      <fog attach="fog" args={[NIGHT, 7, 20]} />
      <ambientLight intensity={0.25} />
      <Glow />
      <MilkyBand />
      <HorizonGlow />
      <ParticleLayer
        count={mobile ? 520 : 1200}
        spread={26}
        size={0.034}
        color="#c4b5fd"
        speed={0.012}
        parallax={0.16}
      />
      <ParticleLayer
        count={mobile ? 90 : 180}
        spread={18}
        size={0.07}
        color="#f7f4ff"
        speed={0.018}
        parallax={0.28}
      />
      <ParticleLayer
        count={mobile ? 18 : 36}
        spread={14}
        size={0.12}
        color="#ffffff"
        speed={0.01}
        parallax={0.36}
      />
      <NightRig />
    </>
  )
}

export function SkyField() {
  const [mobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches,
  )

  useEffect(() => attachPointer(), [])

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: [0, 0.35, 8], fov: 42, near: 0.1, far: 80 }}
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      gl={{
        antialias: !mobile,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(NIGHT, 1)
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <NightWorld mobile={mobile} />
    </Canvas>
  )
}
