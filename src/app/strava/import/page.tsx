import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { StravaImportForm } from '@/components/StravaImportForm'
import { getValidStravaToken, isRace, mapSportType, inferDistanceCategory, secondsToTime } from '@/lib/strava'
import type { StravaActivity } from '@/lib/strava'

export default async function StravaImportPage() {
  const user = await requireUser()
  const token = await getValidStravaToken(user.id)

  if (!token) redirect('/profile?error=strava_not_connected')

  const activities: StravaActivity[] = []
  let page = 1
  while (true) {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const batch: StravaActivity[] = await res.json()
    activities.push(...batch)
    if (batch.length < 200) break
    page++
  }

  const races = activities
    .filter(isRace)
    .map(a => ({
      stravaId: a.id,
      name: a.name,
      date: a.start_date.slice(0, 10),
      sport_type: mapSportType(a.sport_type),
      distance_category: inferDistanceCategory(a.sport_type, a.distance),
      finish_time: secondsToTime(a.elapsed_time),
    }))

  return (
    <main className="min-h-screen bg-[#f0ebe0]">
      <div className="max-w-[640px] mx-auto px-8 pt-12 pb-16">

        <div className="border-b-2 border-[#111] pb-6 mb-8">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Strava Import</p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[52px] uppercase leading-none text-[#111]">
            {races.length} Race{races.length !== 1 ? 's' : ''} Found.
          </h1>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-2 uppercase tracking-wide">
            Activities marked as Race on Strava. Verify location for each before importing.
          </p>
        </div>

        <StravaImportForm races={races} userId={user.id} />

      </div>
    </main>
  )
}
