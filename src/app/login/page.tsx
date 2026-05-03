import { LoginForm } from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f0ebe0]">
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="font-black text-5xl uppercase tracking-tight text-[#111]">
            Marka.
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#888] mt-2">
            Your endurance race vault
          </p>
        </div>

        <LoginForm error={error} />
      </div>
    </main>
  )
}
