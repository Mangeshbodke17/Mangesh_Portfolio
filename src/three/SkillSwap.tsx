import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { pointer } from './pointer'
import { skillIcons } from './skillIcons'

const RINGS = [
  { radius: 0.86, speed: 0.32, tilt: [1.05, 0.12, 0.18] as const, color: '#c4b5fd', count: 4 },
  { radius: 1.16, speed: -0.22, tilt: [0.62, 0.18, -0.7] as const, color: '#a78bfa', count: 4 },
  { radius: 1.42, speed: 0.15, tilt: [1.28, -0.08, 0.82] as const, color: '#7c3aed', count: 3 },
]

const CAMERA_Z = 7.2

function lockCamera(camera: THREE.Camera) {
  const view = camera as THREE.PerspectiveCamera
  view.position.set(0, 0, CAMERA_Z)
  view.fov = 34
  view.lookAt(0, 0, 0)
  view.updateProjectionMatrix()
}

function CameraLock() {
  const camera = useThree((state) => state.camera)
  useLayoutEffect(() => {
    lockCamera(camera)
  }, [camera])
  return null
}

function makeIconTexture(path: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, 512, 512)
  ctx.beginPath()
  ctx.arc(256, 256, 214, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(16, 12, 24, 0.82)'
  ctx.fill()
  ctx.lineWidth = 14
  ctx.strokeStyle = '#c4b5fd'
  ctx.stroke()

  const box = 236
  const pad = (512 - box) / 2
  const scale = box / 24
  ctx.save()
  ctx.translate(pad, pad)
  ctx.scale(scale, scale)
  ctx.fillStyle = color
  ctx.fill(new Path2D(path), 'evenodd')
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)
  const glow = ctx.createRadialGradient(128, 128, 8, 128, 128, 128)
  glow.addColorStop(0, 'rgba(196, 181, 253, 0.95)')
  glow.addColorStop(0.35, 'rgba(124, 58, 237, 0.45)')
  glow.addColorStop(1, 'rgba(124, 58, 237, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeDustTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)
  const dust = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  dust.addColorStop(0, 'rgba(247, 245, 255, 1)')
  dust.addColorStop(0.4, 'rgba(196, 181, 253, 0.7)')
  dust.addColorStop(1, 'rgba(196, 181, 253, 0)')
  ctx.fillStyle = dust
  ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function Core({ glow }: { glow: THREE.Texture }) {
  return (
    <group>
      <sprite scale={1.35}>
        <spriteMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshBasicMaterial color="#f7f5ff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Dust({ map }: { map: THREE.Texture }) {
  const positions = useMemo(() => {
    const count = 90
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const radius = 0.3 + Math.random() * 0.95
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72
      array[i * 3 + 2] = radius * Math.cos(phi)
    }
    return array
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        color="#c4b5fd"
        size={0.045}
        transparent
        depthWrite={false}
        toneMapped={false}
        alphaTest={0.05}
      />
    </points>
  )
}

const worldPoint = new THREE.Vector3()
const shownPoint = new THREE.Vector3()
const baseProjected = new THREE.Vector3()
const desiredOffset = new THREE.Vector3()
const cameraRight = new THREE.Vector3()
const cameraUp = new THREE.Vector3()

type Cursor = {
  x: number
  y: number
  down: boolean
  inside: boolean
  left: number
  top: number
  width: number
  height: number
}

function PointerWatch({ cursor }: { cursor: MutableRefObject<Cursor> }) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const read = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY
      cursor.current.x = x
      cursor.current.y = y
      cursor.current.down = event.buttons > 0
      cursor.current.left = rect.left
      cursor.current.top = rect.top
      cursor.current.width = rect.width
      cursor.current.height = rect.height
      cursor.current.inside =
        rect.width > 0 &&
        rect.height > 0 &&
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
    }
    const leave = () => {
      cursor.current.inside = false
      cursor.current.down = false
    }
    window.addEventListener('pointermove', read)
    window.addEventListener('pointerdown', read)
    window.addEventListener('pointerup', read)
    window.addEventListener('blur', leave)
    return () => {
      window.removeEventListener('pointermove', read)
      window.removeEventListener('pointerdown', read)
      window.removeEventListener('pointerup', read)
      window.removeEventListener('blur', leave)
      cursor.current.inside = false
      cursor.current.down = false
    }
  }, [cursor, gl])

  return null
}

function DodgeIcon({
  position,
  texture,
  still,
  cursor,
}: {
  position: readonly [number, number, number]
  texture: THREE.CanvasTexture
  still: boolean
  cursor: MutableRefObject<Cursor>
}) {
  const ref = useRef<THREE.Sprite>(null)
  const offset = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const sprite = ref.current
    const parent = sprite?.parent
    if (!sprite || !parent) return

    parent.updateWorldMatrix(true, false)
    worldPoint.set(position[0], position[1], position[2]).applyMatrix4(parent.matrixWorld)
    shownPoint.copy(worldPoint).add(offset.current)

    const view = state.camera as THREE.PerspectiveCamera
    const depth = Math.max(0.2, view.position.distanceTo(worldPoint))
    const halfH = Math.tan(THREE.MathUtils.degToRad(view.fov / 2)) * depth
    const halfW = halfH * view.aspect
    const point = cursor.current
    const viewH = Math.max(point.height, 1)
    const viewW = Math.max(point.width, 1)

    baseProjected.copy(worldPoint).project(view)
    const baseX = point.left + (baseProjected.x * 0.5 + 0.5) * viewW
    const baseY = point.top + (-baseProjected.y * 0.5 + 0.5) * viewH
    const homeDx = baseX - point.x
    const homeDy = baseY - point.y
    const homeDist = Math.hypot(homeDx, homeDy)
    const radiusPx = (0.21 / halfH) * (viewH / 2)
    const reach = radiusPx * 1.35
    const flee = radiusPx * (point.down ? 6.5 : 5)

    desiredOffset.set(0, 0, 0)
    if (!still && point.inside && homeDist < reach) {
      const len = homeDist < 1 ? 1 : homeDist
      const nx = homeDist < 1 ? 1 : homeDx / len
      const ny = homeDist < 1 ? 0 : homeDy / len
      const margin = radiusPx + 8
      const tx = THREE.MathUtils.clamp(
        point.x + nx * flee,
        point.left + margin,
        point.left + viewW - margin,
      )
      const ty = THREE.MathUtils.clamp(
        point.y + ny * flee,
        point.top + margin,
        point.top + viewH - margin,
      )
      const ndcX = ((tx - baseX) / viewW) * 2
      const ndcY = -((ty - baseY) / viewH) * 2
      cameraRight.setFromMatrixColumn(view.matrixWorld, 0)
      cameraUp.setFromMatrixColumn(view.matrixWorld, 1)
      desiredOffset.addScaledVector(cameraRight, ndcX * halfW)
      desiredOffset.addScaledVector(cameraUp, ndcY * halfH)
    }

    const blend = 1 - Math.exp(-22 * delta)
    offset.current.lerp(desiredOffset, blend)

    shownPoint.copy(worldPoint).add(offset.current)
    parent.worldToLocal(shownPoint)
    sprite.position.copy(shownPoint)
  })

  return (
    <sprite ref={ref} position={position} scale={0.42}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

function OrbitRing({
  radius,
  speed,
  tilt,
  color,
  textures,
  still,
  cursor,
}: {
  radius: number
  speed: number
  tilt: readonly [number, number, number]
  color: string
  textures: THREE.CanvasTexture[]
  still: boolean
  cursor: MutableRefObject<Cursor>
}) {
  const spin = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (still || !spin.current) return
    spin.current.rotation.y = clock.elapsedTime * speed
  })

  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.006, 10, 180]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <group ref={spin}>
        {textures.map((texture, index) => {
          const angle = (index / textures.length) * Math.PI * 2
          return (
            <DodgeIcon
              key={texture.uuid}
              texture={texture}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              still={still}
              cursor={cursor}
            />
          )
        })}
      </group>
    </group>
  )
}

function Galaxy({ cursor }: { cursor: MutableRefObject<Cursor> }) {
  const still = Boolean(useReducedMotion())
  const root = useRef<THREE.Group>(null)
  const textures = useMemo(
    () => skillIcons.map((icon) => makeIconTexture(icon.path, icon.color)),
    [],
  )
  const glow = useMemo(() => makeGlowTexture(), [])
  const dust = useMemo(() => makeDustTexture(), [])

  useEffect(() => {
    return () => {
      textures.forEach((texture) => texture.dispose())
      glow.dispose()
      dust.dispose()
    }
  }, [dust, glow, textures])

  const bands = useMemo(() => {
    let cursor = 0
    return RINGS.map((ring) => {
      const slice = textures.slice(cursor, cursor + ring.count)
      cursor += ring.count
      return { ...ring, textures: slice }
    })
  }, [textures])

  useFrame(({ clock }) => {
    if (!root.current) return
    const t = still ? 0 : clock.elapsedTime
    root.current.rotation.y = t * 0.08 + pointer.x * 0.08
    root.current.rotation.x = Math.sin(t * 0.2) * 0.05 + pointer.y * 0.04
  })

  return (
    <group ref={root}>
      <Core glow={glow} />
      <Dust map={dust} />
      {bands.map((ring) => (
        <OrbitRing
          key={ring.radius}
          radius={ring.radius}
          speed={ring.speed}
          tilt={ring.tilt}
          color={ring.color}
          textures={ring.textures}
          still={still}
          cursor={cursor}
        />
      ))}
    </group>
  )
}

export function SkillSwap() {
  const label = skillIcons.map((icon) => icon.name).join(', ')
  const cursor = useRef<Cursor>({
    x: 0,
    y: 0,
    down: false,
    inside: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  return (
    <div className="relative h-full w-full cursor-pointer" role="img" aria-label={`Skill icons orbiting in a galaxy: ${label}`}>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, CAMERA_Z], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, camera }) => {
          lockCamera(camera)
          gl.setClearColor(0x000000, 0)
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <CameraLock />
        <PointerWatch cursor={cursor} />
        <Galaxy cursor={cursor} />
      </Canvas>
    </div>
  )
}
