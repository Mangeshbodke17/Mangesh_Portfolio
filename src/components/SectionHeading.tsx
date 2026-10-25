import { FadeIn } from './FadeIn'

type SectionHeadingProps = {
  kicker: string
  title: string
  description?: string
}

export function SectionHeading({
  kicker,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <FadeIn className="mb-10 max-w-2xl md:mb-14">
      <p className="text-[11px] tracking-[0.28em] text-violet uppercase">
        {kicker}
      </p>
      <h2 className="font-display mt-3 text-4xl tracking-tight text-ink sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-fog">{description}</p>
      ) : null}
    </FadeIn>
  )
}
