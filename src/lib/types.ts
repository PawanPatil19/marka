export type SportType = 'triathlon' | 'running' | 'cycling' | 'duathlon' | 'open_water' | 'other'

export type TriathlonDistance = 'sprint' | 'olympic' | '70.3' | 'ironman'
export type RunningDistance = '5k' | '10k' | 'half' | 'full' | 'ultra'
export type DistanceCategory = TriathlonDistance | RunningDistance | string

export interface Race {
  id: string
  name: string
  date: string // ISO date string YYYY-MM-DD
  location_country: string // ISO 3166-1 alpha-2 e.g. "SG", "DE"
  location_city: string
  sport_type: SportType
  distance_category: DistanceCategory
  finish_time: string // HH:MM:SS
  overall_rank?: number
  age_group_rank?: number
  notes?: string
}

export type BadgeCategory = 'geography' | 'milestone' | 'count'

export interface Badge {
  key: string           // unique identifier e.g. "country_SG", "finisher_703"
  name: string          // human-readable e.g. "Singapore Explorer"
  category: BadgeCategory
  earned_at: string     // ISO date of the race that triggered it
}
