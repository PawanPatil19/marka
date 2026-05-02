import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { deleteDiscoverRace } from '@/lib/discover'

export default async function AdminPage() {
  await requireAdmin()
  const races = await db.discover.findAll()

  return (
    <main className="min-h-screen bg-[#f0ebe0]">

      {/* Header */}
      <div className="border-b-2 border-[#111] px-14 pt-8 pb-6 flex items-end justify-between">
        <div>
          <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Admin</p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[52px] uppercase leading-none text-[#111]">
            Discover Races
          </h1>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 bg-[#e8001d] text-white font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest px-5 py-3 hover:opacity-85 transition-opacity mb-2"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Race
        </Link>
      </div>

      {/* Race list */}
      <div className="max-w-[900px] mx-auto px-14 pt-4">
        {races.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#bbb] mb-6">No races yet</p>
            <Link href="/admin/new" className="font-[family-name:var(--font-barlow-condensed)] font-black text-3xl uppercase text-[#111] hover:text-[#e8001d] transition-colors">
              Add the first race →
            </Link>
          </div>
        ) : (
          races.map((race) => {
            const dateStr = new Date(race.date).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            }).toUpperCase()
            return (
              <div key={race.id} className="flex items-center gap-3 py-4 border-b border-[#c8c0b0] px-2 -mx-2">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[15px] uppercase text-[#111]">{race.name}</p>
                  <p className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#888] mt-0.5">
                    {race.location_city}, {race.location_country} · {dateStr} · {race.sport_type} · {race.distance_category}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Link
                    href={`/admin/edit/${race.id}`}
                    className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#111] transition-colors"
                  >
                    Edit
                  </Link>
                  <div className="w-px h-3 bg-[#c8c0b0]" />
                  <form action={async () => {
                    'use server'
                    await deleteDiscoverRace(race.id)
                  }}>
                    <button type="submit" className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#e8001d] transition-colors cursor-pointer">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
