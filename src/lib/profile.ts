'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Profile } from '@/lib/types'

export async function getProfile(): Promise<Profile | null> {
  const user = await requireUser()
  return db.profiles.findByUserId(user.id)
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser()

  const displayName = (formData.get('display_name') as string).trim()
  const username = (formData.get('username') as string).trim().toLowerCase().replace(/[^a-z0-9_]/g, '')

  if (!displayName || !username) redirect('/profile?error=Name and username are required')

  try {
    await db.profiles.upsert(user.id, { display_name: displayName, username })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    redirect('/profile?error=' + encodeURIComponent(msg))
  }

  revalidatePath('/')
  revalidatePath('/profile')
  redirect('/profile?saved=1')
}
