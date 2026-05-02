import { createClient } from '@/lib/supabase/server'
import type { Race, Badge, Profile, RaceInsert } from '@/lib/types'

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
  },
}
