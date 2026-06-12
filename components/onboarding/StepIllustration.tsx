'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface Props { step: number }

export default function StepIllustration({ step }: Props) {
  const reduced = useReducedMotion()

  if (step === 1) return <IllustrationSpark reduced={!!reduced} />
  if (step === 2) return <IllustrationCalendar reduced={!!reduced} />
  if (step === 3) return <IllustrationCleaner reduced={!!reduced} />
  if (step === 4) return <IllustrationTelegram reduced={!!reduced} />
  return <IllustrationCheck reduced={!!reduced} />
}

/* ── Шаг 1: логотип с pulse-кольцом ── */
function IllustrationSpark({ reduced }: { reduced: boolean }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {/* glow-кольцо */}
      <motion.circle
        cx="48" cy="48" r="38"
        stroke="rgba(59,126,248,0.3)"
        strokeWidth="2"
        fill="none"
        animate={reduced ? {} : { opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* основной круг */}
      <motion.circle
        cx="48" cy="48" r="28"
        fill="rgba(59,126,248,0.15)"
        stroke="rgba(59,126,248,0.5)"
        strokeWidth="1.5"
        animate={reduced ? {} : { scale: [1, 1.06, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '48px', originY: '48px' }}
      />
      {/* искра ✦ */}
      <text x="48" y="54" textAnchor="middle" fontSize="20" fill="#3b7ef8">✦</text>
    </svg>
  )
}

/* ── Шаг 2: календарь со строками ── */
function IllustrationCalendar({ reduced }: { reduced: boolean }) {
  const lines = [0, 1, 2]
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {/* рамка */}
      <rect x="16" y="18" width="64" height="60" rx="8" fill="rgba(59,126,248,0.08)" stroke="rgba(59,126,248,0.3)" strokeWidth="1.5" />
      {/* верхняя полоска — хедер */}
      <rect x="16" y="18" width="64" height="18" rx="8" fill="rgba(59,126,248,0.18)" />
      <rect x="16" y="28" width="64" height="8" fill="rgba(59,126,248,0.18)" />
      {/* иконки-крючки */}
      <rect x="30" y="12" width="4" height="12" rx="2" fill="#3b7ef8" />
      <rect x="62" y="12" width="4" height="12" rx="2" fill="#3b7ef8" />
      {/* строки-события */}
      {lines.map((i) => (
        <motion.g key={i}
          initial={reduced ? {} : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <rect x="24" y={46 + i * 12} width={reduced ? 48 : 48} height="6" rx="3" fill="rgba(59,126,248,0.35)" />
        </motion.g>
      ))}
      {/* галочка */}
      <motion.path
        d="M66 56 L70 61 L80 49"
        stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none"
        initial={reduced ? {} : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

/* ── Шаг 3: аватар уборщика + bubble ── */
function IllustrationCleaner({ reduced }: { reduced: boolean }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {/* аватар pop-in */}
      <motion.circle
        cx="42" cy="44" r="22"
        fill="rgba(59,126,248,0.12)"
        stroke="rgba(59,126,248,0.4)"
        strokeWidth="1.5"
        initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      />
      {/* силуэт */}
      <motion.circle cx="42" cy="38" r="9" fill="rgba(59,126,248,0.45)"
        initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
      />
      <motion.path d="M24 62 Q24 54 42 54 Q60 54 60 62"
        fill="rgba(59,126,248,0.45)"
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      />
      {/* bubble сообщение */}
      <motion.g
        initial={reduced ? {} : { opacity: 0, scale: 0.8, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 24 }}
      >
        <rect x="54" y="22" width="32" height="20" rx="8" fill="#3b7ef8" />
        <path d="M60 42 L54 48 L66 42" fill="#3b7ef8" />
        <rect x="59" y="28" width="22" height="3" rx="1.5" fill="white" fillOpacity="0.8" />
        <rect x="59" y="34" width="14" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
      </motion.g>
    </svg>
  )
}

/* ── Шаг 4: Telegram самолётик по дуге ── */
function IllustrationTelegram({ reduced }: { reduced: boolean }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {/* пунктирный след */}
      <motion.path
        d="M20 72 Q30 30 76 20"
        stroke="rgba(59,126,248,0.25)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
        initial={reduced ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* круг Telegram */}
      <motion.circle
        cx="76" cy="20" r="14"
        fill="#229ED9"
        initial={reduced ? {} : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 300, damping: 22 }}
      />
      {/* самолётик вдоль дуги */}
      <motion.g
        initial={reduced ? {} : { offsetDistance: '0%' } as any}
        animate={reduced ? {} : { offsetDistance: '100%' } as any}
        style={reduced ? {} : {
          offsetPath: "path('M20 72 Q30 30 76 20')",
          offsetRotate: 'auto',
        } as any}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <path d="M0 -6 L5 4 L-5 4 Z" fill="#3b7ef8" transform="rotate(0)" />
      </motion.g>
      {/* иконка Telegram */}
      <motion.path
        d="M70 14 l-4.5 10.5 c-0.35 1.12 0.35 1.4 1.05 0.875l2.8-2.1 1.575 2.975c0.245 0.35 0.7 0.35 0.875 0l1.225-6.825"
        fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35, duration: 0.2 }}
      />
    </svg>
  )
}

/* ── Шаг 5: галочка + кольцо + частицы ── */
function IllustrationCheck({ reduced }: { reduced: boolean }) {
  const particles = [0, 1, 2, 3, 4, 5, 6, 7]
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      {/* зелёное кольцо */}
      <motion.circle
        cx="48" cy="48" r="28"
        stroke="#86efac"
        strokeWidth="2"
        fill="rgba(134,239,172,0.08)"
        initial={reduced ? {} : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: '48px', originY: '48px' }}
      />
      {/* галочка */}
      <motion.path
        d="M34 48 L44 58 L62 38"
        stroke="#86efac" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        fill="none"
        initial={reduced ? {} : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* частицы */}
      {!reduced && particles.map((_, i) => {
        const angle = (angles[i] * Math.PI) / 180
        const dx = Math.cos(angle) * 36
        const dy = Math.sin(angle) * 36
        return (
          <motion.circle
            key={i}
            cx="48" cy="48" r="3"
            fill={i % 2 === 0 ? '#3b7ef8' : '#86efac'}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: dx, y: dy }}
            transition={{ delay: 0.6 + i * 0.04, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        )
      })}
    </svg>
  )
}
