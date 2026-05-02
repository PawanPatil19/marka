import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Badge } from '@/lib/types'

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('badges').select('*').eq('user_id', user.id).order('earned_at', { ascending: true })

  const badges = (rows ?? []) as Badge[]
  const earnedKeys = new Set(badges.map(b => b.key))

  const geography = badges.filter(b => b.category === 'geography')
  const nonGeo = badges.filter(b => b.category !== 'geography')
  const lockedMilestones = ALL_MILESTONES.filter(k => !earnedKeys.has(k))

  const { data: raceRows } = await supabase.from('races').select('*').eq('user_id', user.id)
  const raceCount = raceRows?.length ?? 0

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
        <div className="px-10 py-7 grid grid-cols-2 gap-8">

          {/* Geography */}
          <div>
            <div className="border-b-2 border-[#111] pb-2 mb-0">
              <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#111]">
                § Geography · {geography.length} {geography.length === 1 ? 'Country' : 'Countries'}
              </p>
            </div>

            {geography.length > 0 && (
              <div className="grid grid-cols-5 border-[1.5px] border-[#111] border-t-0">
                {geography.map((badge, i) => {
                  const code = badge.key.replace('country_', '')
                  return (
                    <div
                      key={badge.key}
                      className={`p-4 text-center ${i % 5 !== 4 ? 'border-r border-[#c8c0b0]' : ''} border-b border-[#c8c0b0]`}
                    >
                      <div className="text-3xl mb-1.5">{countryFlag(code)}</div>
                      <p className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold uppercase">{code}</p>
                      <p className="font-[family-name:var(--font-space-mono)] text-[7px] text-[#e8001d] font-bold mt-1">EARNED</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Milestones & Count */}
          <div>
            <div className="border-b-2 border-[#111] pb-2 mb-0">
              <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#111]">
                § Milestones
              </p>
            </div>
            <div className="border-[1.5px] border-[#111] border-t-0">

              {/* Earned */}
              {nonGeo.map(badge => {
                const meta = MILESTONE_META[badge.key]
                return (
                  <div key={badge.key} className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8c0b0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#111] flex items-center justify-center text-lg flex-shrink-0">
                        {meta?.icon ?? '🏅'}
                      </div>
                      <div>
                        <p className="font-black text-[14px] uppercase text-[#111]">{badge.name}</p>
                        <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888]">
                          {new Date(badge.earned_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold text-[#e8001d]">✓ EARNED</span>
                  </div>
                )
              })}

              {/* Locked */}
              {lockedMilestones.map(key => {
                const meta = MILESTONE_META[key]
                return (
                  <div key={key} className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8c0b0] opacity-35 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-[1.5px] border-[#999] flex items-center justify-center text-lg flex-shrink-0">
                        {meta?.icon ?? '🏅'}
                      </div>
                      <div>
                        <p className="font-black text-[14px] uppercase text-[#888]">{key.replace(/_/g, ' ')}</p>
                        <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#bbb]">{meta?.desc ?? ''}</p>
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold text-[#bbb]">LOCKED</span>
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
