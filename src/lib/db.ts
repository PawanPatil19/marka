import { createClient } from '@/lib/supabase/server'
import type { Race, Badge, Profile, RaceInsert, StravaConnection, DiscoverRace, DiscoverRaceInsert } from '@/lib/types'

export const db = {
  races: {
    async findByUser(userId: string): Promise<Race[]> {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      if (error) throw error
      return (data ?? []).map(row => ({ ...row, finish_time: row.finish_time as string }))
    },

    async findById(id: string, userId: string): Promise<Race | null> {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
      if (error || !data) return null
      return { ...data, finish_time: data.finish_time as string }
    },

    async insert(race: RaceInsert): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase.from('races').insert(race)
      if (error) throw error
    },

    async update(id: string, userId: string, fields: Partial<RaceInsert>): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('races')
        .update(fields)
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    async delete(id: string, userId: string): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },
  },

  badges: {
    async findByUser(userId: string): Promise<Badge[]> {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Badge[]
    },

    async upsertMany(userId: string, badges: Badge[]): Promise<void> {
      if (badges.length === 0) return
      const supabase = await createClient()
      const { error } = await supabase.from('badges').upsert(
        badges.map(b => ({
          user_id: userId,
          key: b.key,
          name: b.name,
          category: b.category,
          earned_at: b.earned_at,
        })),
        { onConflict: 'user_id,key' }
      )
      if (error) throw error
    },
  },

  profiles: {
    async findByUserId(userId: string): Promise<Profile | null> {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data ?? null
    },

    async findByUsername(username: string): Promise<Profile | null> {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      return data ?? null
    },

    async upsert(userId: string, fields: { display_name: string; username: string }): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...fields }, { onConflict: 'id' })
      if (error) throw error
    },

    async findStravaConnection(userId: string): Promise<StravaConnection | null> {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
        .eq('id', userId)
        .single()
      if (!data?.strava_access_token) return null
      return {
        access_token: data.strava_access_token,
        refresh_token: data.strava_refresh_token,
        expires_at: data.strava_token_expires_at,
      }
    },

    async upsertStravaConnection(userId: string, conn: StravaConnection): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          strava_access_token: conn.access_token,
          strava_refresh_token: conn.refresh_token,
          strava_token_expires_at: conn.expires_at,
        })
        .eq('id', userId)
      if (error) throw error
    },
  },

  discover: {
    async findAll(): Promise<DiscoverRace[]> {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('discover_races')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      return (data ?? []) as DiscoverRace[]
    },

    async findById(id: string): Promise<DiscoverRace | null> {
      const supabase = await createClient()
      const { data } = await supabase
        .from('discover_races')
        .select('*')
        .eq('id', id)
        .single()
      return data ?? null
    },

    async insert(race: DiscoverRaceInsert): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase.from('discover_races').insert(race)
      if (error) throw error
    },

    async update(id: string, fields: Partial<DiscoverRaceInsert>): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('discover_races')
        .update(fields)
        .eq('id', id)
      if (error) throw error
    },

    async delete(id: string): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('discover_races')
        .delete()
        .eq('id', id)
      if (error) throw error
    },

    async getAttendingIds(userId: string): Promise<Set<string>> {
      const supabase = await createClient()
      const { data } = await supabase
        .from('discover_attendees')
        .select('discover_race_id')
        .eq('user_id', userId)
      return new Set((data ?? []).map(r => r.discover_race_id))
    },

    async attend(userId: string, raceId: string): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('discover_attendees')
        .insert({ user_id: userId, discover_race_id: raceId })
      if (error && error.code !== '23505') throw error // ignore duplicate
    },

    async unattend(userId: string, raceId: string): Promise<void> {
      const supabase = await createClient()
      const { error } = await supabase
        .from('discover_attendees')
        .delete()
        .eq('user_id', userId)
        .eq('discover_race_id', raceId)
      if (error) throw error
    },
  },
}
