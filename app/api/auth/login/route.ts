import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyTurnstile } from '@/lib/turnstile'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { email, password, turnstileToken } = await request.json()

  if (turnstileToken) {
    const isHuman = await verifyTurnstile(turnstileToken)
    if (!isHuman) {
      return NextResponse.json({ error: 'Bot detected' }, { status: 403 })
    }
  }

  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  return response
}
