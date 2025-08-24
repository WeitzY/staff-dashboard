/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  This route is hit from the client after a successful login so the server
  can persist the Supabase session in http-only cookies.  The pattern is
  taken from the official Supabase + Next-App-Router example.
*/
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

export async function POST(req: Request) {
  const { event, session } = await req.json()

  if (!session || (event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED')) {
    return NextResponse.json({ ok: false })
  }

  const cookieStore = (await cookies()) as any

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.setSession(session)

  return NextResponse.json({ ok: true })
} 