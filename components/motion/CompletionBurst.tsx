'use client'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const PARTICLES = [
  { angle: 0,   dist: 68, color: '#86efac' },
  { angle: 45,  dist: 76, color: '#6ee7b7' },
  { angle: 90,  dist: 62, color: '#86efac' },
  { angle: 135, dist: 72, color: '#34d399' },
  { angle: 180, dist: 68, color: '#6ee7b7' },
  { angle: 225, dist: 76, color: '#86efac' },
  { angle: 270, dist: 62, color: '#34d399' },
  { angle: 315, dist: 72, color: '#6ee7b7' },
]

export function CompletionBurst({ taskId }: { taskId: string }) {
  const prefersReduced = useReducedMotion()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (prefersReduced) return
    const key = `burst:${taskId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    setShow(true)
    const t = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(t)
  }, [taskId, prefersReduced])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, pointerEvents: 'none',
    }}>
      {/* Expanding ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: 80, height: 80,
          borderRadius: '50%',
          border: '2px solid #86efac',
        }}
      />

      {/* Circle + checkmark */}
      <motion.svg
        width="72" height="72" viewBox="0 0 72 72" fill="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.04 }}
        style={{ position: 'absolute' }}
      >
        <circle cx="36" cy="36" r="32" fill="rgba(21,128,61,0.22)" />
        <motion.path
          d="M20 37L30 47L52 24"
          stroke="#86efac"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.38, ease: 'easeInOut', delay: 0.18 }}
        />
      </motion.svg>

      {/* Particles */}
      {PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.58, ease: 'easeOut', delay: 0.08 + i * 0.018 }}
            style={{
              position: 'absolute',
              width: 7, height: 7,
              borderRadius: '50%',
              background: p.color,
            }}
          />
        )
      })}
    </div>
  )
}
