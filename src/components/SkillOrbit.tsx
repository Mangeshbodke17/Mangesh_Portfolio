import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { skills } from '../content'
import { skillIcons } from '../three/skillIcons'

type OrbitChip = {
  name: string
  label: string
  color: string
  path?: string
  letters?: string
  layout?: boolean
  group: number
}

type Face = {
  label: string
  icon?: string
  letters?: string
  color?: string
  layout?: boolean
}

const ICONS = new Map<string, { color: string; path: string }>(
  skillIcons.map((icon) => [icon.name, icon]),
)

const FACE: Record<string, Face> = {
  React: { label: 'React', icon: 'React' },
  TypeScript: { label: 'TypeScript', icon: 'TypeScript' },
  JavaScript: { label: 'JavaScript', icon: 'JavaScript' },
  HTML: { label: 'HTML', icon: 'HTML5' },
  CSS: { label: 'CSS', icon: 'CSS3' },
  'Redux Toolkit': { label: 'Redux', icon: 'Redux' },
  'Responsive layouts': { label: 'Responsive', layout: true, color: '#c4b5fd' },
  'MUI / component libraries': { label: 'MUI', icon: 'MUI' },
  'Node.js': { label: 'Node', icon: 'Node.js' },
  Express: { label: 'Express', letters: 'Ex', color: '#f7f5ff' },
  'REST APIs': { label: 'REST', letters: 'API', color: '#a78bfa' },
  Mongoose: { label: 'Mongoose', icon: 'Mongoose' },
  Git: { label: 'Git', icon: 'Git' },
  GitHub: { label: 'GitHub', icon: 'GitHub' },
}

const ORBIT: OrbitChip[] = skills.flatMap((group, groupIndex) =>
  group.items.map((name) => {
    const face = FACE[name] ?? { label: name, letters: name.slice(0, 3), color: '#c4b5fd' }
    const icon = face.icon ? ICONS.get(face.icon) : undefined
    return {
      name,
      label: face.label,
      color: icon?.color ?? face.color ?? '#c4b5fd',
      path: icon?.path,
      letters: face.letters,
      layout: face.layout,
      group: groupIndex,
    }
  }),
)

const ON_RING: number[][] = skills.map(() => [])
ORBIT.forEach((chip, index) => {
  ON_RING[chip.group].push(index)
})

const RINGS = [
  { radiusX: 0.46, radiusY: 0.3, tilt: -16, speed: 0.15, phase: 0.25 },
  { radiusX: 0.36, radiusY: 0.23, tilt: 14, speed: -0.2, phase: 1.15 },
  { radiusX: 0.27, radiusY: 0.17, tilt: -9, speed: 0.23, phase: 2.05 },
  { radiusX: 0.17, radiusY: 0.11, tilt: 20, speed: -0.17, phase: 0.7 },
] as const

function Mark({ chip }: { chip: OrbitChip }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15"
      style={{
        background: '#100c18e6',
        boxShadow: `inset 0 0 0 1px ${chip.color}55`,
      }}
    >
      {chip.layout ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <rect x="3" y="3" width="8" height="8" rx="1.6" fill={chip.color} />
          <rect x="13" y="3" width="8" height="5" rx="1.4" fill={chip.color} opacity="0.72" />
          <rect x="13" y="10" width="8" height="11" rx="1.6" fill={chip.color} />
          <rect x="3" y="13" width="8" height="8" rx="1.6" fill={chip.color} opacity="0.72" />
        </svg>
      ) : chip.path ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path d={chip.path} fill={chip.color} fillRule="evenodd" />
        </svg>
      ) : (
        <span
          className={`font-semibold tracking-tight ${chip.letters && chip.letters.length > 2 ? 'text-[8px]' : 'text-[10px]'}`}
          style={{ color: chip.color }}
        >
          {chip.letters}
        </span>
      )}
    </span>
  )
}

function SkillList() {
  return (
    <ul className="sr-only">
      {skills.map((group) => (
        <li key={group.group}>
          {group.group}: {group.items.join(', ')}
        </li>
      ))}
    </ul>
  )
}

function pickGroup(current: number | null, next: number | null) {
  return next !== null && current === next ? null : next
}

function GroupPills({
  active,
  onChange,
}: {
  active: number | null
  onChange: (next: number | null) => void
}) {
  const items = [
    { label: 'All', index: null as number | null },
    ...skills.map((group, index) => ({ label: group.group, index })),
  ]

  return (
    <div className="mb-4 flex flex-wrap justify-center gap-1.5" role="tablist" aria-label="Skill groups">
      {items.map((item) => {
        const on = active === item.index
        return (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(item.index)}
            className={`relative rounded-full px-3 py-1.5 text-xs sm:text-sm ${
              on ? 'text-ink' : 'text-fog hover:text-ink'
            }`}
          >
            {on ? (
              <motion.span
                layoutId="skill-group"
                className="absolute inset-0 rounded-full border border-lilac/35 bg-violet/25"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SkillOrbit() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<number | null>(null)
  const activeRef = useRef<number | null>(null)
  activeRef.current = active
  const stageRef = useRef<HTMLDivElement>(null)
  const ringRefs = useRef<(HTMLDivElement | null)[]>([])
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])
  const pointer = useRef({ x: 0, y: 0, inside: false })

  useEffect(() => {
    if (reduce) return
    const stage = stageRef.current
    if (!stage) return

    let frame = 0
    let last = performance.now()
    let onScreen = true
    let nameStep = 0
    const nameTimer = window.setInterval(() => {
      nameStep += 1
    }, 500)
    const angles: number[] = RINGS.map((ring) => ring.phase)
    const drawn = RINGS.map(() => ({ rx: 0, ry: 0 }))
    let drawnReady = false
    const scaleNow = ORBIT.map(() => 0.9)
    const fadeNow = ORBIT.map(() => 0.72)
    const focusNow = ORBIT.map(() => false)

    const placePointer = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      pointer.current.x = event.clientX - rect.left
      pointer.current.y = event.clientY - rect.top
      pointer.current.inside = true
    }
    const leave = () => {
      pointer.current.inside = false
    }

    stage.addEventListener('pointermove', placePointer)
    stage.addEventListener('pointerenter', placePointer)
    stage.addEventListener('pointerleave', leave)

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    observer.observe(stage)

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const raw = (now - last) / 1000
      last = now
      const dt = Number.isFinite(raw) ? Math.min(0.05, Math.max(0, raw)) : 0
      if (!onScreen) return

      const w = stage.clientWidth
      const h = stage.clientHeight
      if (w === 0 || h === 0) return

      const box = Math.min(w, h * 1.35)
      const solo = activeRef.current
      const rings = RINGS.map((ring) => ({
        rx: Math.min(box * ring.radiusX, Math.max(96, w / 2 - 36)),
        ry: Math.min(box * ring.radiusY, Math.max(64, h / 2 - 42)),
        tilt: (ring.tilt * Math.PI) / 180,
        speed: ring.speed,
      }))
      const ease = 1 - Math.exp(-dt * 8)

      if (!drawnReady) {
        rings.forEach((ring, index) => {
          drawn[index].rx = ring.rx
          drawn[index].ry = ring.ry
        })
        drawnReady = true
      }

      rings.forEach((ring, index) => {
        const shown = solo === null || solo === index
        const targetRx = shown && solo !== null ? rings[0].rx : ring.rx
        const targetRy = shown && solo !== null ? rings[0].ry : ring.ry
        drawn[index].rx += (targetRx - drawn[index].rx) * ease
        drawn[index].ry += (targetRy - drawn[index].ry) * ease
        const el = ringRefs.current[index]
        if (!el) return
        el.style.width = `${drawn[index].rx * 2}px`
        el.style.height = `${drawn[index].ry * 2}px`
        el.style.opacity = shown ? '1' : '0'
        el.style.transform = `translate(-50%, -50%) rotate(${RINGS[index].tilt}deg)`
      })

      angles.forEach((angle, index) => {
        angles[index] = angle + rings[index].speed * dt
      })

      const placed = ORBIT.map((chip, index) => {
        const ring = drawn[chip.group]
        const tilt = rings[chip.group].tilt
        const slot = ON_RING[chip.group].indexOf(index)
        const count = ON_RING[chip.group].length
        const a = angles[chip.group] + (slot / count) * Math.PI * 2
        const x = Math.cos(a) * ring.rx
        const y = Math.sin(a) * ring.ry
        const cos = Math.cos(tilt)
        const sin = Math.sin(tilt)
        return { x: x * cos - y * sin, y: x * sin + y * cos, shown: solo === null || solo === chip.group }
      })

      let focus = placed.findIndex((spot) => spot.shown)
      if (focus < 0) focus = 0
      if (pointer.current.inside) {
        let best = Infinity
        placed.forEach((spot, index) => {
          if (!spot.shown) return
          const dx = pointer.current.x - (w / 2 + spot.x)
          const dy = pointer.current.y - (h / 2 + spot.y)
          const dist = dx * dx + dy * dy
          if (dist < best) {
            best = dist
            focus = index
          }
        })
      } else {
        const visible: number[] = []
        placed.forEach((spot, index) => {
          if (spot.shown) visible.push(index)
        })
        if (visible.length > 0) focus = visible[nameStep % visible.length]
      }

      placed.forEach((spot, index) => {
        const el = chipRefs.current[index]
        if (!el) return
        const focused = spot.shown && index === focus
        const depth = Math.min(1, Math.max(0, 0.5 + spot.y / (Math.max(drawn[ORBIT[index].group].ry, 24) * 2.4)))
        const targetScale = !spot.shown
          ? 0.72
          : focused
            ? 1.28
            : pointer.current.inside
              ? 0.78 + depth * 0.12
              : 0.88 + depth * 0.14
        const targetFade = !spot.shown
          ? 0
          : focused
            ? 1
            : pointer.current.inside
              ? 0.42 + depth * 0.2
              : 0.66 + depth * 0.26
        scaleNow[index] = Math.min(1.4, Math.max(0.7, scaleNow[index] + (targetScale - scaleNow[index]) * ease))
        fadeNow[index] = Math.min(1, Math.max(0, fadeNow[index] + (targetFade - fadeNow[index]) * ease))
        el.style.transform = `translate(calc(-50% + ${spot.x}px), calc(-50% + ${spot.y}px)) scale(${scaleNow[index]})`
        el.style.opacity = String(fadeNow[index])
        el.style.zIndex = String(focused ? 40 : 8 + Math.round(depth * 16))
        const inward = spot.x > 16 ? 'left' : 'right'
        if (el.dataset.inward !== inward) el.dataset.inward = inward
        if (focusNow[index] !== focused) {
          focusNow[index] = focused
          el.dataset.focus = focused ? 'true' : 'false'
        }
      })
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(nameTimer)
      observer.disconnect()
      stage.removeEventListener('pointermove', placePointer)
      stage.removeEventListener('pointerenter', placePointer)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [reduce])

  const shown = active === null ? ORBIT : ORBIT.filter((chip) => chip.group === active)

  if (reduce) {
    return (
      <div>
        <SkillList />
        <GroupPills active={active} onChange={(next) => setActive((current) => pickGroup(current, next))} />
        <ul className="flex flex-wrap justify-center gap-2.5">
          {shown.map((chip) => (
            <li
              key={chip.name}
              className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] py-1 pr-3.5 pl-1 backdrop-blur-md"
            >
              <Mark chip={chip} />
              <span className="text-sm text-ink">{chip.label}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <SkillList />
      <GroupPills active={active} onChange={(next) => setActive((current) => pickGroup(current, next))} />
      <div
        ref={stageRef}
        className="relative mx-auto h-[30rem] w-full max-w-5xl touch-pan-y sm:h-[36rem]"
        aria-hidden
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lilac shadow-[0_0_18px_6px_rgba(167,139,250,0.65)]" />
        {RINGS.map((ring, index) => (
          <div
            key={ring.phase}
            ref={(node) => {
              ringRefs.current[index] = node
            }}
            className={`skill-orbit-ring pointer-events-none absolute top-1/2 left-1/2 rounded-[50%] border ${
              index % 2 === 0 ? 'border-lilac/30' : 'border-violet/35'
            }`}
          />
        ))}
        {ORBIT.map((chip, index) => (
          <div
            key={chip.name}
            ref={(node) => {
              chipRefs.current[index] = node
            }}
            data-focus="false"
            className="skill-orbit-chip pointer-events-none absolute top-1/2 left-1/2 flex items-center rounded-full border border-white/12 bg-white/[0.06] py-1 pr-1 pl-1 opacity-0 backdrop-blur-md will-change-transform"
          >
            <Mark chip={chip} />
            <span className="skill-orbit-name text-[13px]">{chip.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
