'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type State = 'checking' | 'loading' | 'ready' | 'connected'

export default function ConnectTelegramPage() {
  const [state, setState]               = useState<State>('checking')
  const [deeplink, setDeeplink]         = useState('')
  const [tokenDisplay, setTokenDisplay] = useState('')
  const [copied, setCopied]             = useState(false)

  const generateToken = useCallback(async () => {
    setState('loading')
    try {
      const res = await fetch('/api/telegram/generate-token', { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDeeplink(data.deeplink)
      setTokenDisplay(
        `t.me/cleansync_bot?start=${(data.token as string).slice(0, 10)}…`
      )
      setState('ready')
    } catch {
      setTimeout(generateToken, 4000)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const res  = await fetch('/api/telegram/status')
      const data = await res.json()
      if (data.connected) {
        setState('connected')
      } else {
        generateToken()
      }
    })()
  }, [generateToken])

  useEffect(() => {
    if (state !== 'ready') return
    const id = setInterval(async () => {
      const res  = await fetch('/api/telegram/status')
      const data = await res.json()
      if (data.connected) {
        setState('connected')
        clearInterval(id)
      }
    }, 3000)
    return () => clearInterval(id)
  }, [state])

  useEffect(() => {
    if (state !== 'ready') return
    const id = setTimeout(generateToken, 9 * 60 * 1000 + 50 * 1000)
    return () => clearTimeout(id)
  }, [state, generateToken])

  const copyLink = async () => {
    if (!deeplink) return
    await navigator.clipboard.writeText(deeplink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── VERBUNDEN ─────────────────────────────────────────────
  if (state === 'connected') {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-medium text-white">
            Telegram verbunden!
          </h1>
          <p className="mb-6 text-sm text-white/50">
            Du erhältst ab sofort Aufgaben-Benachrichtigungen direkt im Messenger.
          </p>
          <div className="mb-6 space-y-2 rounded-xl bg-white/5 px-4 py-3 text-left text-sm">
            {[
              'Auftrag angenommen',
              'Reinigung abgeschlossen',
              'Reinraum: Status',
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 text-white/60">
                <span className="text-green-400">✓</span> {label}
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="block rounded-xl bg-white/10 px-6 py-3 text-sm font-medium
              text-white transition hover:bg-white/15"
          >
            Zum Dashboard →
          </Link>
        </div>
      </main>
    )
  }

  // ── LADEN ─────────────────────────────────────────────────
  if (state === 'checking' || state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full
            border-2 border-white/20 border-t-[#229ED9]" />
          <p className="text-sm text-white/50">Link wird generiert…</p>
        </div>
      </main>
    )
  }

  // ── BEREIT ────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-white/40
            transition hover:text-white/70"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zum Dashboard
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

          {/* Logos */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl
              bg-white/10 text-xs font-medium text-white">
              CS
            </div>
            <svg className="h-5 w-5 text-white/25" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <div className="flex h-10 w-10 items-center justify-center
              rounded-full bg-[#229ED9]">
              <TelegramIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Titel */}
          <h1 className="mb-2 text-center text-xl font-medium text-white">
            Telegram verbinden
          </h1>
          <p className="mb-7 text-center text-sm leading-relaxed text-white/50">
            Drei einfache Schritte — und du erhältst<br />
            Aufgaben-Benachrichtigungen direkt im Messenger.
          </p>

          {/* Schritte */}
          <div className="mb-7 grid grid-cols-3 gap-3">
            {[
              { n: 1, label: 'Button unten tippen',              active: true  },
              { n: 2, label: 'Telegram öffnet sich mit dem Bot', active: false },
              { n: 3, label: '„Start" drücken — fertig!',        active: false },
            ].map(({ n, label, active }) => (
              <div key={n} className="rounded-xl bg-white/5 p-3 text-center">
                <div className={`mx-auto mb-2 flex h-6 w-6 items-center justify-center
                  rounded-full text-xs font-medium
                  ${active
                    ? 'bg-[#229ED9] text-white'
                    : 'bg-white/10 text-white/30'}`}>
                  {n}
                </div>
                <p className={`text-xs leading-snug
                  ${active ? 'text-white' : 'text-white/40'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={deeplink}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl
              bg-[#229ED9] px-6 py-3 text-sm font-medium text-white
              transition hover:bg-[#229ED9]/90"
          >
            <TelegramIcon className="h-4 w-4" />
            Telegram öffnen
          </a>

          {/* Link kopieren */}
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-2 rounded-xl bg-white/5
              px-4 py-2.5 text-left transition hover:bg-white/10"
          >
            <span className="flex-1 truncate font-mono text-xs text-white/35">
              {tokenDisplay}
            </span>
            <span className="flex-shrink-0 text-xs text-white/50">
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </span>
          </button>

          <p className="mt-3 text-center text-xs text-white/25">
            Link gültig für 10 Minuten ·{' '}
            <button
              onClick={generateToken}
              className="text-white/40 underline transition hover:text-white/60"
            >
              Erneuern
            </button>
          </p>

        </div>
      </div>
    </main>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 1 0 24 12 12.012 12.012 0 0 0 11.944 0zm4.98
        8.146-1.95 9.196c-.146.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053
        5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.194
        1.006.131.813.924z" />
    </svg>
  )
}
