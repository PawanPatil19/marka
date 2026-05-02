import { db } from './db'
import type { Race, Badge } from './types'

const COUNTRY_NAMES: Record<string, string> = {
  SG: 'Singapore', DE: 'Germany', ID: 'Indonesia', MY: 'Malaysia',
  AU: 'Australia', JP: 'Japan', GB: 'United Kingdom', US: 'United States',
  FR: 'France', TH: 'Thailand', PH: 'Philippines', NZ: 'New Zealand',
}

const COUNT_THRESHOLDS = [5, 10, 25, 50] as const

export function computeBadges(races: Race[]): Badge[] {
  if (races.length === 0) return []

  const badges: Badge[] = []
  const sorted = [...races].sort((a, b) => a.date.localeCompare(b.date))

  // ── first_finish ──────────────────────────────────────────
  badges.push({
    key: 'first_finish',
    name: 'First Finish',
    category: 'milestone',
    earned_at: sorted[0].date,
  })

  // ── country badges ────────────────────────────────────────
  const seenCountries = new Set<string>()
  for (const race of sorted) {
    const code = race.location_country
    if (!seenCountries.has(code)) {
      seenCountries.add(code)
      badges.push({
        key: `country_${code}`,
        name: `${COUNTRY_NAMES[code] ?? code} Explorer`,
        category: 'geography',
        earned_at: race.date,
      })
    }
  }

  // ── distance milestone badges ─────────────────────────────
  const milestones: Array<{
    key: string
    name: string
    sport: Race['sport_type']
    distance: string
  }> = [
    { key: 'finisher_703',      name: '70.3 Finisher',      sport: 'triathlon', distance: '70.3' },
    { key: 'finisher_ironman',  name: 'Ironman Finisher',   sport: 'triathlon', distance: 'ironman' },
    { key: 'finisher_marathon', name: 'Marathon Finisher',  sport: 'running',   distance: 'full' },
    { key: 'finisher_ultra',    name: 'Ultra Racer',        sport: 'running',   distance: 'ultra' },
  ]

  for (const milestone of milestones) {
    const triggering = sorted.find(
      r => r.sport_type === milestone.sport && r.distance_category === milestone.distance
    )
    if (triggering) {
      badges.push({
        key: milestone.key,
        name: milestone.name,
        category: 'milestone',
        earned_at: triggering.date,
      })
    }
  }

  // ── race count badges ─────────────────────────────────────
  for (const threshold of COUNT_THRESHOLDS) {
    if (sorted.length >= threshold) {
      badges.push({
        key: `count_${threshold}`,
        name: `${threshold} Races`,
        category: 'count',
        earned_at: sorted[threshold - 1].date,
      })
    }
  }

  return badges
}

export async function syncBadges(userId: string): Promise<void> {
  const races = await db.races.findByUser(userId)
  const badges = computeBadges(races)
  await db.badges.upsertMany(userId, badges)
}
