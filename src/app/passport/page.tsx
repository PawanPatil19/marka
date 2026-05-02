import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import type { Badge, Race } from '@/lib/types'

const PB_LABELS: Record<string, string> = {
  '5k': '5K', '10k': '10K', 'half': 'Half Marathon', 'full': 'Full Marathon', 'ultra': 'Ultra',
  'sprint': 'Sprint Tri', 'olympic': 'Olympic Tri', '70.3': '70.3 Triathlon', 'ironman': 'Ironman',
}

function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(':').map(Number)
  return h * 3600 + m * 60 + (s || 0)
}

function computePBs(races: Race[]): { label: string; race: Race }[] {
  const best = new Map<string, Race>()
  for (const race of races) {
    const key = `${race.sport_type}__${race.distance_category}`
    const existing = best.get(key)
    if (!existing || timeToSeconds(race.finish_time) < timeToSeconds(existing.finish_time)) {
      best.set(key, race)
    }
  }
  return Array.from(best.entries()).map(([key, race]) => {
    const dist = key.split('__')[1]
    const label = PB_LABELS[dist] ?? dist.toUpperCase()
    return { label, race }
  })
}

function countryFlag(code: string) {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

const MILESTONE_META: Record<string, { icon: string; desc: string }> = {
  first_finish:    { icon: '🏁', desc: 'First race ever' },
  finisher_703:    { icon: '🥈', desc: '70.3 Triathlon' },
  finisher_ironman:{ icon: '🏆', desc: '140.6 miles' },
  finisher_marathon:{ icon: '🏃', desc: 'Full marathon' },
  finisher_ultra:  { icon: '⚡', desc: 'Ultramarathon' },
  count_5:         { icon: '✋', desc: '5 races finished' },
  count_10:        { icon: '🔟', desc: '10 races finished' },
  count_25:        { icon: '🎖', desc: '25 races finished' },
  count_50:        { icon: '💎', desc: '50 races finished' },
}

const ALL_MILESTONES = ['first_finish', 'finisher_703', 'finisher_ironman', 'finisher_marathon', 'finisher_ultra', 'count_5', 'count_10', 'count_25', 'count_50']

export default async function PassportPage() {
  const user = await requireUser()

  const [badges, races] = await Promise.all([
    db.badges.findByUser(user.id),
    db.races.findByUser(user.id),
  ])

  const earnedKeys = new Set(badges.map(b => b.key))
  const pbs = computePBs(races)
  const geography = badges.filter(b => b.category === 'geography')
  const nonGeo = badges.filter(b => b.category !== 'geography')
  const lockedMilestones = ALL_MILESTONES.filter(k => !earnedKeys.has(k))
  const raceCount = races.length

  return (
    <main className="min-h-screen bg-[#f0ebe0]">

      {/* Page header */}
      <div className="flex items-end justify-between border-b-2 border-[#111] px-10 pt-7 pb-0">
        <div>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Achievements</p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[52px] uppercase leading-none text-[#111] pb-3">Passport</h1>
        </div>
        <div className="flex items-center gap-8 pb-4">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] uppercase tracking-widest">
            {raceCount} races · {geography.length} countries · {badges.length} badges
          </p>
          <div className="flex items-center gap-2">
            <div className="w-40 h-1 bg-[#ddd]">
              <div className="h-1 bg-[#111]" style={{ width: `${Math.min(100, (badges.length / 18) * 100)}%` }} />
            </div>
            <span className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold text-[#111]">
              {badges.length} / 18
            </span>
          </div>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="py-24 text-center px-8">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#bbb] mb-6">No badges yet</p>
          <Link href="/races/new" className="font-[family-name:var(--font-barlow-condensed)] font-black text-3xl uppercase text-[#111] hover:text-[#e8001d] transition-colors">
            Log a race to earn badges →
          </Link>
        </div>
      ) : (
        <div className="px-10 py-7 space-y-8">

          {/* Geography */}
          {geography.filter(b => b.key.replace('country_', '')).length > 0 && (
            <div>
              <div className="border-b-2 border-[#111] pb-2 mb-0">
                <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#111]">
                  § Geography · {geography.filter(b => b.key.replace('country_', '').length === 2).length} {geography.length === 1 ? 'Country' : 'Countries'}
                </p>
              </div>
              <div className="flex flex-wrap border-[1.5px] border-[#111] border-t-0">
                {geography
                  .filter(b => b.key.replace('country_', '').length === 2)
                  .map((badge, i, arr) => {
                    const code = badge.key.replace('country_', '')
                    return (
                      <div
                        key={badge.key}
                        className={`p-5 text-center w-28 flex-shrink-0 border-r border-b border-[#c8c0b0] ${i === arr.length - 1 ? 'border-r-0' : ''}`}
                      >
                        <div className="text-3xl mb-2">{countryFlag(code)}</div>
                        <p className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold uppercase text-[#111]">{code}</p>
                        <p className="font-[family-name:var(--font-space-mono)] text-[7px] text-[#e8001d] font-bold mt-1">EARNED</p>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Personal Bests */}
          {pbs.length > 0 && (
            <div>
              <div className="border-b-2 border-[#111] pb-2 mb-0">
                <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#111]">
                  § Personal Bests
                </p>
              </div>
              <div className="border-[1.5px] border-[#111] border-t-0 grid grid-cols-3">
                {pbs.map(({ label, race }, i) => (
                  <Link
                    key={`${race.sport_type}__${race.distance_category}`}
                    href={`/races/${race.id}`}
                    className={`flex items-center justify-between px-5 py-4 hover:bg-[#e4ddd0] transition-colors group
                      ${i % 3 !== 2 ? 'border-r border-[#c8c0b0]' : ''}
                      ${i < pbs.length - 3 ? 'border-b border-[#c8c0b0]' : ''}
                    `}
                  >
                    <div>
                      <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">{label}</p>
                      <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[32px] leading-none text-[#111] group-hover:text-[#e8001d] transition-colors">
                        {race.finish_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[11px] uppercase text-[#111] truncate max-w-[140px]">{race.name}</p>
                      <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-0.5">
                        {race.location_city} · {new Date(race.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div>
            <div className="border-b-2 border-[#111] pb-2 mb-0">
              <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#111]">
                § Milestones
              </p>
            </div>
            <div className="border-[1.5px] border-[#111] border-t-0 grid grid-cols-3">
              {/* Earned */}
              {nonGeo.map((badge, i) => {
                const meta = MILESTONE_META[badge.key]
                return (
                  <div key={badge.key} className={`flex items-center gap-3 px-5 py-4 border-b border-[#c8c0b0] ${i % 3 !== 2 ? 'border-r border-[#c8c0b0]' : ''}`}>
                    <div className="w-10 h-10 bg-[#111] flex items-center justify-center text-lg flex-shrink-0">
                      {meta?.icon ?? '🏅'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[13px] uppercase text-[#111] leading-tight">{badge.name}</p>
                      <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#e8001d] font-bold mt-0.5">
                        ✓ {new Date(badge.earned_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                )
              })}
              {/* Locked */}
              {lockedMilestones.map((key, i) => {
                const meta = MILESTONE_META[key]
                const totalEarned = nonGeo.length
                const idx = totalEarned + i
                return (
                  <div key={key} className={`flex items-center gap-3 px-5 py-4 border-b border-[#c8c0b0] opacity-30 ${idx % 3 !== 2 ? 'border-r border-[#c8c0b0]' : ''}`}>
                    <div className="w-10 h-10 border-[1.5px] border-[#999] flex items-center justify-center text-lg flex-shrink-0">
                      {meta?.icon ?? '🏅'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[13px] uppercase text-[#888] leading-tight">{key.replace(/_/g, ' ')}</p>
                      <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#bbb] mt-0.5">{meta?.desc ?? ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </main>
  )
}
