'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = (formData.get('display_name') as string).trim()
  const username = (formData.get('username') as string).trim().toLowerCase().replace(/[^a-z0-9_]/g, '')

  if (!displayName || !username) redirect('/profile?error=Name and username are required')

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName, username }, { onConflict: 'id' })

  if (error) redirect('/profile?error=' + encodeURIComponent(error.message))

  revalidatePath('/')
  revalidatePath('/profile')
  redirect('/profile?saved=1')
}
