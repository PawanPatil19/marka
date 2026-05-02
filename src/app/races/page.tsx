import { getRaces } from '@/lib/races'
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

export default async function RacesPage() {
  const races = await getRaces()

  const years = [...new Set(races.map(r => r.date.slice(0, 4)))].sort((a, b) => Number(b) - Number(a))
  const sportCounts = races.reduce<Record<string, number>>((acc, r) => {
    acc[r.sport_type] = (acc[r.sport_type] ?? 0) + 1
    return acc
  }, {})

  function groupByYear(list: Race[]) {
    const g: Record<string, Race[]> = {}
    for (const race of list) {
      const y = race.date.slice(0, 4)
      if (!g[y]) g[y] = []
      g[y].push(race)
    }
    return g
  }

  const groups = groupByYear(races)

  return (
    <div className="flex flex-1" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* Left panel */}
      <aside className="w-[280px] flex-shrink-0 border-r-2 border-[#111] sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex flex-col">

        {/* Total */}
        <div className="px-5 pt-5 pb-4 border-b-[1.5px] border-[#c8c0b0]">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-0.5">Total Races</p>
          <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[64px] leading-none text-[#111]">{races.length}</p>
        </div>

        {/* Sport breakdown */}
        {Object.keys(sportCounts).length > 0 && (
          <div className="px-5 py-4 border-b-[1.5px] border-[#c8c0b0]">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-3">By Sport</p>
            <div className="flex flex-col gap-0">
              {Object.entries(sportCounts).map(([sport, count]) => (
                <div key={sport} className="flex items-center justify-between py-2 border-b border-[#e8e0d0] last:border-0">
                  <span className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-wide text-[#444]">
                    {sport.replace('_', ' ')}
                  </span>
                  <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold" style={{ color: SPORT_COLORS[sport] ?? '#888' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Year filter */}
        {years.length > 1 && (
          <div className="px-5 py-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-3">By Year</p>
            <div className="flex flex-wrap gap-1.5">
              {years.map(year => (
                <span key={year} className="px-3 py-1 border-[1.5px] border-[#c8c0b0] font-[family-name:var(--font-space-mono)] text-[9px] font-bold text-[#888]">
                  {year}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 border-b-[1.5px] border-[#111]">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-4xl uppercase text-[#111]">Race Log</h1>
        </div>

        {races.length === 0 ? (
          <div className="py-24 text-center px-8">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#bbb] mb-6">No races yet</p>
            <Link href="/races/new" className="font-[family-name:var(--font-barlow-condensed)] font-black text-3xl uppercase text-[#111] hover:text-[#e8001d] transition-colors">
              Log your first race →
            </Link>
          </div>
        ) : (
          years.map(year => (
            <div key={year}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#c8c0b0]">
                <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#111]">
                  § {year}
                </span>
                <span className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888]">
                  {groups[year].length} {groups[year].length === 1 ? 'race' : 'races'}
                </span>
              </div>
              {groups[year].map((race: Race) => {
                const idx = races.indexOf(race)
                const num = String(races.length - idx).padStart(3, '0')
                return (
                  <Link
                    key={race.id}
                    href={`/races/${race.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-[#c8c0b0] hover:bg-[#e4ddd0] transition-colors group"
                  >
                    <span className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#bbb] w-10 flex-shrink-0">#{num}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[15px] uppercase text-[#111] truncate group-hover:text-[#e8001d] transition-colors">
                        {race.name}
                      </p>
                      <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-0.5">
                        {race.location_country} · {new Date(race.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {race.distance_category.toUpperCase()}
                      </p>
                    </div>
                    <span className="font-[family-name:var(--font-barlow-condensed)] font-black text-[22px] text-[#111] flex-shrink-0">
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
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
