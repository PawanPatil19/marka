'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin, requireUser } from '@/lib/auth'
import type { DiscoverRaceInsert } from '@/lib/types'

export async function createDiscoverRace(formData: FormData) {
  await requireAdmin()
  const race: DiscoverRaceInsert = {
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    location_city: formData.get('location_city') as string,
    location_country: (formData.get('location_country') as string).toUpperCase(),
    sport_type: formData.get('sport_type') as DiscoverRaceInsert['sport_type'],
    distance_category: formData.get('distance_category') as string,
    registration_url: formData.get('registration_url') as string,
    description: (formData.get('description') as string) || undefined,
  }
  await db.discover.insert(race)
  revalidatePath('/discover')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateDiscoverRace(id: string, formData: FormData) {
  await requireAdmin()
  const fields: Partial<DiscoverRaceInsert> = {
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    location_city: formData.get('location_city') as string,
    location_country: (formData.get('location_country') as string).toUpperCase(),
    sport_type: formData.get('sport_type') as DiscoverRaceInsert['sport_type'],
    distance_category: formData.get('distance_category') as string,
    registration_url: formData.get('registration_url') as string,
    description: (formData.get('description') as string) || undefined,
  }
  await db.discover.update(id, fields)
  revalidatePath('/discover')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteDiscoverRace(id: string) {
  await requireAdmin()
  await db.discover.delete(id)
  revalidatePath('/discover')
  revalidatePath('/admin')
}

export async function attendRace(raceId: string) {
  const user = await requireUser()
  await db.discover.attend(user.id, raceId)
  revalidatePath('/discover')
}

export async function unattendRace(raceId: string) {
  const user = await requireUser()
  await db.discover.unattend(user.id, raceId)
  revalidatePath('/discover')
}
