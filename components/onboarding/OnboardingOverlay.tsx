'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion'
import StepIllustration from './StepIllustration'

const STEPS = [
  {
    title: 'Willkommen bei CleanSync!',
    body: 'Ihre Reinigungen. Automatisch organisiert. Lernen Sie in 4 kurzen Schritten, wie CleanSync Ihnen Zeit spart.',
    cta: null,
  },
  {
    title: 'Ihre erste Unterkunft',
    body: 'Fügen Sie Ihre Unterkunft hinzu und verbinden Sie den Airbnb-Kalender (iCal). Aufträge werden automatisch erstellt.',
    cta: { label: 'Zu Unterkünfte', href: '/settings' },
  },
  {
    title: 'Reinigungskraft hinzufügen',
    body: 'Laden Sie Ihre Reinigungskraft ein — sie erhält Aufträge direkt in Telegram, in ihrer Sprache.',
    cta: { label: 'Zu Reinigungskräfte', href: '/settings' },
  },
  {
    title: 'Telegram verbinden',
    body: 'Erhalten Sie sofort eine Nachricht, wenn ein Auftrag angenommen oder abgeschlossen wird.',
    cta: { label: 'Telegram verbinden', href: '/connect-telegram' },
  },
  {
    title: 'Alles bereit!',
    body: 'Sie können jederzeit Hilfe im Menüpunkt „Hilfe" finden. Viel Erfolg!',
    cta: { label: 'Los geht\'s', href: null },
  },
]

const SPRING_MODAL   = { type: 'spring' as const, stiffness: 320, damping: 28 }
const SPRING_CONTENT = { type: 'spring' as const, stiffness: 380, damping: 26 }
const SPRING_STEP    = { type: 'spring' as const, stiffness: 300, damping: 30 }
const SPRING_BTN     = { type: 'spring' as const, stiffness: 400, damping: 25 }
const SPRING_PROG    = { type: 'spring' as const, stiffness: 220, damping: 26 }

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const staggerChild = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: SPRING_CONTENT },
}

function getStepVariants(direction: number) {
  return {
    enter:  { opacity: 0, x: direction > 0 ? 32 : -32 },
    center: { opacity: 1, x: 0, transition: SPRING_STEP },
    exit:   {
      opacity: 0,
      x: direction > 0 ? -32 : 32,
      transition: { duration: 0.18, ease: 'easeIn' },
    },
  }
}

export default function OnboardingOverlay() {
  const [visible,   setVisible]   = useState(false)
  const [step,      setStep]      = useState(0)
  const [direction, setDirection] = useState(1)
  const router    = useRouter()
  const reduced   = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('cs_onboarding_done')) return
    const id = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(id)
  }, [])

  const close = useCallback(() => {
    localStorage.setItem('cs_onboarding_done', 'true')
    setVisible(false)
  }, [])

  const go = useCallback((delta: number) => {
    setDirection(delta)
    setStep(s => Math.max(0, Math.min(STEPS.length - 1, s + delta)))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!visible) return
      if (e.key === 'Escape' && step < STEPS.length - 1) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, step, close])

  const handleCta = useCallback(() => {
    const cta = STEPS[step].cta
    if (!cta) return
    close()
    if (cta.href) router.push(cta.href)
  }, [step, close, router])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1)
    else if (info.offset.x > 60) go(-1)
  }, [go])

  const variants = getStepVariants(direction)

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={() => step < STEPS.length - 1 && close()}
            style={{
              position:       'fixed',
              inset:          0,
              zIndex:         1000,
              background:     'rgba(8,9,12,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Einführung"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            transition={SPRING_MODAL}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{
              position:  'fixed',
              zIndex:    1001,
              inset:     0,
              display:   'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding:   '16px',
              pointerEvents: 'none',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                width:         '100%',
                maxWidth:      '480px',
                background:    'var(--cs-surface)',
                border:        '1px solid var(--cs-border)',
                borderRadius:  'var(--cs-radius-lg)',
                padding:       '28px 24px 24px',
                position:      'relative',
                userSelect:    'none',
              }}
            >
              {/* Прогресс-полоса */}
              <div style={{
                height:       '3px',
                background:   'var(--cs-border)',
                borderRadius: '2px',
                marginBottom: '24px',
                overflow:     'hidden',
              }}>
                <motion.div
                  style={{
                    height:          '100%',
                    background:      'var(--cs-blue)',
                    borderRadius:    '2px',
                    transformOrigin: 'left',
                    scaleX:          (step + 1) / STEPS.length,
                  }}
                  animate={{ scaleX: (step + 1) / STEPS.length }}
                  transition={SPRING_PROG}
                />
              </div>

              {/* Контент шага */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}
                  >
                    {/* Иллюстрация */}
                    <motion.div variants={staggerChild}>
                      <StepIllustration step={step + 1} />
                    </motion.div>

                    {/* Заголовок */}
                    <motion.h2
                      variants={staggerChild}
                      style={{
                        margin:        0,
                        fontSize:      '18px',
                        fontWeight:    '600',
                        color:         'var(--cs-text-1)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {STEPS[step].title}
                    </motion.h2>

                    {/* Текст */}
                    <motion.p
                      variants={staggerChild}
                      style={{
                        margin:     0,
                        fontSize:   '14px',
                        lineHeight: '1.6',
                        color:      'var(--cs-text-2)',
                        maxWidth:   '360px',
                      }}
                    >
                      {STEPS[step].body}
                    </motion.p>

                    {/* CTA кнопка шага */}
                    {STEPS[step].cta && (
                      <motion.div variants={staggerChild}>
                        <motion.button
                          onClick={handleCta}
                          whileHover={reduced ? {} : { scale: 1.03 }}
                          whileTap={reduced ? {} : { scale: 0.97 }}
                          transition={SPRING_BTN}
                          className="cs-btn-primary"
                          style={{ fontSize: '13px', marginTop: '4px' }}
                        >
                          {STEPS[step].cta!.label}
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Dot-индикаторы (mobile) */}
              <div style={{
                display:        'flex',
                justifyContent: 'center',
                gap:            '6px',
                marginTop:      '20px',
              }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{ position: 'relative', width: '8px', height: '8px' }}>
                    {i === step && (
                      <motion.div
                        layoutId="active-dot"
                        style={{
                          position:     'absolute',
                          inset:        0,
                          borderRadius: '50%',
                          background:   'var(--cs-blue)',
                        }}
                        transition={SPRING_PROG}
                      />
                    )}
                    <div style={{
                      width:        '8px',
                      height:       '8px',
                      borderRadius: '50%',
                      background:   i === step ? 'transparent' : 'var(--cs-border)',
                    }} />
                  </div>
                ))}
              </div>

              {/* Навигация */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginTop:      '20px',
                gap:            '8px',
              }}>
                {/* Überspringen — шаги 0-3 */}
                <div style={{ minWidth: '80px' }}>
                  {step < STEPS.length - 1 && (
                    <button
                      onClick={close}
                      style={{
                        background:  'none',
                        border:      'none',
                        cursor:      'pointer',
                        color:       'var(--cs-text-3)',
                        fontSize:    '13px',
                        padding:     '6px 0',
                      }}
                    >
                      Überspringen
                    </button>
                  )}
                </div>

                {/* Schritt N von 5 */}
                <span style={{ fontSize: '12px', color: 'var(--cs-text-3)', flexShrink: 0 }}>
                  Schritt {step + 1} von {STEPS.length}
                </span>

                {/* Zurück / Weiter */}
                <div style={{ display: 'flex', gap: '6px', minWidth: '80px', justifyContent: 'flex-end' }}>
                  {step > 0 && (
                    <motion.button
                      onClick={() => go(-1)}
                      whileHover={reduced ? {} : { scale: 1.03 }}
                      whileTap={reduced ? {} : { scale: 0.97 }}
                      transition={SPRING_BTN}
                      className="cs-btn-secondary"
                      style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                      Zurück
                    </motion.button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <motion.button
                      onClick={() => go(1)}
                      whileHover={reduced ? {} : { scale: 1.03 }}
                      whileTap={reduced ? {} : { scale: 0.97 }}
                      transition={SPRING_BTN}
                      className="cs-btn-primary"
                      style={{ fontSize: '13px', padding: '6px 14px' }}
                    >
                      Weiter
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={close}
                      whileHover={reduced ? {} : { scale: 1.03 }}
                      whileTap={reduced ? {} : { scale: 0.97 }}
                      transition={SPRING_BTN}
                      className="cs-btn-primary"
                      style={{ fontSize: '13px', padding: '6px 14px' }}
                    >
                      Fertig
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
