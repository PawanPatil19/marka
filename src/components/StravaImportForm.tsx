'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { importRaces } from '@/lib/races'
import type { RaceInsert } from '@/lib/types'

interface StravaRaceRow {
  stravaId: number
  name: string
  date: string
  sport_type: string
  distance_category: string
  finish_time: string
}

export function StravaImportForm({
  races,
  userId,
}: {
  races: StravaRaceRow[]
  userId: string
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(races.map(r => r.stravaId)))
  const [locations, setLocations] = useState<Record<number, { city: string; country: string }>>(
    Object.fromEntries(races.map(r => [r.stravaId, { city: '', country: '' }]))
  )
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setLocation(id: number, field: 'city' | 'country', value: string) {
    setLocations(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  function handleSubmit() {
    const toImport: RaceInsert[] = races
      .filter(r => selected.has(r.stravaId))
      .map(r => ({
        user_id: userId,
        name: r.name,
        date: r.date,
        sport_type: r.sport_type,
        distance_category: r.distance_category,
        finish_time: r.finish_time,
        location_city: locations[r.stravaId]?.city ?? '',
        location_country: (locations[r.stravaId]?.country ?? '').toUpperCase().slice(0, 2),
      }))

    startTransition(async () => {
      await importRaces(toImport)
      router.push('/races')
    })
  }

  if (races.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest text-[#888]">
          No race activities found on Strava.
        </p>
        <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#bbb] mt-2 uppercase tracking-wide">
          Open Strava, edit an activity, and set its type to &quot;Race&quot;.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-2 mb-8">
        {races.map(r => {
          const isSelected = selected.has(r.stravaId)
          const loc = locations[r.stravaId]
          return (
            <div
              key={r.stravaId}
              className={`border-[1.5px] p-4 transition-colors ${isSelected ? 'border-[#111] bg-white' : 'border-[#ddd] opacity-50'}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(r.stravaId)}
                  className="mt-1.5 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <p className="font-black text-[15px] uppercase text-[#111] truncate">{r.name}</p>
                  </div>
                  <p className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-[#888] mb-3">
                    {r.date} · {r.sport_type} · {r.distance_category} · {r.finish_time}
                  </p>
                  {isSelected && (
                    <div className="flex gap-3">
                      <div>
                        <label className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-[#888] mb-1 block">
                          City
                        </label>
                        <input
                          value={loc?.city ?? ''}
                          onChange={e => setLocation(r.stravaId, 'city', e.target.value)}
                          placeholder="Singapore"
                          className="border-[1.5px] border-[#c8c0b0] bg-transparent px-2 py-1.5 font-bold text-[13px] text-[#111] outline-none focus:border-[#111] w-36"
                        />
                      </div>
                      <div>
                        <label className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-[#888] mb-1 block">
                          Country code
                        </label>
                        <input
                          value={loc?.country ?? ''}
                          onChange={e => setLocation(r.stravaId, 'country', e.target.value.toUpperCase().slice(0, 2))}
                          placeholder="SG"
                          maxLength={2}
                          className="border-[1.5px] border-[#c8c0b0] bg-transparent px-2 py-1.5 font-bold text-[13px] text-[#111] outline-none focus:border-[#111] w-20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending || selected.size === 0}
        className="bg-[#111] text-[#f0ebe0] px-8 py-3.5 font-[family-name:var(--font-space-mono)] text-[11px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Importing...' : `Import ${selected.size} Race${selected.size !== 1 ? 's' : ''} →`}
      </button>
    </div>
  )
}
