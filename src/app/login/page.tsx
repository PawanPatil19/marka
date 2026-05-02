import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f0ebe0]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="font-black text-5xl uppercase tracking-tight text-[#111]">
            Marka.
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#888] mt-2">
            Your endurance race vault
          </p>
        </div>

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
              className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-3 text-sm font-bold text-[#111] outline-none focus:bg-white"
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
              className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-3 text-sm font-bold text-[#111] outline-none focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              formAction={login}
              className="flex-1 bg-[#111] text-[#f0ebe0] py-3 font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="flex-1 border-[1.5px] border-[#111] text-[#111] py-3 font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#111] hover:text-[#f0ebe0] transition-colors"
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          <p className="pt-3 font-mono text-[9px] text-[#e8001d] uppercase tracking-wide hidden [&:not(:empty)]:block" id="error" />
        </form>
      </div>
    </main>
  )
}
