import { Check, Copy, Mail } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { profile } from '../content'
import { FadeIn } from './FadeIn'
import { MagneticButton } from './MagneticButton'
import { GithubIcon, LinkedinIcon } from './SocialIcons'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [message, setMessage] = useState('')

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const subject = encodeURIComponent(`Portfolio — ${name || 'Hello'}`)
    const body = encodeURIComponent(
      `${message}\n\n— ${name}${from ? ` (${from})` : ''}`,
    )
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.28),transparent_60%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <FadeIn clip={false}>
          <p className="text-[11px] tracking-[0.28em] text-violet uppercase">
            04 — Contact
          </p>
          <h2 className="font-display mt-3 text-[2.65rem] leading-[1.15] tracking-tight text-ink sm:mt-4 sm:text-6xl sm:leading-[1.08]">
            Let’s talk
          </h2>
          <p className="mt-4 font-display text-xl leading-snug tracking-tight break-words text-ink sm:mt-6 sm:text-3xl">
            {profile.email}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
            <MagneticButton
              onClick={() => void copyEmail()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-ink sm:w-auto sm:py-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy email'}
            </MagneticButton>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-ink hover:border-violet/50 sm:w-auto sm:py-2"
            >
              <GithubIcon size={16} /> GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-ink hover:border-violet/50 sm:w-auto sm:py-2"
            >
              <LinkedinIcon size={16} /> LinkedIn
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-ink hover:border-violet/50 sm:w-auto sm:py-2"
            >
              <Mail size={16} /> Mail
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} clip={false}>
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-3xl border border-white/12 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(10,8,18,0.28)] backdrop-blur-xl sm:p-6"
          >
            <label className="block text-sm">
              <span className="text-fog">Name</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-raised px-3 py-2.5 text-ink outline-none focus:border-violet"
                autoComplete="name"
              />
            </label>
            <label className="block text-sm">
              <span className="text-fog">Your email</span>
              <input
                required
                type="email"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-raised px-3 py-2.5 text-ink outline-none focus:border-violet"
                autoComplete="email"
              />
            </label>
            <label className="block text-sm">
              <span className="text-fog">Message</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-raised px-3 py-2.5 text-ink outline-none focus:border-violet"
              />
            </label>
            <MagneticButton
              type="submit"
              className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-violet"
            >
              Send message
            </MagneticButton>
          </form>
        </FadeIn>
      </div>
    </section>
  )
}
