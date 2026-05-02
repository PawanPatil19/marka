'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateRace } from '@/lib/races'
import type { Race, SportType } from '@/lib/types'

const SPORTS: { type: SportType; emoji: string; label: string }[] = [
  { type: 'triathlon',  emoji: '🏊', label: 'Tri'   },
  { type: 'running',    emoji: '🏃', label: 'Run'   },
  { type: 'cycling',    emoji: '🚴', label: 'Bike'  },
  { type: 'duathlon',   emoji: '🤸', label: 'Dual'  },
  { type: 'open_water', emoji: '🌊', label: 'Swim'  },
  { type: 'other',      emoji: '⚡', label: 'Other' },
]

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AR', name: 'Argentina' }, { code: 'AU', name: 'Australia' }, { code: 'AT', name: 'Austria' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BE', name: 'Belgium' }, { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'HR', name: 'Croatia' }, { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' }, { code: 'EG', name: 'Egypt' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' }, { code: 'GR', name: 'Greece' },
  { code: 'HK', name: 'Hong Kong' }, { code: 'HU', name: 'Hungary' }, { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' }, { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' }, { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' },
  { code: 'KE', name: 'Kenya' }, { code: 'KR', name: 'South Korea' }, { code: 'KW', name: 'Kuwait' },
  { code: 'LB', name: 'Lebanon' }, { code: 'MY', name: 'Malaysia' }, { code: 'MX', name: 'Mexico' },
  { code: 'MA', name: 'Morocco' }, { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' }, { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' }, { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' }, { code: 'ES', name: 'Spain' }, { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }, { code: 'TW', name: 'Taiwan' }, { code: 'TH', name: 'Thailand' },
  { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, { code: 'AE', name: 'UAE' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' }, { code: 'VN', name: 'Vietnam' },
]

const DISTANCES: Record<SportType, string[]> = {
  triathlon:  ['Sprint', 'Olympic', '70.3', 'Ironman'],
  running:    ['5k', '10k', 'Half', 'Full', 'Ultra'],
  cycling:    ['Gran Fondo', 'Century', 'Stage Race', 'Other'],
  duathlon:   ['Sprint', 'Standard', 'Long'],
  open_water: ['1k', '2.5k', '5k', '10k', 'Other'],
  other:      ['Other'],
}

export function EditRaceForm({ race }: { race: Race }) {
  const router = useRouter()
  const [sport, setSport] = useState<SportType>(race.sport_type as SportType)
  const [loading, setLoading] = useState(false)

  const distances = DISTANCES[sport]

  return (
    <main className="min-h-screen bg-[#f0ebe0]">
      <div className="max-w-[800px] mx-auto px-8 py-10">

        <div className="border-b-2 border-[#111] pb-5 mb-8 flex items-end justify-between">
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1">Edit Entry</p>
            <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-5xl uppercase text-[#111] leading-none">Edit Race</h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] hover:text-[#111] transition-colors border border-[#c8c0b0] px-4 py-2"
          >
            ✕ Cancel
          </button>
        </div>

        <form
          action={async (formData: FormData) => {
            setLoading(true)
            await updateRace(race.id, formData)
          }}
          className="space-y-8"
        >
          <input type="hidden" name="sport_type" value={sport} />

          {/* Sport picker */}
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-3">Sport Type</p>
            <div className="grid grid-cols-6 border-[1.5px] border-[#111]">
              {SPORTS.map((s, i) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => setSport(s.type)}
                  className={`py-4 text-center cursor-pointer transition-colors ${i < 5 ? 'border-r border-[#ccc]' : ''} ${sport === s.type ? 'bg-[#111]' : 'hover:bg-[#e8e0d0]'}`}
                >
                  <span className="text-xl block mb-1">{s.emoji}</span>
                  <span className={`font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-wide font-bold ${sport === s.type ? 'text-[#f0ebe0]' : 'text-[#888]'}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Event details */}
          <div className="space-y-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888]">Event Details</p>

            <div>
              <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Event Name *</label>
              <input
                name="name"
                required
                defaultValue={race.name}
                className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Date *</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={race.date}
                  className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Distance *</label>
                <select
                  name="distance_category"
                  required
                  defaultValue={race.distance_category}
                  className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:bg-white appearance-none cursor-pointer"
                >
                  {distances.map(d => (
                    <option key={d} value={d.toLowerCase()}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">City *</label>
                <input
                  name="location_city"
                  required
                  defaultValue={race.location_city}
                  className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Country *</label>
                <select
                  name="location_country"
                  required
                  defaultValue={race.location_country}
                  className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Finish time */}
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-3">Time (HH:MM:SS)</p>
            <div className="border-[1.5px] border-[#111]">
              <div className="flex items-center gap-4 px-4 py-3">
                <span className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-wide w-16 flex-shrink-0 text-[#111] font-bold">
                  Total *
                </span>
                <input
                  name="finish_time"
                  required
                  defaultValue={race.finish_time}
                  placeholder="00:00:00"
                  pattern="[0-9]{1,2}:[0-9]{2}:[0-9]{2}"
                  className="flex-1 bg-transparent border-b border-[#111] py-1 font-black text-right text-[#111] outline-none text-xl"
                />
              </div>
            </div>
          </div>

          {/* Optional */}
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-3">Optional</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Overall Rank</label>
                <input
                  name="overall_rank"
                  type="number"
                  min={1}
                  defaultValue={race.overall_rank ?? ''}
                  className="w-full border-[1.5px] border-[#ddd] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:border-[#111] focus:bg-white"
                />
              </div>
              <div>
                <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Age Group Rank</label>
                <input
                  name="age_group_rank"
                  type="number"
                  min={1}
                  defaultValue={race.age_group_rank ?? ''}
                  className="w-full border-[1.5px] border-[#ddd] bg-transparent px-3 py-2.5 font-bold text-[#111] text-sm outline-none focus:border-[#111] focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] mb-1 block">Notes</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={race.notes ?? ''}
                className="w-full border-[1.5px] border-[#ddd] bg-transparent px-3 py-2.5 text-sm text-[#111] outline-none focus:border-[#111] focus:bg-white resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-[#f0ebe0] py-4 font-[family-name:var(--font-space-mono)] text-[11px] uppercase tracking-widest font-bold disabled:opacity-50 cursor-pointer hover:bg-[#333] transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes →'}
          </button>
        </form>
      </div>
    </main>
  )
}
