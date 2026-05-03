'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { importStravaActivity } from '@/lib/races'

interface PendingActivity {
  stravaId: number
  name: string
  date: string
  sport_type: string
  distance_category: string
  finish_time: string
  location_city: string
  location_country: string
}

const SPORT_LABELS: Record<string, string> = {
  triathlon: 'TRI', running: 'RUN', cycling: 'BIKE',
  duathlon: 'DUAL', open_water: 'SWIM', other: 'OTH',
}

const DISMISSED_KEY = 'marka_dismissed_strava_ids'

function getDismissed(): Set<number> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function addDismissed(id: number) {
  try {
    const existing = getDismissed()
    existing.add(id)
    // Keep only last 200 dismissed IDs
    const arr = Array.from(existing).slice(-200)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr))
  } catch { /* ignore */ }
}

export function StravaActivityWatcher() {
  const [activities, setActivities] = useState<PendingActivity[]>([])
  const [importing, setImporting] = useState<number | null>(null)
  const [imported, setImported] = useState<Set<number>>(new Set())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/strava/check-recent')
      if (!res.ok) return
      const data = await res.json()
      const dismissed = getDismissed()
      const newOnes = (data.activities as PendingActivity[]).filter(
        a => !dismissed.has(a.stravaId)
      )
      if (newOnes.length > 0) {
        setActivities(prev => {
          const existingIds = new Set(prev.map(a => a.stravaId))
          const toAdd = newOnes.filter(a => !existingIds.has(a.stravaId))
          return [...prev, ...toAdd]
        })
      }
    } catch { /* ignore network errors */ }
  }, [])

  useEffect(() => {
    // Check on mount
    checkRecent()
    // Then poll every 5 minutes
    intervalRef.current = setInterval(checkRecent, 5 * 60 * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [checkRecent])

  const handleImport = async (activity: PendingActivity) => {
    setImporting(activity.stravaId)
    try {
      await importStravaActivity(activity)
      setImported(prev => new Set(prev).add(activity.stravaId))
      addDismissed(activity.stravaId)
      setTimeout(() => {
        setActivities(prev => prev.filter(a => a.stravaId !== activity.stravaId))
        setImported(prev => { const s = new Set(prev); s.delete(activity.stravaId); return s })
      }, 2000)
    } catch {
      // ignore
    } finally {
      setImporting(null)
    }
  }

  const handleDismiss = (id: number) => {
    addDismissed(id)
    setActivities(prev => prev.filter(a => a.stravaId !== id))
  }

  if (activities.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-[340px] w-full">
      {activities.map(activity => {
        const isImporting = importing === activity.stravaId
        const isImported = imported.has(activity.stravaId)
        return (
          <div
            key={activity.stravaId}
            className="bg-[#111] border-2 border-[#e8001d] shadow-2xl animate-in slide-in-from-bottom-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e8001d] animate-pulse flex-shrink-0" />
                <span className="font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-widest text-[#e8001d]">
                  New Strava Race
                </span>
              </div>
              <button
                onClick={() => handleDismiss(activity.stravaId)}
                className="text-[#555] hover:text-[#888] transition-colors text-lg leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>

            {/* Activity details */}
            <div className="px-4 py-3">
              <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[22px] uppercase text-white leading-tight truncate">
                {activity.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] uppercase">
                  {new Date(activity.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
                <span className="text-[#444]">·</span>
                <span className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] uppercase">
                  {activity.distance_category.toUpperCase()}
                </span>
                <span className="text-[#444]">·</span>
                <span className="font-[family-name:var(--font-barlow-condensed)] font-black text-[16px] text-[#e8001d]">
                  {activity.finish_time}
                </span>
                <span className="font-[family-name:var(--font-space-mono)] text-[9px] font-bold text-[#666] ml-auto">
                  {SPORT_LABELS[activity.sport_type] ?? 'OTH'}
                </span>
              </div>
            </div>

            {/* Location row */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2">
                <input
                  defaultValue={activity.location_city}
                  onChange={e => { activity.location_city = e.target.value }}
                  placeholder="City"
                  className="flex-1 bg-[#1a1a1a] border border-[#333] px-2 py-1.5 font-[family-name:var(--font-space-mono)] text-[9px] uppercase text-white outline-none focus:border-[#555] placeholder:text-[#444]"
                />
                <input
                  defaultValue={activity.location_country}
                  onChange={e => { activity.location_country = e.target.value.toUpperCase().slice(0, 2) }}
                  placeholder="CC"
                  maxLength={2}
                  className="w-12 bg-[#1a1a1a] border border-[#333] px-2 py-1.5 font-[family-name:var(--font-space-mono)] text-[9px] uppercase text-white outline-none focus:border-[#555] placeholder:text-[#444] text-center"
                />
              </div>
              <p className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#444] mt-1 uppercase tracking-wide">
                Add city + country code (e.g. SG, MY)
              </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-[#2a2a2a]">
              <button
                onClick={() => handleDismiss(activity.stravaId)}
                className="flex-1 py-3 font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#555] hover:text-[#888] transition-colors border-r border-[#2a2a2a]"
              >
                Skip
              </button>
              <button
                onClick={() => handleImport(activity)}
                disabled={isImporting || isImported}
                className="flex-1 py-3 font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest font-bold bg-[#e8001d] text-white hover:bg-[#c50019] transition-colors disabled:opacity-60"
              >
                {isImported ? 'Saved ✓' : isImporting ? 'Saving...' : 'Add to Log →'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
