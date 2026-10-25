import { profile } from '../content'

export function HeroFacts({ size = 'desktop' }: { size?: 'desktop' | 'mobile' }) {
  return (
    <div
      className={
        size === 'mobile'
          ? 'w-full max-w-full text-center [text-shadow:0_1px_14px_rgba(16,12,24,0.92)]'
          : undefined
      }
    >
      <h1
        className={
          size === 'desktop'
            ? 'font-display text-[clamp(3.2rem,7vw,5.6rem)] leading-[0.88] tracking-tight'
            : 'font-display text-[clamp(2rem,8.6vw,2.7rem)] leading-[0.92] tracking-tight'
        }
      >
        {profile.name}
      </h1>
      <p className={size === 'desktop' ? 'mt-4 text-lg text-ink' : 'mt-2 text-sm text-ink'}>
        {profile.greeting}
      </p>
      <p
        className={
          size === 'desktop'
            ? 'mt-3 text-xl font-medium text-ink'
            : 'mt-2 text-base font-medium text-ink'
        }
      >
        {profile.title}
      </p>
      <p className={size === 'desktop' ? 'mt-1 text-base text-ink/90' : 'text-sm text-ink/90'}>
        {profile.focus}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-fog">{profile.skillsLine}</p>
      <p className="mt-1 text-sm text-fog">{profile.location}</p>
    </div>
  )
}

export function HeroIdentity() {
  return (
    <div className="max-w-xl">
      <HeroFacts />
    </div>
  )
}
