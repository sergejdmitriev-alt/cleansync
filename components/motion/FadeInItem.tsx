'use client'

import { motion, useReducedMotion } from 'framer-motion'

const CAP = 12

interface FadeInItemProps {
  index: number
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

// Animated list item: opacity+y entrance, capped stagger delay
export function FadeInItem({ index, children, style, className }: FadeInItemProps) {
  const reduced = useReducedMotion()
  const delay   = Math.min(index, CAP - 1) * 0.05
  if (reduced) return <div style={style} className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 28 }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  )
}
