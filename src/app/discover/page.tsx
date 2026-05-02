import { db } from '@/lib/db'
import { getOptionalUser } from '@/lib/auth'
import { attendRace, unattendRace } from '@/lib/discover'
import type { DiscoverRace } from '@/lib/types'

const SPORT_COLORS: Record<string, string> = {
  triathlon: '#e8001d', running: '#f59e0b', cycling: '#3b82f6',
  duathlon: '#8b5cf6', open_water: '#06b6d4', other: '#888',
}
const SPORT_LABELS: Record<string, string> = {
  triathlon: 'TRI', running: 'RUN', cycling: 'BIKE',
  duathlon: 'DUAL', open_water: 'SWIM', other: 'OTH',
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

export default async function DiscoverPage() {
  const user = await getOptionalUser()

  const [races, attendingIds] = await Promise.all([
    db.discover.findAll(),
    user ? db.discover.getAttendingIds(user.id) : Promise.resolve(new Set<string>()),
  ])

  let racedCountries = new Set<string>()
  if (user) {
    const myRaces = await db.races.findByUser(user.id)
    racedCountries = new Set(myRaces.map(r => r.location_country.toUpperCase()))
  }

  const now = new Date()
  const attending = races.filter(r => attendingIds.has(r.id) && new Date(r.date) >= now)
  const upcoming = races.filter(r => !attendingIds.has(r.id) && new Date(r.date) >= now)
  const past = races.filter(r => new Date(r.date) < now)

  return (
    <main className="min-h-screen bg-[#f0ebe0]">

      {/* Header */}
      <div className="border-b-2 border-[#111] px-5 sm:px-14 pt-8 sm:pt-10 pb-6 sm:pb-8 flex items-end justify-between">
        <div>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-2">
            Race Calendar
          </p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[48px] sm:text-[72px] uppercase leading-[0.88] text-[#111]">
            Discover
          </h1>
          <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#888] mt-3">
            Curated endurance races across Asia &amp; beyond · {upcoming.length + attending.length} upcoming
          </p>
        </div>
        {attending.length > 0 && (
          <div className="pb-2 text-right">
            <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[40px] sm:text-[52px] leading-none text-[#111]">{attending.length}</p>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888]">I'm In</p>
          </div>
        )}
      </div>

      {/* Badge legend */}
      {user && (
        <div className="flex items-center gap-3 px-5 sm:px-14 py-3 border-b border-[#c8c0b0] bg-[#ebe5d5]">
          <div className="w-2 h-2 bg-[#e8001d] flex-shrink-0" />
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888]">
            Red dot = new country — race here to earn a geography badge
          </p>
        </div>
      )}

      <div className="max-w-[860px] mx-auto w-full px-4 sm:px-14 pt-6 pb-16">

        {/* Attending */}
        {attending.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center border-b-[1.5px] border-[#111] pb-0">
              <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black text-2xl uppercase text-[#111] pb-2">
                I'm In
              </h2>
            </div>
            {attending.map((race) => (
              <RaceRow
                key={race.id}
                race={race}
                isNewCountry={!!user && !racedCountries.has(race.location_country.toUpperCase())}
                isAttending
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length === 0 && attending.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#bbb]">
              No upcoming races listed yet
            </p>
          </div>
        ) : upcoming.length > 0 && (
          <div className={attending.length > 0 ? '' : ''}>
            <div className="flex items-center border-b-[1.5px] border-[#111] pb-0">
              <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black text-2xl uppercase text-[#111] pb-2">
                Upcoming
              </h2>
            </div>
            {upcoming.map((race) => (
              <RaceRow
                key={race.id}
                race={race}
                isNewCountry={!!user && !racedCountries.has(race.location_country.toUpperCase())}
                isAttending={false}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center border-b-[1.5px] border-[#111] pb-0">
              <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black text-2xl uppercase text-[#111] pb-2 opacity-50">
                Past
              </h2>
            </div>
            {past.map((race) => (
              <RaceRow
                key={race.id}
                race={race}
                isNewCountry={false}
                isAttending={false}
                isLoggedIn={!!user}
                past
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function RaceRow({ race, isNewCountry, isAttending, isLoggedIn, past = false }: {
  race: DiscoverRace
  isNewCountry: boolean
  isAttending: boolean
  isLoggedIn: boolean
  past?: boolean
}) {
  const dateStr = new Date(race.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase()

  const daysAway = Math.round((new Date(race.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const timeLabel = daysAway > 60 ? `${Math.round(daysAway / 30)}mo` : `${daysAway}d`

  return (
    <div className={`flex items-center gap-2 sm:gap-3 py-4 border-b border-[#c8c0b0] px-2 -mx-2 ${past ? 'opacity-40' : ''} ${isAttending ? 'bg-[#f5f0e8]' : ''}`}>

      {/* Flag + new-country dot */}
      <div className="w-10 flex-shrink-0 text-center relative">
        <span className="text-xl">{countryFlag(race.location_country)}</span>
        {isNewCountry && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#e8001d] rounded-full" />
        )}
      </div>

      {/* Name + meta */}
      <a
        href={race.registration_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 group"
      >
        <div className="flex items-center gap-2">
          <p className="font-black text-[15px] uppercase text-[#111] truncate group-hover:text-[#e8001d] transition-colors">
            {race.name}
          </p>
          {isNewCountry && (
            <span className="font-[family-name:var(--font-space-mono)] text-[7px] font-bold uppercase tracking-widest text-white bg-[#e8001d] px-1.5 py-0.5 flex-shrink-0">
              NEW COUNTRY
            </span>
          )}
        </div>
        <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-0.5">
          {race.location_city}, {race.location_country} · {dateStr}
          {race.description && ` · ${race.description}`}
        </p>
      </a>

      {/* Attend button */}
      {isLoggedIn && !past && (
        <form action={async () => {
          'use server'
          if (isAttending) await unattendRace(race.id)
          else await attendRace(race.id)
        }}>
          <button
            type="submit"
            className={`font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest font-bold px-3 py-1.5 border flex-shrink-0 transition-colors cursor-pointer ${
              isAttending
                ? 'border-[#111] bg-[#111] text-[#f0ebe0] hover:bg-[#e8001d] hover:border-[#e8001d]'
                : 'border-[#c8c0b0] text-[#888] hover:border-[#111] hover:text-[#111]'
            }`}
          >
            {isAttending ? "✓ I'M IN" : "I'M IN"}
          </button>
        </form>
      )}

      {/* Countdown */}
      {!past && (
        <div className="text-right flex-shrink-0 w-10">
          <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[20px] leading-none text-[#111]">
            {timeLabel}
          </p>
          <p className="font-[family-name:var(--font-space-mono)] text-[7px] text-[#bbb] uppercase">away</p>
        </div>
      )}

      {/* Sport label */}
      <span
        className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold w-9 text-right flex-shrink-0"
        style={{ color: SPORT_COLORS[race.sport_type] ?? '#888' }}
      >
        {SPORT_LABELS[race.sport_type] ?? 'OTH'}
      </span>

      {/* External link */}
      <a href={race.registration_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        <svg className="text-[#ccc] hover:text-[#888] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </div>
  )
}
