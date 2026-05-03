import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { StravaActivityWatcher } from './StravaActivityWatcher'

export async function StravaWatcherWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Only render watcher if user has Strava connected
  const conn = await db.profiles.findStravaConnection(user.id)
  if (!conn) return null

  return <StravaActivityWatcher />
}
