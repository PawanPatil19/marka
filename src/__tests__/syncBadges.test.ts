import { syncBadges } from '@/lib/badges'
import { db } from '@/lib/db'
import type { Race } from '@/lib/types'

jest.mock('@/lib/db', () => ({
  db: {
    races: { findByUser: jest.fn() },
    badges: { upsertMany: jest.fn() },
  },
}))

const mockRaces = db.races.findByUser as jest.Mock
const mockUpsert = db.badges.upsertMany as jest.Mock

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

beforeEach(() => {
  jest.clearAllMocks()
  mockUpsert.mockResolvedValue(undefined)
})

// ─── Tracer bullet ────────────────────────────────────────────
test('syncBadges persists first_finish badge for a user with one race', async () => {
  mockRaces.mockResolvedValue([makeRace()])

  await syncBadges('user-1')

  const persisted: { key: string }[] = mockUpsert.mock.calls[0][1]
  expect(persisted.map(b => b.key)).toContain('first_finish')
})

test('syncBadges persists country badge matching race location', async () => {
  mockRaces.mockResolvedValue([makeRace({ location_country: 'JP' })])

  await syncBadges('user-1')

  const persisted: { key: string }[] = mockUpsert.mock.calls[0][1]
  expect(persisted.map(b => b.key)).toContain('country_JP')
})

test('syncBadges with no races writes no badges', async () => {
  mockRaces.mockResolvedValue([])

  await syncBadges('user-1')

  const persisted: unknown[] = mockUpsert.mock.calls[0]?.[1] ?? []
  expect(persisted).toHaveLength(0)
})

test('syncBadges persists one country badge per unique country across races', async () => {
  mockRaces.mockResolvedValue([
    makeRace({ id: '1', date: '2024-01-01', location_country: 'SG' }),
    makeRace({ id: '2', date: '2024-06-01', location_country: 'JP' }),
    makeRace({ id: '3', date: '2024-12-01', location_country: 'SG' }),
  ])

  await syncBadges('user-1')

  const keys: string[] = mockUpsert.mock.calls[0][1].map((b: { key: string }) => b.key)
  expect(keys.filter(k => k === 'country_SG')).toHaveLength(1)
  expect(keys).toContain('country_JP')
})

test('syncBadges reads and writes using the provided userId', async () => {
  mockRaces.mockResolvedValue([makeRace()])

  await syncBadges('user-42')

  expect(mockRaces).toHaveBeenCalledWith('user-42')
  expect(mockUpsert.mock.calls[0][0]).toBe('user-42')
})
