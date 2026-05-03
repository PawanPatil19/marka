'use client'

import { useState, useTransition } from 'react'
import { login, signup } from '@/app/login/actions'

export function LoginForm({ error }: { error?: string }) {
  const [isPending, startTransition] = useTransition()
  const [pendingType, setPendingType] = useState<'login' | 'signup' | null>(null)

  const handleLogin = (formData: FormData) => {
    setPendingType('login')
    startTransition(async () => {
      await login(formData)
    })
  }

  const handleSignup = (formData: FormData) => {
    setPendingType('signup')
    startTransition(async () => {
      await signup(formData)
    })
  }

  const isLoading = isPending

  return (
    <form className="space-y-0">
      <div>
        <label
          htmlFor="email"
          className="block font-mono text-[9px] uppercase tracking-widest text-[#888] mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-3 text-sm font-bold text-[#111] outline-none focus:bg-white disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      <div className="pt-3">
        <label
          htmlFor="password"
          className="block font-mono text-[9px] uppercase tracking-widest text-[#888] mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
          className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-3 text-sm font-bold text-[#111] outline-none focus:bg-white disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <div className="pt-4 flex gap-3">
        <button
          formAction={handleLogin}
          disabled={isLoading}
          className="flex-1 bg-[#111] text-[#f0ebe0] py-3 font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer disabled:opacity-60"
        >
          {isLoading && pendingType === 'login' ? 'Signing In...' : 'Sign In'}
        </button>
        <button
          formAction={handleSignup}
          disabled={isLoading}
          className="flex-1 border-[1.5px] border-[#111] text-[#111] py-3 font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#111] hover:text-[#f0ebe0] transition-colors disabled:opacity-60"
        >
          {isLoading && pendingType === 'signup' ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>

      {error && (
        <p className="pt-3 font-mono text-[9px] text-[#e8001d] uppercase tracking-wide">
          ✕ {error}
        </p>
      )}

      {isLoading && (
        <p className="pt-3 font-mono text-[9px] text-[#888] uppercase tracking-widest animate-pulse">
          Authenticating...
        </p>
      )}
    </form>
  )
}
