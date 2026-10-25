import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type FadeInProps = {
  children: ReactNode
  className?: string
  delay?: number
  clip?: boolean
}

export function FadeIn({
  children,
  className,
  delay = 0,
  clip = true,
}: FadeInProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? false
          : { opacity: 0, y: 28, ...(clip ? { clipPath: 'inset(18% 0 0 0)' } : {}) }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        ...(clip ? { clipPath: 'inset(0% 0 0 0)' } : {}),
      }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
