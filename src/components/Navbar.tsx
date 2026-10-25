import { Menu, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { nav, profile } from '../content'

const sectionIds = nav.map((item) => item.href.slice(1))

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const y = window.scrollY
      if (!open) setHidden(y > last && y > 72)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
      animate={{ y: hidden && !open ? -110 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch">
        <div className="flex items-center gap-1 rounded-full border border-lilac/25 bg-canvas/70 py-1.5 pr-1.5 pl-1.5 shadow-[0_10px_40px_rgba(76,29,149,0.35)] ring-1 ring-violet/20 backdrop-blur-xl">
          <a
            href="#home"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lilac/40 bg-white/[0.04] font-display text-sm text-ink shadow-[inset_0_0_12px_rgba(167,139,250,0.25)]"
            onClick={() => setOpen(false)}
          >
            MB
          </a>

          <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex" aria-label="Primary">
            {nav.map((item) => {
              const id = item.href.slice(1)
              const isActive = active === id
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    isActive ? 'text-ink' : 'text-fog hover:text-ink'
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-lilac/30 bg-violet/25 shadow-[0_0_18px_rgba(124,58,237,0.35)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                </a>
              )
            })}
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-1 rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-violet"
              >
                Resume
              </a>
            ) : null}
          </nav>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-lilac/30 bg-white/[0.04] text-ink md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 rounded-3xl border border-lilac/25 bg-canvas/80 p-2 shadow-[0_16px_50px_rgba(76,29,149,0.35)] ring-1 ring-violet/15 backdrop-blur-xl md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1">
              {nav.map((item) => {
                const id = item.href.slice(1)
                const isActive = active === id
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base ${
                        isActive
                          ? 'border border-lilac/30 bg-violet/20 text-ink'
                          : 'text-fog'
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                      {isActive ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-lilac shadow-[0_0_10px_rgba(196,181,253,0.9)]" />
                      ) : null}
                    </a>
                  </li>
                )
              })}
            </ul>
          </motion.nav>
        ) : null}
      </div>
    </motion.header>
  )
}
