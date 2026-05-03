import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidStravaToken, isRace, mapSportType, inferDistanceCategory, secondsToTime } from '@/lib/strava'
import type { StravaActivity } from '@/lib/strava'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ activities: [] })

  const token = await getValidStravaToken(user.id)
  if (!token) return NextResponse.json({ activities: [] })

  // Fetch activities uploaded in the last 30 minutes
  const after = Math.floor(Date.now() / 1000) - 30 * 60

  let stravaActivities: StravaActivity[] = []
  try {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=10&after=${after}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return NextResponse.json({ activities: [] })
    stravaActivities = await res.json()
  } catch {
    return NextResponse.json({ activities: [] })
  }

  const raceActivities = stravaActivities.filter(isRace)
  if (raceActivities.length === 0) return NextResponse.json({ activities: [] })

  // Filter out activities already imported
  const stravaIds = raceActivities.map(a => a.id)
  const { data: existing } = await supabase
    .from('races')
    .select('strava_activity_id')
    .eq('user_id', user.id)
    .in('strava_activity_id', stravaIds)

  const importedIds = new Set((existing ?? []).map(r => r.strava_activity_id))

  const newActivities = raceActivities
    .filter(a => !importedIds.has(a.id))
    .map(a => ({
      stravaId: a.id,
      name: a.name,
      date: a.start_date.slice(0, 10),
      sport_type: mapSportType(a.sport_type),
      distance_category: inferDistanceCategory(a.sport_type, a.distance),
      finish_time: secondsToTime(a.elapsed_time),
    }))

  return NextResponse.json({ activities: newActivities })
}
