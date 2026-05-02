import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Race, Badge } from '@/lib/types'

function sportEmoji(sport: string) {
  const map: Record<string, string> = {
    triathlon: '🏊', running: '🏃', cycling: '🚴',
    duathlon: '🤸', open_water: '🌊', other: '⚡',
  }
  return map[sport] ?? '⚡'
}

function countryFlag(code: string) {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

export default async function SharePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const profile = await db.profiles.findByUsername(username)
  if (!profile) notFound()

  const [races, badges] = await Promise.all([
    db.races.findByUser(profile.id),
    db.badges.findByUser(profile.id),
  ])
  const countries = new Set(races.map(r => r.location_country)).size

  return (
    <main className="min-h-screen bg-[#f0ebe0]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="border-b-2 border-[#111] pb-8 mb-8">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#888] mb-2">Athlete Passport</p>
          <h1 className="font-black text-5xl uppercase text-[#111] leading-none mb-6">
            {profile.display_name.toUpperCase()}.
          </h1>
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="font-black text-2xl text-[#111]">{races.length}</p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[#888]">Races</p>
            </div>
            <div className="border-l border-[#ddd] pl-6">
              <p className="font-black text-2xl text-[#111]">{countries}</p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[#888]">Countries</p>
            </div>
            <div className="border-l border-[#ddd] pl-6">
              <p className="font-black text-2xl text-[#e8001d]">{badges.length}</p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[#888]">Badges</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-10">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#888] mb-4 border-b border-[#ddd] pb-2">
              Badges — {badges.length}
            </p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {badges.map(badge => {
                const isCountry = badge.category === 'geography'
                const code = isCountry ? badge.key.replace('country_', '') : null
                return (
                  <div key={badge.key} className="border-[1.5px] border-[#111] p-3 flex flex-col items-center text-center">
                    <span className="text-2xl mb-1">
                      {code ? countryFlag(code) : badge.category === 'milestone' ? '🏅' : '⭐'}
                    </span>
                    <p className="font-mono text-[7px] uppercase tracking-wide text-[#888] leading-tight">
                      {badge.name}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Race log */}
        {races.length > 0 && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#888] mb-4 border-b border-[#ddd] pb-2">
              Race Log — {races.length}
            </p>
            <div className="space-y-px">
              {races.map((race, i) => (
                <div
                  key={race.id}
                  className="flex items-center gap-4 py-3 border-b border-[#e8e0d0] px-2 -mx-2"
                >
                  <span className="font-mono text-[9px] text-[#bbb] w-8 flex-shrink-0">
                    #{String(races.length - i).padStart(3, '0')}
                  </span>
                  <span className="text-base flex-shrink-0">{sportEmoji(race.sport_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm uppercase text-[#111] truncate">{race.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-[#888]">
                      {race.location_city}, {race.location_country} · {race.distance_category}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-sm text-[#111]">{race.finish_time}</p>
                    <p className="font-mono text-[9px] text-[#bbb]">
                      {new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-[#ddd] pt-6">
          <p className="font-mono text-[8px] uppercase tracking-widest text-[#bbb]">Built with Marka</p>
        </div>
      </div>
    </main>
  )
}
