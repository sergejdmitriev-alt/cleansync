'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function NewTaskButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{ display: 'inline-flex' }}
    >
      <Link href="/tasks/new" className="cs-btn-primary" style={{ textDecoration: 'none' }}>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0 }}
        >
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Neuer Auftrag
      </Link>
    </motion.div>
  )
}
