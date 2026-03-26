import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isMockMode, MOCK_USER } from "@/lib/isMock"

export async function createClient() {
  const cookieStore = await cookies()

  // DEMO MODE: If keys are dummy, return a mock client to wow the user
  if (isMockMode()) {
    return {
      auth: {
        getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
        signInWithPassword: async () => ({ data: { user: MOCK_USER }, error: null }),
        signUp: async () => ({ data: { user: MOCK_USER }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }), single: () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
        delete: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
      })
    } as any
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
