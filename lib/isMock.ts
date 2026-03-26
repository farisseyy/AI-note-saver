export const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !url || !key || url.includes('127.0.0.1') || url.includes('xyzxyz')
}

export const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'demo-user@example.com',
  user_metadata: {
    full_name: 'Demo User (Local Mode)',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User'
  }
}
