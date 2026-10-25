import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type MotionValue,
} from 'motion/react'
import { useRef } from 'react'
import { flight } from '../three/flight'
import { SkillSwap } from '../three/SkillSwap'
import { HeroFacts } from './HeroIdentity'

function clamp(n: number, a = 0, b = 1) {
  return Math.min(Math.max(n, a), b)
}

function easeOut(u: number) {
  const x = clamp(u)
  return 1 - (1 - x) * (1 - x)
}

function easeOutBack(u: number) {
  const x = clamp(u)
  const c1 = 1.55
  const c3 = c1 + 1
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function Headlines() {
  return <HeroFacts size="mobile" />
}

type Snap = {
  at: number
  x: number
  y: number
  tailX: number
  tailY: number
  breakX: number
  breakY: number
  attachX: number
  attachY: number
}

export function MobileTow({ progress }: { progress: MotionValue<number> }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const snapRef = useRef<Snap | null>(null)
  const runRef = useRef(flight.run)
  const bannerX = useMotionValue(-160)
  const bannerY = useMotionValue(180)
  const bannerRotate = useMotionValue(0)
  const flyOpacity = useMotionValue(0)
  const threadD = useMotionValue('M 0 0 Q 0 0 0 0')
  const threadOpacity = useMotionValue(0)
  const stubPlaneD = useMotionValue('M 0 0 Q 0 0 0 0')
  const stubBannerD = useMotionValue('M 0 0 Q 0 0 0 0')
  const stubOpacity = useMotionValue(0)
  const sparkX = useMotionValue(0)
  const sparkY = useMotionValue(0)
  const sparkR = useMotionValue(0)
  const sparkOpacity = useMotionValue(0)
  const tailCx = useMotionValue(-80)
  const tailCy = useMotionValue(180)

  useAnimationFrame(() => {
    if (runRef.current !== flight.run) {
      runRef.current = flight.run
      snapRef.current = null
    }

    const p = progress.get()
    const hero = heroRef.current
    const dock = dockRef.current
    if (!hero || !dock) return

    const now = performance.now()
    const heroBox = hero.getBoundingClientRect()
    const dockBox = dock.getBoundingClientRect()
    const heroW = heroBox.width
    const tailX = flight.tailX
    const tailY = flight.tailY
    const dockX = dockBox.left - heroBox.left
    const dockY = dockBox.top - heroBox.top
    const linkX = Math.min(128, dockBox.width * 0.7)
    const linkY = Math.max(28, dockBox.height - 6)
    const pull = clamp((tailX - heroW * 0.58) / (heroW * 0.5))
    const trailX = tailX - 138 - pull * 78
    const trailY = tailY - dockBox.height - 18
    const attachX = trailX + linkX
    const attachY = trailY + linkY
    const sag = 22 * (1 - pull * 0.9)
    const midX = (tailX + attachX) / 2
    const midY = (tailY + attachY) / 2 + sag

    if (!snapRef.current && p >= 0.05 && (tailX > heroW + 18 || p >= 0.86)) {
      snapRef.current = {
        at: now,
        x: trailX,
        y: trailY,
        tailX,
        tailY,
        breakX: lerp(tailX, attachX, 0.62),
        breakY: lerp(tailY, attachY, 0.62),
        attachX,
        attachY,
      }
    }

    const snap = snapRef.current

    if (!snap) {
      const show = p >= 0.04
      bannerX.set(trailX)
      bannerY.set(trailY)
      bannerRotate.set(Math.sin(p * 22) * 2.4 - pull * 4)
      flyOpacity.set(show ? clamp((p - 0.04) / 0.07) : 0)
      threadOpacity.set(show ? clamp((p - 0.04) / 0.07) : 0)
      stubOpacity.set(0)
      sparkOpacity.set(0)
      tailCx.set(tailX)
      tailCy.set(tailY)
      threadD.set(`M ${tailX} ${tailY} Q ${midX} ${midY} ${attachX} ${attachY}`)
      return
    }

    const elapsed = (now - snap.at) / 1000
    const land = easeOutBack(elapsed / 0.58)
    const whip = clamp(elapsed / 0.4)
    const nx = snap.attachY - snap.tailY
    const ny = snap.tailX - snap.attachX
    const nLen = Math.hypot(nx, ny) || 1
    const whipAmp = Math.sin(whip * Math.PI) * 32 * (1 - whip)

    bannerX.set(lerp(snap.x, dockX, land))
    bannerY.set(lerp(snap.y, dockY, land))
    bannerRotate.set(lerp(-6, 0, land))
    flyOpacity.set(1)
    threadOpacity.set(0)
    stubOpacity.set(1 - easeOut(whip))
    sparkX.set(snap.breakX)
    sparkY.set(snap.breakY)
    sparkR.set(2 + whip * 16)
    sparkOpacity.set((1 - whip) * 0.85)
    tailCx.set(tailX)
    tailCy.set(tailY)

    const planeEndX = lerp(snap.breakX, tailX, whip)
    const planeEndY = lerp(snap.breakY, tailY, whip)
    stubPlaneD.set(
      `M ${tailX} ${tailY} Q ${lerp(snap.breakX, tailX, whip * 0.5) + (nx / nLen) * whipAmp} ${lerp(snap.breakY, tailY, whip * 0.5) + (ny / nLen) * whipAmp} ${planeEndX} ${planeEndY}`,
    )

    const landedAttachX = bannerX.get() + linkX
    const landedAttachY = bannerY.get() + linkY
    const bannerEndX = lerp(snap.breakX, landedAttachX, easeOut(whip))
    const bannerEndY = lerp(snap.breakY, landedAttachY, easeOut(whip))
    stubBannerD.set(
      `M ${landedAttachX} ${landedAttachY} Q ${lerp(snap.breakX, landedAttachX, whip * 0.45) - (nx / nLen) * whipAmp} ${lerp(snap.breakY, landedAttachY, whip * 0.45) - (ny / nLen) * whipAmp} ${bannerEndX} ${bannerEndY}`,
    )

  })

  return (
    <div ref={heroRef} className="relative z-10 flex h-full flex-col">
      <svg
        className="pointer-events-none absolute inset-0 z-[22] h-full w-full"
        aria-hidden="true"
      >
        <motion.path
          d={threadD}
          fill="none"
          stroke="#e7e0ff"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ opacity: threadOpacity }}
        />
        <motion.path
          d={stubPlaneD}
          fill="none"
          stroke="#e7e0ff"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{ opacity: stubOpacity }}
        />
        <motion.path
          d={stubBannerD}
          fill="none"
          stroke="#e7e0ff"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{ opacity: stubOpacity }}
        />
        <motion.circle
          r="2.5"
          fill="#e7e0ff"
          cx={tailCx}
          cy={tailCy}
          style={{ opacity: threadOpacity }}
        />
        <motion.circle
          cx={sparkX}
          cy={sparkY}
          r={sparkR}
          fill="#e7e0ff"
          style={{ opacity: sparkOpacity }}
        />
      </svg>

      <motion.div
        className="pointer-events-none absolute top-0 left-0 z-[23] w-[calc(100%-2.5rem)] origin-center"
        style={{
          x: bannerX,
          y: bannerY,
          rotate: bannerRotate,
          opacity: flyOpacity,
        }}
      >
        <Headlines />
      </motion.div>

      <div className="relative z-10 flex h-full translate-y-8 flex-col px-5 pt-24 pb-8">
        <div ref={dockRef} className="invisible mx-auto w-full max-w-full shrink-0" aria-hidden="true">
          <Headlines />
        </div>

        <div
          className="mt-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden"
          style={{ containerType: 'size' }}
          aria-hidden="true"
        >
          <div className="aspect-square w-[min(100cqw,100cqh)]">
            <SkillSwap />
          </div>
        </div>
      </div>
    </div>
  )
}
