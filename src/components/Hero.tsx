import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  FLIGHT_DURATION,
  flight,
  MOBILE_FLIGHT_DURATION,
  restartFlight,
} from '../three/flight'
import { SkyField } from '../three/SkyField'
import { SkyHero } from '../three/SkyHero'
import { SkillSwap } from '../three/SkillSwap'
import { HeroIdentity } from './HeroIdentity'
import { MobileTow } from './MobileTow'

function PassReveal({
  progress,
  at,
  span = 0.16,
  className,
  clickable = false,
  children,
}: {
  progress: MotionValue<number>
  at: number
  span?: number
  className?: string
  clickable?: boolean
  children: ReactNode
}) {
  const opacity = useTransform(progress, [at, at + span * 0.55], [0, 1])
  const y = useTransform(progress, [at, at + span], [16, 0])
  const clipPath = useTransform(
    progress,
    [at, at + span],
    ['inset(0 110% 0 -12%)', 'inset(0 -8% 0 -12%)'],
  )
  const pointerEvents = useTransform(
    progress,
    [at + span * 0.45, at + span * 0.6],
    ['none', 'auto'],
  )

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        y,
        clipPath,
        pointerEvents: clickable ? pointerEvents : 'none',
      }}
    >
      {children}
    </motion.div>
  )
}

export function Hero() {
  const reduce = useReducedMotion()
  const [mobile, setMobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)')
    const onChange = () => setMobile(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  const progress = useMotionValue(reduce ? 1 : 0)
  const [pass, setPass] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useAnimationFrame(() => {
    if (!reduce) progress.set(flight.progress)
  })

  useEffect(() => {
    if (reduce) {
      progress.set(1)
      return
    }
    const timeout = window.setTimeout(
      () => {
        if (flight.progress < 0.04) flight.progress = 1
      },
      (mobile ? MOBILE_FLIGHT_DURATION : FLIGHT_DURATION) * 1000 + 2000,
    )
    return () => window.clearTimeout(timeout)
  }, [mobile, pass, progress, reduce])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduce) return
    let away = false
    const io = new IntersectionObserver(
      ([entry]) => {
        const onHero = entry.isIntersecting && entry.intersectionRatio >= 0.55
        if (!onHero) {
          away = true
          return
        }
        if (away) {
          away = false
          restartFlight()
          setPass((n) => n + 1)
        }
      },
      { threshold: [0, 0.25, 0.55, 0.8, 1] },
    )
    io.observe(section)
    return () => io.disconnect()
  }, [reduce])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-[100svh] min-h-[640px] overflow-hidden text-ink"
    >
      <div
        className="absolute inset-0 z-0 overflow-hidden bg-[linear-gradient(180deg,#1a1028_0%,#100c18_70%,#100c18_100%)]"
        aria-hidden="true"
      >
        {!reduce ? <SkyField /> : null}
      </div>

      {mobile ? (
        <MobileTow progress={progress} />
      ) : (
      <div className="relative z-10 flex h-full items-center gap-8 pt-24 pr-[2vw] pb-8 pl-[6vw] lg:pr-[3vw] lg:pl-[8vw]">
        <PassReveal progress={progress} at={0.22} span={0.18} clickable className="w-[min(34rem,38vw)] shrink-0">
          <HeroIdentity />
        </PassReveal>
        <PassReveal progress={progress} at={0.48} span={0.18} clickable className="h-full min-w-0 flex-1">
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ containerType: 'size' }}
          >
            <div className="aspect-square w-[min(100cqw,100cqh)]">
              <SkillSwap />
            </div>
          </div>
        </PassReveal>
      </div>
      )}

      {!reduce ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          <Suspense fallback={null}>
            <SkyHero />
          </Suspense>
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-24 bg-gradient-to-b from-transparent to-canvas"
        aria-hidden="true"
      />
    </section>
  )
}
