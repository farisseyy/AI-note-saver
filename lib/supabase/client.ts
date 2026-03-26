import { createBrowserClient } from "@supabase/ssr"
import { isMockMode, MOCK_USER } from "@/lib/isMock"

export function createClient() {
  if (isMockMode()) {
    return {
      auth: {
        getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
        signInWithPassword: async () => ({ data: { user: MOCK_USER }, error: null }),
        signInWithOAuth: async () => ({ data: { user: MOCK_USER }, error: null }),
        signUp: async () => ({ data: { user: MOCK_USER }, error: null }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
