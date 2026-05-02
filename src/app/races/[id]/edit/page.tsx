import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditRaceForm } from '@/components/EditRaceForm'

export default async function EditRacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser()
  const race = await db.races.findById(id, user.id)
  if (!race) notFound()

  return <EditRaceForm race={race} />
}
