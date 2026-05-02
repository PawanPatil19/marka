import { computeBadges } from '@/lib/badges'
import type { Race } from '@/lib/types'

const makeRace = (overrides: Partial<Race> = {}): Race => ({
  id: '1',
  name: 'Test Race',
  date: '2025-01-01',
  location_country: 'SG',
  location_city: 'Singapore',
  sport_type: 'triathlon',
  distance_category: 'olympic',
  finish_time: '02:00:00',
  ...overrides,
})

// ─── No races ────────────────────────────────────────────────
test('no races returns no badges', () => {
  expect(computeBadges([])).toEqual([])
})

// ─── Milestone badges ─────────────────────────────────────────
test('first race earns first_finish badge', () => {
  const badges = computeBadges([makeRace({ date: '2022-06-01' })])
  expect(badges.some(b => b.key === 'first_finish')).toBe(true)
})

test('first_finish badge carries the date of the first race', () => {
  const badges = computeBadges([makeRace({ date: '2022-06-01' })])
  const badge = badges.find(b => b.key === 'first_finish')!
  expect(badge.earned_at).toBe('2022-06-01')
})

// ─── Geography badges ─────────────────────────────────────────
test('race in a country earns a country badge', () => {
  const badges = computeBadges([makeRace({ location_country: 'SG' })])
  expect(badges.some(b => b.key === 'country_SG')).toBe(true)
})

test('country badge earned_at is the date of first race in that country', () => {
  const races = [
    makeRace({ id: '1', location_country: 'DE', date: '2024-09-29' }),
    makeRace({ id: '2', location_country: 'DE', date: '2023-05-01' }),
  ]
  const badge = computeBadges(races).find(b => b.key === 'country_DE')!
  expect(badge.earned_at).toBe('2023-05-01')
})

test('two races in different countries earn two country badges', () => {
  const races = [
    makeRace({ id: '1', location_country: 'SG' }),
    makeRace({ id: '2', location_country: 'DE' }),
  ]
  const keys = computeBadges(races).map(b => b.key)
  expect(keys).toContain('country_SG')
  expect(keys).toContain('country_DE')
})

test('two races in the same country earn only one country badge', () => {
  const races = [
    makeRace({ id: '1', location_country: 'SG', date: '2024-01-01' }),
    makeRace({ id: '2', location_country: 'SG', date: '2025-03-01' }),
  ]
  const countryBadges = computeBadges(races).filter(b => b.key === 'country_SG')
  expect(countryBadges).toHaveLength(1)
})

// ─── Distance milestone badges ────────────────────────────────
test('70.3 triathlon earns finisher_703 badge', () => {
  const badges = computeBadges([makeRace({ sport_type: 'triathlon', distance_category: '70.3' })])
  expect(badges.some(b => b.key === 'finisher_703')).toBe(true)
})

test('ironman triathlon earns finisher_ironman badge', () => {
  const badges = computeBadges([makeRace({ sport_type: 'triathlon', distance_category: 'ironman' })])
  expect(badges.some(b => b.key === 'finisher_ironman')).toBe(true)
})

test('full marathon earns finisher_marathon badge', () => {
  const badges = computeBadges([makeRace({ sport_type: 'running', distance_category: 'full' })])
  expect(badges.some(b => b.key === 'finisher_marathon')).toBe(true)
})

test('ultra run earns finisher_ultra badge', () => {
  const badges = computeBadges([makeRace({ sport_type: 'running', distance_category: 'ultra' })])
  expect(badges.some(b => b.key === 'finisher_ultra')).toBe(true)
})

test('distance milestone badge earned_at is the date of the triggering race', () => {
  const badges = computeBadges([makeRace({ sport_type: 'triathlon', distance_category: '70.3', date: '2025-03-16' })])
  const badge = badges.find(b => b.key === 'finisher_703')!
  expect(badge.earned_at).toBe('2025-03-16')
})

test('completing 70.3 twice earns only one finisher_703 badge', () => {
  const races = [
    makeRace({ id: '1', sport_type: 'triathlon', distance_category: '70.3', date: '2023-02-01' }),
    makeRace({ id: '2', sport_type: 'triathlon', distance_category: '70.3', date: '2025-03-16' }),
  ]
  const count = computeBadges(races).filter(b => b.key === 'finisher_703').length
  expect(count).toBe(1)
})

// ─── Race count badges ────────────────────────────────────────
test('5 races earns count_5 badge', () => {
  const races = Array.from({ length: 5 }, (_, i) =>
    makeRace({ id: String(i), date: `2024-0${i + 1}-01` })
  )
  expect(computeBadges(races).some(b => b.key === 'count_5')).toBe(true)
})

test('4 races does not earn count_5 badge', () => {
  const races = Array.from({ length: 4 }, (_, i) =>
    makeRace({ id: String(i), date: `2024-0${i + 1}-01` })
  )
  expect(computeBadges(races).some(b => b.key === 'count_5')).toBe(false)
})

test('10 races earns count_10 badge but not count_25', () => {
  const races = Array.from({ length: 10 }, (_, i) =>
    makeRace({ id: String(i), date: `2024-01-${String(i + 1).padStart(2, '0')}` })
  )
  const keys = computeBadges(races).map(b => b.key)
  expect(keys).toContain('count_10')
  expect(keys).not.toContain('count_25')
})

test('count badge earned_at is the date of the race that hit the threshold', () => {
  const races = Array.from({ length: 5 }, (_, i) =>
    makeRace({ id: String(i), date: `2024-0${i + 1}-01` })
  )
  const badge = computeBadges(races).find(b => b.key === 'count_5')!
  // 5th race chronologically is 2024-05-01
  expect(badge.earned_at).toBe('2024-05-01')
})
