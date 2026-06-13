'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

const THRESHOLD = 56   // px to trigger refresh
const MAX_PULL  = 72   // max translateY
const RESIST    = 0.40 // pull resistance

export function PullToRefresh({ children }: { children: ReactNode }) {
  const router         = useRouter()
  const pullRef        = useRef(0)
  const reducedRef     = useRef(false)
  const refreshingRef  = useRef(false)
  const [pull, setPull]             = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Track prefers-reduced-motion via ref so event handlers don't go stale
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mq.matches
    const fn = (e: MediaQueryListEvent) => { reducedRef.current = e.matches }
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    let startY = 0
    let startX = 0
    let active = false

    function onStart(e: TouchEvent) {
      if (refreshingRef.current) return
      startY = e.touches[0].clientY
      startX = e.touches[0].clientX
      active = false
    }

    function onMove(e: TouchEvent) {
      if (reducedRef.current || refreshingRef.current) return
      if (window.scrollY > 0) return
      const dy = e.touches[0].clientY - startY
      const dx = Math.abs(e.touches[0].clientX - startX)
      // Only vertical pull, not horizontal swipe
      if (dy <= 0 || dx > dy * 0.6) return
      active = true
      e.preventDefault()
      const clamped = Math.min(dy * RESIST, MAX_PULL)
      pullRef.current = clamped
      setPull(clamped)
    }

    function onEnd() {
      if (!active) return
      active = false
      if (pullRef.current >= THRESHOLD) {
        refreshingRef.current = true
        setRefreshing(true)
        router.refresh()
        setTimeout(() => {
          refreshingRef.current = false
          setRefreshing(false)
          pullRef.current = 0
          setPull(0)
        }, 900)
      } else {
        pullRef.current = 0
        setPull(0)
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove',  onMove,  { passive: false })
    window.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('touchend',   onEnd)
    }
  }, [router])

  // snapBack: both indicator and content animate to rest position
  const snapBack = pull === 0 && !refreshing
  const ease = 'cubic-bezier(0.25, 1, 0.5, 1)'

  return (
    <div style={{ position: 'relative' }}>
      {/* Indicator fills the gap created by content's translateY */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: pull,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 8,
          overflow: 'hidden',
          transition: snapBack ? `height 0.28s ${ease}` : 'none',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {(pull > 14 || refreshing) && (
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'var(--cs-surface)',
            border: '1px solid var(--cs-border)',
            boxShadow: 'var(--cs-shadow-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            opacity: refreshing ? 1 : Math.min(pull / THRESHOLD, 1),
            transition: 'opacity 0.15s',
          }}>
            {refreshing ? (
              <svg
                width="16" height="16" viewBox="0 0 20 20" fill="none"
                style={{ animation: 'cs-spin 0.8s linear infinite' }}
                stroke="var(--cs-blue)" strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="10" cy="10" r="8" strokeOpacity="0.25"/>
                <path d="M10 2 A8 8 0 0 1 18 10"/>
              </svg>
            ) : (
              <svg
                width="14" height="14" viewBox="0 0 20 20" fill="none"
                stroke="var(--cs-blue)" strokeWidth="2.5" strokeLinecap="round"
                style={{
                  transform: `rotate(${pull >= THRESHOLD ? 180 : 0}deg)`,
                  transition: 'transform 0.2s ease',
                }}
              >
                <path d="M10 4v10M5 9l5 5 5-5"/>
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Content — shifts down as user pulls */}
      <div style={{
        transform: `translateY(${pull}px)`,
        transition: snapBack ? `transform 0.28s ${ease}` : 'none',
        willChange: pull > 0 ? 'transform' : 'auto',
      }}>
        {children}
      </div>
    </div>
  )
}
