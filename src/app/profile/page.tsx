import { requireUser } from '@/lib/auth'
import { getProfile, updateProfile } from '@/lib/profile'
import { signOut } from '@/app/login/actions'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const [user, profile] = await Promise.all([requireUser(), getProfile()])
  const stravaConn = await db.profiles.findStravaConnection(user.id)
  const stravaConnected = !!stravaConn
  const { error, saved } = await searchParams

  const displayName = profile?.display_name ?? ''

  return (
    <main className="min-h-screen bg-[#f0ebe0]">
      <div className="max-w-[640px] mx-auto px-8 pt-12 pb-16">

        {/* Header */}
        <div className="border-b-2 border-[#111] pb-6 mb-8">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Your Profile</p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[52px] uppercase leading-none text-[#111]">
            {displayName || 'ATHLETE'}.
          </h1>
          {profile?.username && (
            <p className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest text-[#888] mt-2">
              marka.app/share/{profile.username}
            </p>
          )}
        </div>

        {saved && (
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-green-700 mb-6">Saved.</p>
        )}
        {error && (
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#e8001d] mb-6">{error}</p>
        )}

        <form action={updateProfile} className="space-y-5 mb-8">
          <div>
            <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">
              Display Name
            </label>
            <input
              name="display_name"
              required
              defaultValue={displayName}
              placeholder="Pawan"
              className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-bold text-[#111] text-[15px] outline-none focus:bg-white"
            />
            <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#aaa] mt-1 uppercase tracking-wide">
              Shown on home screen as "Hello, [name]"
            </p>
          </div>

          <div>
            <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">
              Username
            </label>
            <div className="flex items-center border-[1.5px] border-[#111] focus-within:bg-white">
              <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#aaa] pl-3">marka.app/share/</span>
              <input
                name="username"
                required
                defaultValue={profile?.username ?? ''}
                placeholder="pawan"
                className="flex-1 bg-transparent px-2 py-2.5 font-bold text-[#111] text-[15px] outline-none"
              />
            </div>
            <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#aaa] mt-1 uppercase tracking-wide">
              Letters, numbers, underscores only
            </p>
          </div>

          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Email</p>
            <p className="font-bold text-[15px] text-[#111]">{user.email}</p>
          </div>

          <button
            type="submit"
            className="bg-[#111] text-[#f0ebe0] px-8 py-3.5 font-[family-name:var(--font-space-mono)] text-[11px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#333] transition-colors"
          >
            Save Changes →
          </button>
        </form>

        {/* Share link */}
        {profile?.username && (
          <div className="border-[1.5px] border-[#c8c0b0] p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="font-black text-[14px] uppercase text-[#111]">Public Share Link</p>
              <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#888] mt-0.5">marka.app/share/{profile.username}</p>
            </div>
            <Link
              href={`/share/${profile.username}`}
              target="_blank"
              className="flex items-center gap-2 border-[1.5px] border-[#111] px-4 py-2 font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest font-bold text-[#111] hover:bg-[#111] hover:text-[#f0ebe0] transition-colors"
            >
              View Page →
            </Link>
          </div>
        )}

        {/* Strava */}
        <div className="border-[1.5px] border-[#c8c0b0] p-5 mb-8">
          <div className="flex items-center justify-between mb-1">
            <p className="font-black text-[14px] uppercase text-[#111]">Strava</p>
            {stravaConnected && (
              <span className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-green-700">
                Connected ✓
              </span>
            )}
          </div>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mb-4 uppercase tracking-wide">
            {stravaConnected ? 'Import your race activities from Strava.' : 'Connect once to import race activities.'}
          </p>
          {stravaConnected ? (
            <Link
              href="/strava/import"
              className="inline-flex items-center gap-2 bg-[#111] text-[#f0ebe0] px-5 py-2.5 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest font-bold hover:bg-[#333] transition-colors"
            >
              Import Races →
            </Link>
          ) : (
            <a
              href="/api/strava/connect"
              className="inline-flex items-center gap-2 bg-[#fc4c02] text-white px-5 py-2.5 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest font-bold hover:bg-[#e04402] transition-colors"
            >
              Connect Strava →
            </a>
          )}
        </div>

        {/* Sign out */}
        <form action={signOut}>
          <button type="submit" className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#e8001d] transition-colors cursor-pointer">
            Sign Out
          </button>
        </form>
      </div>
    </main>
  )
}
