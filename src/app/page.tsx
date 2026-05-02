import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRaces } from '@/lib/races'
import { getProfile } from '@/lib/profile'
import Link from 'next/link'
import type { Race } from '@/lib/types'

const SPORT_COLORS: Record<string, string> = {
  triathlon: '#e8001d', running: '#f59e0b', cycling: '#3b82f6',
  duathlon: '#8b5cf6', open_water: '#06b6d4', other: '#888',
}
const SPORT_LABELS: Record<string, string> = {
  triathlon: 'TRI', running: 'RUN', cycling: 'BIKE',
  duathlon: 'DUAL', open_water: 'SWIM', other: 'OTH',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [races, profile] = await Promise.all([getRaces(), getProfile()])

  const countries = new Set(races.map(r => r.location_country)).size
  const recentRaces = races.slice(0, 6)

  const { data: badgeRows } = await supabase.from('badges').select('key').eq('user_id', user.id)
  const badgeCount = badgeRows?.length ?? 0

  const name = (profile?.display_name ?? user.email?.split('@')[0] ?? 'Athlete').toUpperCase()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <main className="min-h-screen bg-[#f0ebe0]">

      {/* Hero */}
      <div className="border-b-2 border-[#111] flex items-end justify-between px-14 pt-10 pb-8">
        <div>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-2">
            {today}
          </p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[80px] uppercase leading-[0.88] text-[#111]">
            HELLO,<br />{name}.
          </h1>
        </div>

        {/* Stats */}
        <div className="flex gap-12 pb-2 items-end">
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1.5">Races</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[56px] leading-none text-[#111]">{races.length}</p>
          </div>
          <div className="w-px bg-[#c8c0b0] self-stretch my-2" />
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1.5">Countries</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[56px] leading-none text-[#111]">{countries}</p>
          </div>
          <div className="w-px bg-[#c8c0b0] self-stretch my-2" />
          <div className="bg-[#e8001d] px-5 pt-3 pb-0 mb-[-32px]">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-white/65 mb-1.5">Passport</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[56px] leading-none text-white">{badgeCount}</p>
            <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-white/65 mt-1 mb-3">BADGES EARNED</p>
          </div>
        </div>
      </div>

      {/* Race list */}
      <div className="max-w-[860px] mx-auto w-full px-14 flex-1">

        {/* Header row */}
        <div className="flex items-center justify-between border-b-[1.5px] border-[#111] pt-5">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black text-3xl uppercase text-[#111]">
            Recent Races
          </h2>
          <Link
            href="/races"
            className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#111] transition-colors pb-2"
          >
            View All →
          </Link>
        </div>

        {races.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#bbb] mb-6">No races yet</p>
            <Link href="/races/new" className="font-[family-name:var(--font-barlow-condensed)] font-black text-3xl uppercase text-[#111] hover:text-[#e8001d] transition-colors">
              Log your first race →
            </Link>
          </div>
        ) : (
          <>
            {recentRaces.map((race: Race, i) => (
              <Link
                key={race.id}
                href={`/races/${race.id}`}
                className="flex items-center gap-3 py-4 border-b border-[#c8c0b0] hover:bg-[#e4ddd0] transition-colors px-2 -mx-2 group"
              >
                <span className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#bbb] w-10 flex-shrink-0">
                  #{String(races.length - i).padStart(3, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[15px] uppercase text-[#111] truncate group-hover:text-[#e8001d] transition-colors">
                    {race.name}
                  </p>
                  <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-0.5">
                    {race.location_country} · {new Date(race.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {race.distance_category.toUpperCase()}
                  </p>
                </div>
                <span className="font-[family-name:var(--font-barlow-condensed)] font-black text-[22px] text-[#111]">
                  {race.finish_time}
                </span>
                <span className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold w-9 text-right flex-shrink-0"
                  style={{ color: SPORT_COLORS[race.sport_type] ?? '#888' }}>
                  {SPORT_LABELS[race.sport_type] ?? 'OTH'}
                </span>
                <svg className="text-[#ccc] flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}

            {races.length > 6 && (
              <div className="py-8 text-center">
                <Link
                  href="/races"
                  className="border-2 border-[#111] px-10 py-3 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest font-bold text-[#111] hover:bg-[#111] hover:text-[#f0ebe0] transition-colors inline-block"
                >
                  View All {races.length} Races ↗
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
