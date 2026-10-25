import { SectionHeading } from './SectionHeading'
import { SkillOrbit } from './SkillOrbit'

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-28 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading kicker="03 — Skills" title="What I actually use" />
        <SkillOrbit />
      </div>
    </section>
  )
}
