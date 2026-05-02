import { db } from './db'
import type { StravaConnection } from './types'

export async function getValidStravaToken(userId: string): Promise<string | null> {
  const conn = await db.profiles.findStravaConnection(userId)
  if (!conn) return null

  // Return existing token if it has more than 60 seconds left
  if (conn.expires_at > Date.now() / 1000 + 60) {
    return conn.access_token
  }

  // Token expired — refresh it
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: conn.refresh_token,
    }),
  })
  const data = await res.json()
  if (!data.access_token) return null

  const refreshed: StravaConnection = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }
  await db.profiles.upsertStravaConnection(userId, refreshed)
  return refreshed.access_token
}

export interface StravaActivity {
  id: number
  name: string
  sport_type: string
  workout_type: number | null
  distance: number
  elapsed_time: number
  start_date: string
}

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  Singapore: 'SG', Germany: 'DE', Indonesia: 'ID', Malaysia: 'MY',
  Australia: 'AU', Japan: 'JP', 'United Kingdom': 'GB', 'United States': 'US',
  France: 'FR', Thailand: 'TH', Philippines: 'PH', 'New Zealand': 'NZ',
}

export function countryNameToCode(name: string): string {
  return COUNTRY_NAME_TO_CODE[name] ?? ''
}

export function isRace(activity: StravaActivity): boolean {
  return (
    activity.workout_type === 1 ||    // Run race
    activity.workout_type === 11 ||   // Ride race
    activity.sport_type === 'Triathlon' ||
    activity.sport_type === 'VirtualRace'
  )
}

export function mapSportType(stravaType: string): string {
  const map: Record<string, string> = {
    Run: 'running', VirtualRun: 'running', TrailRun: 'running',
    Ride: 'cycling', VirtualRide: 'cycling', GravelRide: 'cycling',
    Swim: 'open_water', OpenWaterSwim: 'open_water',
    Triathlon: 'triathlon',
    Duathlon: 'duathlon',
  }
  return map[stravaType] ?? 'other'
}

export function inferDistanceCategory(stravaType: string, distanceMeters: number): string {
  const km = distanceMeters / 1000

  if (['Run', 'VirtualRun', 'TrailRun'].includes(stravaType)) {
    if (km < 7) return '5k'
    if (km < 14) return '10k'
    if (km < 32) return 'half'
    if (km < 48) return 'full'
    return 'ultra'
  }

  if (stravaType === 'Triathlon') {
    if (km < 30) return 'sprint'
    if (km < 80) return 'olympic'
    if (km < 170) return '70.3'
    return 'ironman'
  }

  return `${Math.round(km)}km`
}

export function secondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}
