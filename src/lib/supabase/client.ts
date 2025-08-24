import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Keep a single browser client across renders, routes, and HMR in dev
const globalForSupabase = globalThis as unknown as {
  __velin_supabase_browser__: SupabaseClient<Database> | undefined
}

export function createClient() {
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  if (!globalForSupabase.__velin_supabase_browser__) {
    globalForSupabase.__velin_supabase_browser__ = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'lax',
        },
      }
    )
  }

  return globalForSupabase.__velin_supabase_browser__
}