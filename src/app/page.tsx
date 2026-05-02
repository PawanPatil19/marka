import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getRaces } from '@/lib/races'
import { getProfile } from '@/lib/profile'
import Link from 'next/link'
import { HeroGreeting } from '@/components/HeroGreeting'
import { AnimatedCounter } from '@/components/AnimatedCounter'
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
  const user = await requireUser()

  const [races, profile, badges] = await Promise.all([
    getRaces(),
    getProfile(),
    db.badges.findByUser(user.id),
  ])

  const countries = new Set(races.map(r => r.location_country)).size
  const recentRaces = races.slice(0, 6)
  const name = (profile?.display_name ?? user.email?.split('@')[0] ?? 'Athlete').toUpperCase()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  const COUNT_THRESHOLDS = [5, 10, 25, 50]
  const nextCountTarget = COUNT_THRESHOLDS.find(t => races.length < t) ?? null
  const racesToNext = nextCountTarget ? nextCountTarget - races.length : null

  return (
    <main className="min-h-screen bg-[#f0ebe0]">

      {/* Hero */}
      <div className="border-b-2 border-[#111] px-5 sm:px-14 pt-8 pb-6 sm:pb-8">
        <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-2">
          {today}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-0">
          <HeroGreeting name={name} />

          {/* Stats */}
          <div className="flex gap-6 sm:gap-12 pb-0 sm:pb-2 items-end">
            <div>
              <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1.5">Races</p>
              <AnimatedCounter value={races.length} className="font-[family-name:var(--font-barlow-condensed)] font-black text-[40px] sm:text-[56px] leading-none text-[#111]" />
            </div>
            <div className="w-px bg-[#c8c0b0] self-stretch my-2" />
            <div>
              <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1.5">Countries</p>
              <AnimatedCounter value={countries} className="font-[family-name:var(--font-barlow-condensed)] font-black text-[40px] sm:text-[56px] leading-none text-[#111]" />
            </div>
            <div className="w-px bg-[#c8c0b0] self-stretch my-2" />
            <div className="bg-[#e8001d] px-4 sm:px-5 pt-3 pb-0 mb-0 sm:mb-[-32px]">
              <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-white/65 mb-1.5">Passport</p>
              <AnimatedCounter value={badges.length} className="font-[family-name:var(--font-barlow-condensed)] font-black text-[40px] sm:text-[56px] leading-none text-white" />
              <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-white/65 mt-1 mb-3">BADGES EARNED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next badge callout */}
      {racesToNext !== null && (
        <Link href="/passport" className="group flex items-center justify-between px-5 sm:px-14 py-3.5 border-b border-[#c8c0b0] bg-[#ebe5d5] hover:bg-[#e4ddd0] transition-colors">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <p className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-[#888] flex-shrink-0">Next Badge</p>
            <div className="w-px h-3 bg-[#c8c0b0] flex-shrink-0" />
            <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[16px] sm:text-[18px] uppercase text-[#111] truncate">
              <span className="text-[#e8001d]">{racesToNext}</span> more race{racesToNext !== 1 ? 's' : ''} → {nextCountTarget} Races
            </p>
          </div>
          <p className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-[#888] group-hover:text-[#111] transition-colors flex-shrink-0 ml-3">
            View →
          </p>
        </Link>
      )}

      {/* Race list */}
      <div className="max-w-[860px] mx-auto w-full px-5 sm:px-14 flex-1">
        <div className="flex items-center justify-between border-b-[1.5px] border-[#111] pt-5">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black text-3xl uppercase text-[#111]">
            Recent Races
          </h2>
          <Link href="/races" className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#111] transition-colors pb-2">
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
                className="flex items-center gap-2 sm:gap-3 py-4 border-b border-[#c8c0b0] hover:bg-[#e4ddd0] transition-colors px-2 -mx-2 group"
              >
                <span className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#bbb] w-8 sm:w-10 flex-shrink-0 hidden sm:block">
                  #{String(races.length - i).padStart(3, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[14px] sm:text-[15px] uppercase text-[#111] truncate group-hover:text-[#e8001d] transition-colors">
                    {race.name}
                  </p>
                  <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-0.5 truncate">
                    {race.location_country} · {new Date(race.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {race.distance_category.toUpperCase()}
                  </p>
                </div>
                <span className="font-[family-name:var(--font-barlow-condensed)] font-black text-[18px] sm:text-[22px] text-[#111] flex-shrink-0">
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
                <Link href="/races" className="border-2 border-[#111] px-8 sm:px-10 py-3 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest font-bold text-[#111] hover:bg-[#111] hover:text-[#f0ebe0] transition-colors inline-block">
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
