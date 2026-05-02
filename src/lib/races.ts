'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { computeBadges } from '@/lib/badges'
import type { Race } from '@/lib/types'

export async function getRaces(): Promise<Race[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []).map(row => ({
    ...row,
    finish_time: row.finish_time as string,
  }))
}

export async function createRace(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const race = {
    user_id: user.id,
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    location_city: formData.get('location_city') as string,
    location_country: formData.get('location_country') as string,
    sport_type: formData.get('sport_type') as string,
    distance_category: formData.get('distance_category') as string,
    finish_time: formData.get('finish_time') as string,
    overall_rank: formData.get('overall_rank') ? Number(formData.get('overall_rank')) : null,
    age_group_rank: formData.get('age_group_rank') ? Number(formData.get('age_group_rank')) : null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('races').insert(race)
  if (error) throw error

  // Recompute badges after every race save
  await syncBadges(supabase, user.id)

  revalidatePath('/races')
  revalidatePath('/')
  redirect('/races')
}

export async function deleteRace(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('races')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  await syncBadges(supabase, user.id)

  revalidatePath('/races')
  revalidatePath('/')
}

// Recompute all badges for a user and upsert into DB
async function syncBadges(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: rows } = await supabase
    .from('races')
    .select('*')
    .eq('user_id', userId)

  const races = (rows ?? []) as Race[]
  const badges = computeBadges(races)

  if (badges.length === 0) return

  await supabase.from('badges').upsert(
    badges.map(b => ({
      user_id: userId,
      key: b.key,
      name: b.name,
      category: b.category,
      earned_at: b.earned_at,
    })),
    { onConflict: 'user_id,key' }
  )
}
