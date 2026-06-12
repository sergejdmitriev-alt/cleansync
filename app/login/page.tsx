'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'

const SPRING = { type: 'spring' as const, stiffness: 320, damping: 28 }

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: SPRING },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M2 6 L5 9 L10 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

const STORAGE_KEY = 'cs_login_email'

function LoginInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const reduced      = useReducedMotion()

  const savedEmail   = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) ?? '' : ''
  const [email,      setEmail]      = useState(savedEmail)
  const [password,   setPassword]   = useState('')
  const [remember,   setRemember]   = useState(!!savedEmail)
  const [showPwd,    setShowPwd]    = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [shakeKey,   setShakeKey]   = useState(0)

  const passwordRef = useRef<HTMLInputElement>(null)
  const emailRef    = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (savedEmail) {
      passwordRef.current?.focus()
    } else {
      emailRef.current?.focus()
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogin() {
    if (!email || !password) {
      setError('Bitte E-Mail und Passwort eingeben.')
      setShakeKey(k => k + 1)
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Ungültige E-Mail oder Passwort.')
      setLoading(false)
      setShakeKey(k => k + 1)
      return
    }

    if (remember) {
      localStorage.setItem(STORAGE_KEY, email)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    const next = searchParams.get('next') ?? '/'
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        key={shakeKey || 'form'}
        animate={shakeKey > 0 && !reduced
          ? { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4, ease: 'easeInOut' } }
          : { x: 0 }
        }
        style={{
          background:   'var(--cs-surface)',
          border:       '1px solid var(--cs-border)',
          borderRadius: 'var(--cs-radius-lg)',
          padding:      '32px',
          width:        '100%',
          maxWidth:     '384px',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
            <span className="text-xl font-bold" style={{ color: 'var(--cs-text-1)' }}>✦ CleanSync</span>
          </motion.div>

          {/* Заголовок */}
          <motion.h1 variants={itemVariants} className="text-lg font-semibold mb-6" style={{ color: 'var(--cs-text-1)' }}>
            Anmelden
          </motion.h1>

          {/* Email */}
          <motion.div variants={itemVariants} style={{ marginBottom: '16px' }}>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--cs-text-2)' }}>
              E-Mail
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="name@example.com"
              autoComplete="email"
              className="cs-input"
            />
          </motion.div>

          {/* Пароль */}
          <motion.div variants={itemVariants} style={{ marginBottom: '16px', position: 'relative' }}>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--cs-text-2)' }}>
              Passwort
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordRef}
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                autoComplete="current-password"
                className="cs-input"
                style={{ paddingRight: '40px' }}
              />
              <motion.button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
                aria-label={showPwd ? 'Passwort verbergen' : 'Passwort anzeigen'}
                whileTap={reduced ? {} : { scale: 0.9 }}
                style={{
                  position:   'absolute',
                  right:      '10px',
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    '4px',
                  color:      'var(--cs-text-3)',
                  opacity:    showPwd ? 1 : 0.6,
                  transition: 'opacity 150ms, color 150ms',
                  display:    'flex',
                  alignItems: 'center',
                }}
              >
                <EyeIcon open={showPwd} />
              </motion.button>
            </div>
          </motion.div>

          {/* Чекбокс E-Mail merken */}
          <motion.div variants={itemVariants} style={{ marginBottom: '16px' }}>
            <label style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '8px',
              cursor:     'pointer',
              userSelect: 'none',
              fontSize:   '13px',
              color:      'var(--cs-text-2)',
            }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(v => !v)}
                style={{
                  width:        '16px',
                  height:       '16px',
                  borderRadius: '4px',
                  border:       `1.5px solid ${remember ? 'var(--cs-blue)' : 'var(--cs-border)'}`,
                  background:   remember ? 'var(--cs-blue)' : 'transparent',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  cursor:       'pointer',
                  flexShrink:   0,
                  transition:   'background 150ms, border-color 150ms',
                  padding:      0,
                }}
              >
                <AnimatePresence>
                  {remember && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                      style={{ color: 'white', display: 'flex', lineHeight: 1 }}
                    >
                      <CheckIcon />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              E-Mail merken
            </label>
          </motion.div>

          {/* Ошибка */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  background:   'var(--cs-danger-bg)',
                  border:       '1px solid var(--cs-danger-border)',
                  color:        'var(--cs-danger-text)',
                  fontSize:     '14px',
                  padding:      '12px 16px',
                  borderRadius: 'var(--cs-radius-md)',
                  marginBottom: '16px',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Кнопка */}
          <motion.div variants={itemVariants}>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="cs-btn-primary w-full justify-center"
              style={{ padding: '10px', fontSize: '14px' }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'cs-spin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Wird angemeldet…
                  </span>
                : 'Anmelden'
              }
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
