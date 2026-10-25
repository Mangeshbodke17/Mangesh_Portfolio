import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import { useRef, useState } from 'react'
import { experience, type ExperienceProduct, type ExperienceSlide } from '../content'
import { FadeIn } from './FadeIn'

function TopicPager({ topics }: { topics: ExperienceSlide[] }) {
  const reduce = useReducedMotion()
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const topic = topics[page]

  function go(next: number, forward = next > page) {
    if (next === page) return
    setDir(forward ? 1 : -1)
    setPage(next)
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] tracking-[0.18em] text-violet uppercase">React</p>
        <p className="text-[11px] text-fog">
          {page + 1} / {topics.length}
        </p>
      </div>
      <div className="mt-3 hidden flex-wrap gap-1.5 md:flex" role="tablist" aria-label="Techniques">
        {topics.map((item, index) => {
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
                  layoutId="nsfas-topic"
                  className="absolute inset-0 rounded-full border border-lilac/35 bg-violet/25"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="relative mt-3 min-h-24 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={topic.id}
            role="tabpanel"
            className="text-sm leading-relaxed text-fog"
            initial={reduce ? false : { opacity: 0, y: dir * 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: dir * -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {topic.body.split(' ').map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="mr-[0.28em] inline-block"
                initial={reduce ? false : { opacity: 0, y: index % 2 === 0 ? 10 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: Math.min(index * 0.014, 0.24),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center gap-3 md:hidden">
        <div className="min-w-0 flex-1 overflow-hidden rounded-full border border-lilac/35 bg-violet/20 px-4 py-2.5">
          <p className="truncate text-sm text-ink">{topic.label}</p>
        </div>
        <button
          type="button"
          aria-label="Next technique"
          onClick={() => go((page + 1) % topics.length, true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lilac/35 bg-white/[0.04] text-ink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function ProductSwitch({
  products,
  page,
  onChange,
}: {
  products: ExperienceProduct[]
  page: number
  onChange: (next: number) => void
}) {
  const product = products[page]

  return (
    <>
      <div className="mb-4 hidden flex-wrap gap-1.5 md:flex" role="tablist" aria-label="Products">
        {products.map((item, index) => {
          const on = index === page
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(index)}
              className={`relative rounded-full px-3 py-1.5 text-xs ${
                on ? 'text-ink' : 'text-fog hover:text-ink'
              }`}
            >
              {on ? (
                <motion.span
                  layoutId="journey-product"
                  className="absolute inset-0 rounded-full border border-lilac/35 bg-violet/25"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">{item.title}</span>
            </button>
          )
        })}
      </div>
      <div className="mb-4 flex items-center gap-3 md:hidden">
        <div className="min-w-0 flex-1 overflow-hidden rounded-full border border-lilac/35 bg-violet/20 px-4 py-2.5">
          <p className="truncate text-sm text-ink">{product.title}</p>
        </div>
        <button
          type="button"
          aria-label="Next product"
          onClick={() => onChange((page + 1) % products.length)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lilac/35 bg-white/[0.04] text-ink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </>
  )
}

function SummaryBoard({
  work,
  topics,
}: {
  work: string[]
  topics: ExperienceSlide[]
}) {
  return (
    <>
      <div className="inline-flex rounded-full border border-lilac/35 bg-violet/25 px-3 py-1.5 text-xs text-ink">
        Summary
      </div>
      <ul className="mt-4 space-y-2.5">
        {work.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-fog">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
            {line}
          </li>
        ))}
      </ul>
      {topics.length > 0 ? <TopicPager key={topics[0]?.id} topics={topics} /> : null}
    </>
  )
}

function ProductBoard({ products }: { products: ExperienceProduct[] }) {
  const [page, setPage] = useState(0)
  const product = products[page]

  return (
    <div className="border-t border-white/8 px-5 pt-4 pb-6 sm:px-6">
      <ProductSwitch products={products} page={page} onChange={setPage} />
      <SummaryBoard key={product.id} work={product.work} topics={product.topics} />
    </div>
  )
}

function JobPages({ slides }: { slides: ExperienceSlide[] }) {
  const reduce = useReducedMotion()
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const slide = slides[page]
  const paged = slides.length > 1

  function go(next: number, forward = next > page) {
    if (next === page) return
    setDir(forward ? 1 : -1)
    setPage(next)
  }

  return (
    <div className="border-t border-white/8 px-5 pt-4 pb-6 sm:px-6">
      {paged ? (
        <div className="mb-4 hidden flex-wrap gap-1.5 md:flex" role="tablist">
          {slides.map((item, index) => {
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
                    layoutId="journey-page"
                    className="absolute inset-0 rounded-full border border-lilac/35 bg-violet/25"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="relative min-h-24 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={slide.id}
            role="tabpanel"
            className="text-sm leading-relaxed text-fog"
            initial={reduce ? false : { opacity: 0, y: dir * 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: dir * -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {slide.body.split(' ').map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="mr-[0.28em] inline-block"
                initial={reduce ? false : { opacity: 0, y: index % 2 === 0 ? 12 : -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.012, 0.28),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </AnimatePresence>
      </div>

      {paged ? (
        <div className="mt-4 flex items-center gap-3 md:hidden">
          <div className="min-w-0 flex-1 overflow-hidden rounded-full border border-lilac/35 bg-violet/20 px-4 py-2.5">
            <p className="truncate text-sm text-ink">{slide.label}</p>
          </div>
          <button
            type="button"
            aria-label="Next page"
            onClick={() => go((page + 1) % slides.length, true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lilac/35 bg-white/[0.04] text-ink"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function Experience() {
  const [openId, setOpenId] = useState(experience[0]?.id ?? '')
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.75', 'end 0.45'],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <section
      id="experience"
      className="scroll-mt-28 border-y border-white/8 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.38fr_0.62fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <FadeIn>
            <p className="text-[11px] tracking-[0.28em] text-violet uppercase">
              02 — Experience
            </p>
            <h2 className="font-display mt-3 text-4xl tracking-tight text-ink sm:text-5xl">
              The journey
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-fog">
              Full-time SDE-1 now. Two frontend internships before that.
            </p>
            <ul className="mt-8 hidden space-y-3 lg:block">
              {experience.map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(job.id)}
                    className={`text-left text-sm transition-colors ${
                      openId === job.id ? 'text-ink' : 'text-fog hover:text-ink'
                    }`}
                  >
                    <span className="block text-[11px] tracking-wide text-violet uppercase">
                      {job.dates}
                    </span>
                    {job.company}
                  </button>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <ol ref={listRef} className="relative space-y-4 pl-6">
          <motion.div
            aria-hidden="true"
            className="absolute top-2 left-[5px] h-[calc(100%-12px)] w-px origin-top bg-linear-to-b from-violet via-brand to-transparent"
            style={reduce ? undefined : { scaleY }}
          />
          {experience.map((job) => {
            const isOpen = openId === job.id
            return (
              <li key={job.id} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute top-6 -left-[1.35rem] h-2.5 w-2.5 rounded-full border ${
                    isOpen
                      ? 'border-violet bg-violet shadow-[0_0_16px_rgba(167,139,250,0.8)]'
                      : 'border-violet/50 bg-canvas'
                  }`}
                />
                <article className="overflow-hidden rounded-3xl border border-white/12 bg-white/[0.045] shadow-[0_24px_70px_rgba(10,8,18,0.22)] backdrop-blur-xl">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenId((current) => (current === job.id ? '' : job.id))
                    }
                  >
                    <div>
                      <p className="text-[11px] tracking-wide text-violet uppercase">
                        {job.type} · {job.dates}
                      </p>
                      <h3 className="font-display mt-1 text-2xl text-ink">
                        {job.company}
                      </h3>
                      <p className="mt-1 text-sm text-fog">
                        {job.role} · {job.place}
                      </p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`mt-1 shrink-0 text-fog transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.32,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        {job.products ? (
                          <ProductBoard products={job.products} />
                        ) : job.work ? (
                          <div className="border-t border-white/8 px-5 pt-4 pb-6 sm:px-6">
                            <SummaryBoard work={job.work} topics={job.topics ?? []} />
                          </div>
                        ) : (
                          <JobPages key={job.id} slides={job.slides} />
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
