import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import TopBar from './TopBar'

export default async function TopBarWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return <TopBar />
}
