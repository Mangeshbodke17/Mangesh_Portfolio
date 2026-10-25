import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import type { MouseEvent, ReactNode } from 'react'

type MagneticButtonProps = {
  children: ReactNode
  className?: string
  href?: string
  type?: 'button' | 'submit'
  onClick?: () => void
}

export function MagneticButton({
  children,
  className = '',
  href,
  type = 'button',
  onClick,
}: MagneticButtonProps) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  function onMove(event: MouseEvent<HTMLElement>) {
    if (reduce) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.28)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.38)
  }

  function onLeave() {
    x.set(0)
    y.set(0)
  }

  const shared = {
    className,
    style: { x: springX, y: springY },
    onMouseMove: onMove,
    onMouseLeave: onLeave,
  }

  if (href) {
    const external = href.startsWith('http')
    return (
      <motion.a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        {...shared}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button type={type} onClick={onClick} {...shared}>
      {children}
    </motion.button>
  )
}
