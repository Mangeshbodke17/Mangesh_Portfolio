import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Component,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { cruise, FLIGHT_DURATION, MOBILE_FLIGHT_DURATION, flight } from './flight'
import { attachPointer, pointer } from './pointer'

const MODEL = '/hero/airplane.glb'
const TARGET_LENGTH = 6.9
const START_X = -10
const MOBILE_START_X = -5.4
const END_X = 17
const tailLocal = new THREE.Vector3()
const tailWorld = new THREE.Vector3()

class JetBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state: { message: string | null } = { message: null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SkyHero', error, info)
  }

  render() {
    if (this.state.message) {
      return (
        <p className="absolute bottom-8 left-6 z-30 max-w-lg text-sm font-medium text-red-700">
          Jet failed: {this.state.message}
        </p>
      )
    }
    return this.props.children
  }
}

function findMesh(root: THREE.Object3D) {
  let found: THREE.Mesh | undefined
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!found && (mesh.isMesh || Boolean(mesh.geometry))) found = mesh
  })
  return found
}

function describeGraph(root: THREE.Object3D) {
  const parts: string[] = []
  root.traverse((obj) => {
    parts.push(`${obj.type}:${obj.name || '(unnamed)'}`)
  })
  return parts.join(' > ') || 'empty'
}

function bakeAirplane(scene: THREE.Object3D) {
  const cloned = scene.clone(true)
  const mesh = findMesh(cloned)
  if (!mesh) {
    throw new Error(`Airplane mesh missing (${describeGraph(scene)})`)
  }

  cloned.updateWorldMatrix(true, true)
  mesh.geometry = mesh.geometry.clone()
  mesh.geometry.applyMatrix4(mesh.matrixWorld)

  mesh.position.set(0, 0, 0)
  mesh.rotation.set(0, 0, 0)
  mesh.scale.set(1, 1, 1)
  mesh.quaternion.identity()
  mesh.frustumCulled = false

  mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox
  if (box) {
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    mesh.geometry.translate(-center.x, -center.y, -center.z)
    const longest = Math.max(size.x, size.y, size.z) || 1
    const fit = TARGET_LENGTH / longest
    mesh.geometry.scale(fit, fit, fit)
    mesh.geometry.computeVertexNormals()
  }

  const prev = mesh.material as THREE.MeshStandardMaterial
  const map = Array.isArray(prev) ? null : prev.map
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 16
    map.needsUpdate = true
  }
  mesh.material = new THREE.MeshPhysicalMaterial({
    map,
    color: '#7f8eae',
    metalness: 0.18,
    roughness: 0.46,
    clearcoat: 0.45,
    clearcoatRoughness: 0.28,
    reflectivity: 0.28,
    ior: 1.4,
    envMapIntensity: 0.38,
    side: THREE.DoubleSide,
  })

  return mesh
}

function OutdoorEnv() {
  const { gl, scene } = useThree()

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envScene = new RoomEnvironment()
    const env = pmrem.fromScene(envScene, 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.32
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
      envScene.dispose()
    }
  }, [gl, scene])

  return (
    <>
      <hemisphereLight args={['#b7a6e8', '#140e1c', 0.55]} />
      <directionalLight position={[4, 6, 8]} intensity={1.35} color="#ece6ff" />
      <directionalLight position={[-7, 1, -4]} intensity={1.1} color="#c4b5fd" />
      <directionalLight position={[0, -3, 4]} intensity={0.18} color="#6d5a96" />
    </>
  )
}

function Airplane() {
  const { scene } = useGLTF(MODEL)
  const fly = useRef<THREE.Group>(null)
  const model = useMemo(() => bakeAirplane(scene), [scene])
  const [mobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches,
  )
  const originY = mobile ? 1.35 : 1.45
  const startX = mobile ? MOBILE_START_X : START_X

  useFrame((state) => {
    if (!fly.current) return
    if (flight.epoch < 0) flight.epoch = state.clock.elapsedTime
    const duration = mobile ? MOBILE_FLIGHT_DURATION : FLIGHT_DURATION
    const elapsed = Math.max(0, state.clock.elapsedTime - flight.epoch)
    let t: number
    if (mobile) {
      const cam = state.camera as THREE.PerspectiveCamera
      const dy = originY - cam.position.y
      const distance = Math.hypot(dy, cam.position.z)
      const halfW =
        distance *
        Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5)) *
        (state.size.width / Math.max(state.size.height, 1))
      const reach = TARGET_LENGTH * 0.1
      const span = END_X - startX
      const enterT = THREE.MathUtils.clamp(
        (-halfW - reach - startX) / span,
        0.02,
        0.4,
      )
      const exitT = THREE.MathUtils.clamp(
        (halfW + reach - startX) / span,
        enterT + 0.05,
        0.85,
      )
      const arrive = 0.15
      const leave = 0.4
      if (elapsed <= arrive) {
        t = (elapsed / arrive) * enterT
      } else if (elapsed <= arrive + duration) {
        t =
          enterT +
          ((elapsed - arrive) / duration) * (exitT - enterT)
      } else {
        const u = Math.min((elapsed - arrive - duration) / leave, 1)
        t = exitT + u * (1 - exitT)
      }
    } else {
      t = Math.min(elapsed / duration, 1)
    }
    flight.progress = t
    const eased = cruise(t)
    fly.current.position.set(
      THREE.MathUtils.lerp(startX, END_X, eased),
      originY + Math.sin(eased * Math.PI) * 0.16,
      Math.sin(eased * Math.PI) * 0.35,
    )
    fly.current.rotation.z = Math.sin(eased * Math.PI) * 0.07
    fly.current.rotation.x = Math.sin(eased * Math.PI) * 0.025

    tailLocal.set(-TARGET_LENGTH * 0.47, 0.08, 0)
    fly.current.localToWorld(tailWorld.copy(tailLocal))
    tailWorld.project(state.camera)
    flight.tailX = (tailWorld.x * 0.5 + 0.5) * state.size.width
    flight.tailY = (-tailWorld.y * 0.5 + 0.5) * state.size.height
  })

  return (
    <group ref={fly} position={[startX, originY, 0]} scale={mobile ? 0.2 : 1}>
      <primitive object={model} />
    </group>
  )
}

function CameraRig() {
  const [mobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches,
  )

  useFrame((state) => {
    if (mobile) {
      state.camera.lookAt(0, 1.35, 0)
      return
    }
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      pointer.x * 0.22,
      0.035,
    )
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      0.38 + pointer.y * 0.1,
      0.035,
    )
    state.camera.lookAt(0, 1.3, 0)
  })
  return null
}

export function SkyHero() {
  useEffect(() => {
    flight.progress = 0
    return attachPointer()
  }, [])

  return (
    <JetBoundary>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0.38, 11.6], fov: 32 }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.92
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <OutdoorEnv />
        <Airplane />
        <CameraRig />
      </Canvas>
    </JetBoundary>
  )
}

useGLTF.preload(MODEL)
