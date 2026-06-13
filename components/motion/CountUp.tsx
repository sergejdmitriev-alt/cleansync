'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, animate } from 'framer-motion'

export function CountUp({ value }: { value: number }) {
  const mv  = useMotionValue(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctrl  = animate(mv, value, { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] })
    const unsub = mv.on('change', v => {
      if (ref.current) ref.current.textContent = String(Math.round(v))
    })
    return () => { ctrl.stop(); unsub() }
  }, [value, mv])

  return <span ref={ref}>{value}</span>
}
