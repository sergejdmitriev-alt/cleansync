'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Bitte E-Mail und Passwort eingeben.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Ungültige E-Mail oder Passwort.')
      setLoading(false)
      return
    }

    const next = searchParams.get('next') ?? '/'
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div style={{ background: 'var(--cs-surface)', border: '1px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '32px', width: '100%', maxWidth: '384px' }}>
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xl font-bold" style={{ color: 'var(--cs-text-1)' }}>✦ CleanSync</span>
        </div>

        <h1 className="text-lg font-semibold mb-6" style={{ color: 'var(--cs-text-1)' }}>Anmelden</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--cs-text-2)' }}>
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="name@example.com"
              className="cs-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--cs-text-2)' }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="cs-input"
            />
          </div>

          {error && (
            <div style={{ background: 'var(--cs-danger-bg)', border: '1px solid var(--cs-danger-border)', color: 'var(--cs-danger-text)', fontSize: '14px', padding: '12px 16px', borderRadius: 'var(--cs-radius-md)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="cs-btn-primary w-full justify-center" style={{ padding: '10px', fontSize: '14px' }}
          >
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </div>
      </div>
    </div>
  )
}
