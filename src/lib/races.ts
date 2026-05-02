'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { syncBadges } from '@/lib/badges'
import type { Race, RaceInsert } from '@/lib/types'

export async function getRaces(): Promise<Race[]> {
  const user = await requireUser()
  return db.races.findByUser(user.id)
}

export async function createRace(formData: FormData) {
  const user = await requireUser()

  await db.races.insert({
    user_id: user.id,
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    location_city: formData.get('location_city') as string,
    location_country: (formData.get('location_country') as string).toUpperCase(),
    sport_type: formData.get('sport_type') as string,
    distance_category: (formData.get('distance_category') as string).toLowerCase(),
    finish_time: formData.get('finish_time') as string,
    overall_rank: formData.get('overall_rank') ? Number(formData.get('overall_rank')) : null,
    age_group_rank: formData.get('age_group_rank') ? Number(formData.get('age_group_rank')) : null,
    notes: (formData.get('notes') as string) || null,
  })

  await syncBadges(user.id)

  revalidatePath('/races')
  revalidatePath('/')
  redirect('/races')
}

export async function updateRace(id: string, formData: FormData) {
  const user = await requireUser()

  await db.races.update(id, user.id, {
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    location_city: formData.get('location_city') as string,
    location_country: (formData.get('location_country') as string).toUpperCase(),
    sport_type: formData.get('sport_type') as string,
    distance_category: (formData.get('distance_category') as string).toLowerCase(),
    finish_time: formData.get('finish_time') as string,
    overall_rank: formData.get('overall_rank') ? Number(formData.get('overall_rank')) : null,
    age_group_rank: formData.get('age_group_rank') ? Number(formData.get('age_group_rank')) : null,
    notes: (formData.get('notes') as string) || null,
  })

  await syncBadges(user.id)
  revalidatePath('/races')
  revalidatePath(`/races/${id}`)
  revalidatePath('/')
  redirect(`/races/${id}`)
}

export async function deleteRace(id: string) {
  const user = await requireUser()
  await db.races.delete(id, user.id)
  await syncBadges(user.id)
  revalidatePath('/races')
  revalidatePath('/')
  redirect('/races')
}

export async function importRaces(races: RaceInsert[]): Promise<void> {
  const user = await requireUser()
  for (const race of races) {
    await db.races.insert({ ...race, user_id: user.id })
  }
  await syncBadges(user.id)
  revalidatePath('/races')
  revalidatePath('/')
}

