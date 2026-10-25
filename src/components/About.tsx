import { ChevronRight } from 'lucide-react'
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from 'motion/react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { about } from '../content'
import { FadeIn } from './FadeIn'

function Cgpa({ value, active }: { value: number; active: boolean }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reduce) {
      setShown(value)
      return
    }
    if (!active) {
      setShown(0)
      return
    }
    setShown(0)
    const controls = animate(0, value, {
      duration: 1.15,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (next) => setShown(next),
    })
    return () => controls.stop()
  }, [active, reduce, value])

  return <span>{shown.toFixed(1)}</span>
}

function useCycle(length: number, ms: number) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduce || length < 2) return
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % length)
    }, ms)
    return () => window.clearInterval(id)
  }, [reduce, length, ms])

  return reduce ? -1 : active
}

const ScatterParagraph = forwardRef<HTMLParagraphElement, { text: string }>(
  function ScatterParagraph({ text }, ref) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  return (
    <motion.p
      ref={ref}
      role="tabpanel"
      className="max-w-3xl text-base leading-relaxed text-fog"
      initial={reduce ? false : 'hidden'}
      animate="show"
      exit={reduce ? undefined : 'leave'}
    >
      {words.map((word, index) => {
        const apart = index % 2 === 0 ? -18 : 18
        return (
          <motion.span
            key={`${word}-${index}`}
            className="mr-[0.28em] inline-block"
            variants={{
              hidden: { opacity: 0, y: -apart, filter: 'blur(4px)' },
              show: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 0.42,
                  delay: Math.min(index * 0.012, 0.32),
                  ease: [0.22, 1, 0.36, 1],
                },
              },
              leave: {
                opacity: 0,
                y: apart,
                filter: 'blur(3px)',
                transition: {
                  duration: 0.28,
                  delay: Math.min((index % 6) * 0.02, 0.1),
                  ease: [0.4, 0, 1, 1],
                },
              },
            }}
          >
            {word}
          </motion.span>
        )
      })}
    </motion.p>
  )
},
)

function StoryPager() {
  const reduce = useReducedMotion()
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const story = about.stories[page]

  function go(next: number, forward = next > page) {
    if (next === page) return
    setDir(forward ? 1 : -1)
    setPage(next)
  }

  function nextPage() {
    go((page + 1) % about.stories.length, true)
  }

  return (
    <article className="rounded-3xl border border-white/12 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(10,8,18,0.22)] backdrop-blur-xl sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] tracking-[0.22em] text-violet uppercase">Summary</p>
        <div
          className="hidden items-center gap-1.5 md:flex"
          role="tablist"
          aria-label="Summary pages"
        >
          {about.stories.map((item, index) => {
            const on = index === page
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => go(index)}
                className={`relative rounded-full px-3 py-1.5 text-xs ${
                  on ? 'text-ink' : 'text-fog hover:text-ink'
                }`}
              >
                {on ? (
                  <motion.span
                    layoutId="summary-page"
                    className="absolute inset-0 rounded-full border border-lilac/35 bg-violet/25"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="relative">{item.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative mt-4 min-h-36 overflow-hidden">
        <AnimatePresence mode="wait">
          <ScatterParagraph
            key={story.id}
            text={`${story.body}${story.stamp ? ` ${story.stamp}` : ''}`}
          />
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center gap-3 md:hidden">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-full border border-lilac/35 bg-violet/20 px-4 py-2.5">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.p
              key={story.id}
              className="truncate text-sm text-ink"
              initial={reduce ? false : { opacity: 0, x: dir * 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -14 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {story.title}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={nextPage}
          aria-label="Next summary"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lilac/35 bg-white/[0.04] text-ink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </article>
  )
}

function Learning() {
  const active = useCycle(about.learning.length, 2200)

  return (
    <ul className="mt-5 space-y-2">
      {about.learning.map((item, index) => {
        const on = index === active
        return (
          <li key={item.name} className="relative rounded-2xl px-3 py-3">
            {on ? (
              <motion.span
                layoutId="learning-glow"
                className="absolute inset-0 rounded-2xl border border-lilac/35 bg-violet/20 shadow-[0_0_28px_rgba(124,58,237,0.28)]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            ) : null}
            <div className="relative">
              <p className="text-base font-medium text-ink">{item.name}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-fog">{item.detail}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function About() {
  const educationRef = useRef<HTMLElement>(null)
  const educationSeen = useInView(educationRef, { once: false, amount: 0.45 })

  return (
    <section id="about" className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-10 max-w-2xl md:mb-14">
          <p className="text-[11px] tracking-[0.28em] text-violet uppercase">
            01 — About
          </p>
          <h2 className="font-display mt-3 text-4xl tracking-tight text-ink sm:text-5xl">
            Work. Learning. Education.
          </h2>
        </FadeIn>

        <div className="grid gap-4">
          <FadeIn>
            <StoryPager />
          </FadeIn>

          <div className="grid gap-4 lg:grid-cols-2">
            <FadeIn delay={0.08}>
              <article className="h-full rounded-3xl border border-white/12 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(10,8,18,0.22)] backdrop-blur-xl sm:p-7">
                <p className="text-[11px] tracking-[0.22em] text-violet uppercase">
                  Learning
                </p>
                <p className="mt-3 text-sm leading-relaxed text-fog">
                  Where my time is going now.
                </p>
                <Learning />
              </article>
            </FadeIn>

            <FadeIn delay={0.16}>
              <article
                ref={educationRef}
                className="h-full rounded-3xl border border-white/12 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(10,8,18,0.22)] backdrop-blur-xl sm:p-7"
              >
                <p className="text-[11px] tracking-[0.22em] text-violet uppercase">
                  Education
                </p>
                <p className="font-display mt-4 text-6xl tracking-tight text-ink">
                  <Cgpa value={about.education.cgpa} active={educationSeen} />
                  <span className="ml-2 text-lg text-fog">CGPA</span>
                </p>
                <p className="mt-4 text-base font-medium text-ink">
                  {about.education.degree}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-fog">
                  {about.education.college}
                </p>
                <p className="mt-3 text-sm text-lilac">{about.education.year} passout</p>
              </article>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
