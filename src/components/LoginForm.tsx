'use client'

import { useState } from 'react'
import { login, signup } from '@/app/login/actions'

export function LoginForm({ error }: { error?: string }) {
  const [loading, setLoading] = useState<'login' | 'signup' | null>(null)

  const handleAction = (action: typeof login) => async (formData: FormData) => {
    setLoading(action === login ? 'login' : 'signup')
    await action(formData)
    setLoading(null)
  }

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
          disabled={!!loading}
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
          disabled={!!loading}
          className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-3 text-sm font-bold text-[#111] outline-none focus:bg-white disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <div className="pt-4 flex gap-3">
        <button
          formAction={handleAction(login)}
          disabled={!!loading}
          className="flex-1 bg-[#111] text-[#f0ebe0] py-3 font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer disabled:opacity-60"
        >
          {loading === 'login' ? 'Signing In...' : 'Sign In'}
        </button>
        <button
          formAction={handleAction(signup)}
          disabled={!!loading}
          className="flex-1 border-[1.5px] border-[#111] text-[#111] py-3 font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#111] hover:text-[#f0ebe0] transition-colors disabled:opacity-60"
        >
          {loading === 'signup' ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>

      {error && (
        <p className="pt-3 font-mono text-[9px] text-[#e8001d] uppercase tracking-wide">
          ✕ {error}
        </p>
      )}

      {loading && (
        <p className="pt-3 font-mono text-[9px] text-[#888] uppercase tracking-widest animate-pulse">
          Authenticating...
        </p>
      )}
    </form>
  )
}
