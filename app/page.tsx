'use client'

import { isMockMode } from '@/lib/isMock'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowRight, Layout, Globe, Mail, Lock, UserPlus, LogIn } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(isMockMode())
  }, [])

  const handleDemoLaunch = () => {
    setLoading(true)
    setTimeout(() => {
      router.push('/notes')
    }, 500)
  }

  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    console.log('--- Auth Process: Google OAuth ---')

    try {
      const isMock = isMockMode()
      console.log('Is in mock mode:', isMock)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('OAuth Error:', error)
        throw error
      }

      console.log('OAuth sign-in initiated successfully')

      if (isMock) {
        console.log('Mock mode detected, simulating redirect to /notes...')
        setTimeout(() => {
          router.push('/notes')
        }, 800)
      }
    } catch (err: any) {
      console.error('CRITICAL OAuth Error:', err)
      setError(err.message || 'Failed to initialize Google Login')
      setLoading(false)
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const isMock = isMockMode()
      if (isMock) {
        console.log('--- Auth Process: Mock Email Auth ---')
        router.push('/notes')
        return
      }

      if (isLogin) {
        console.log('--- Auth Process: Login ---')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/notes')
      } else {
        console.log('--- Auth Process: Signup ---')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
        if (error) throw error

        if (data.session) {
          router.push('/notes')
        } else if (data.user) {
          setError("Verification email sent! Please verify your email before logging in.")
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      if (!isMockMode()) setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans overflow-hidden relative flex flex-col items-center justify-center p-6">
      {/* Background Micro-Accents */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Branding Header */}
      <div className="z-10 mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#0f172a] shadow-2xl border border-white/5 group hover:border-emerald-500/50 transition-all duration-700">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] group-hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all">
            <span className="text-2xl font-black text-black">N</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3">
          Notes <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">Saver</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
          The ultimate workspace for AI-powered productivity.
        </p>
      </div>

      <div className="z-10 w-full max-w-md glass-card p-8 rounded-[32px] border border-white/5 accent-shadow">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            {isLogin ? 'Access your intelligent notes repository.' : 'Join the elite flow of AI-enhanced thinking.'}
          </p>
        </div>

        {/* Auth Buttons Wrapper */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 px-6 py-3.5 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {loading && !email ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Globe className="w-5 h-5 text-emerald-500" />
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center py-4">
            <div className="grow border-t border-white/5" />
            <span className="shrink mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">or</span>
            <div className="grow border-t border-white/5" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-4">
              <div className="group space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                    placeholder="hi@example.com"
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.2)] text-sm font-bold text-black bg-emerald-500 hover:bg-emerald-400 focus:outline-none active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
            >
              {loading && email ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'Sign In Now' : 'Create Access'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isDemo && !loading && (
              <button
                type="button"
                onClick={handleDemoLaunch}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 border border-emerald-500/20 rounded-2xl text-sm font-bold text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Join Local Workspace (Demo)
              </button>
            )}
          </form>

          <div className="pt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-sm font-bold text-gray-500 hover:text-emerald-500 transition-colors"
            >
              {isLogin ? "New here? Create your repository" : 'Already part of the flow? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Minimal Branding */}
      <div className="mt-12 text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-6">
        <span className="flex items-center gap-2 hover:text-gray-400 cursor-pointer transition-colors"><Sparkles className="w-3 h-3 text-emerald-500" /> AI-Powered</span>
        <span className="w-1 h-1 bg-gray-800 rounded-full" />
        <span className="flex items-center gap-2 hover:text-gray-400 cursor-pointer transition-colors"><Lock className="w-3 h-3 text-emerald-500" /> Secure Sync</span>
        <span className="w-1 h-1 bg-gray-800 rounded-full" />
        <span className="flex items-center gap-2 hover:text-gray-400 cursor-pointer transition-colors">v0.1.0 Alpha</span>
      </div>
    </div>
  )
}
