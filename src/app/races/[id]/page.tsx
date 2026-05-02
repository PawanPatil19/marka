import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteRace } from '@/lib/races'
import type { Race } from '@/lib/types'

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser()
  const r = await db.races.findById(id, user.id)
  if (!r) notFound()
  const dateStr = new Date(r.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase()

  return (
    <div className="flex flex-col md:flex-row flex-1" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* Left panel */}
      <aside className="md:w-[280px] flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#111] md:sticky md:top-14 md:h-[calc(100vh-56px)] overflow-y-auto flex flex-col">

        {/* Back + title */}
        <div className="px-5 py-4 border-b-[1.5px] border-[#c8c0b0]">
          <Link href="/races" className="flex items-center gap-1.5 mb-3 group">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] group-hover:text-[#111] transition-colors">
              Back to Races
            </span>
          </Link>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">
            {r.sport_type.replace('_', ' ')} · {r.distance_category} · #{r.id.slice(0, 4).toUpperCase()}
          </p>
          <h1 className="font-black text-[22px] uppercase text-[#111] leading-tight">{r.name}</h1>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-1.5">{dateStr} · {r.location_city}</p>
        </div>

        {/* Finish time */}
        <div className="px-5 py-5 border-b-[1.5px] border-[#c8c0b0]">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1.5">Total Time</p>
          <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-[64px] leading-none text-[#111]">{r.finish_time}</p>
        </div>

        {/* Ranks */}
        {(r.overall_rank || r.age_group_rank) && (
          <div className="grid grid-cols-2 border-b-[1.5px] border-[#c8c0b0]">
            {r.overall_rank && (
              <div className="px-5 py-4 border-r border-[#c8c0b0]">
                <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Overall</p>
                <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-4xl text-[#111]">{r.overall_rank}</p>
              </div>
            )}
            {r.age_group_rank && (
              <div className="px-5 py-4">
                <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Age Group</p>
                <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-4xl text-[#111]">{r.age_group_rank}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {r.notes && (
          <div className="px-5 py-4 border-b-[1.5px] border-[#c8c0b0]">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-2">Notes</p>
            <p className="text-sm text-[#111] leading-relaxed">{r.notes}</p>
          </div>
        )}

        {/* Edit + Delete */}
        <div className="px-5 py-4 mt-auto flex items-center justify-between">
          <Link
            href={`/races/${id}/edit`}
            className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#111] transition-colors"
          >
            Edit Race
          </Link>
          <form action={async () => {
            'use server'
            await deleteRace(id)
          }}>
            <button type="submit" className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#e8001d] transition-colors cursor-pointer">
              Delete
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-5 border-b-[1.5px] border-[#111]">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black text-4xl uppercase text-[#111]">
            Race Details
          </h2>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#c8c0b0]">
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b sm:border-b-0 sm:border-r border-[#c8c0b0]">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Finish Time</p>
            <p className="font-[family-name:var(--font-barlow-condensed)] font-black text-4xl text-[#111]">{r.finish_time}</p>
          </div>
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b sm:border-b-0 sm:border-r border-[#c8c0b0]">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Location</p>
            <p className="font-black text-lg uppercase text-[#111]">{r.location_city}, {r.location_country}</p>
          </div>
          <div className="px-5 sm:px-8 py-5 sm:py-6">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Category</p>
            <p className="font-black text-lg uppercase text-[#111]">{r.distance_category}</p>
          </div>
        </div>

        <div className="px-8 py-10 text-center">
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#bbb]">
            Split times coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
