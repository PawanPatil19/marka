import { requireAdmin } from '@/lib/auth'
import { createDiscoverRace } from '@/lib/discover'
import Link from 'next/link'

export default async function AdminNewRacePage() {
  await requireAdmin()

  return (
    <main className="min-h-screen bg-[#f0ebe0]">
      <div className="border-b-2 border-[#111] px-14 pt-8 pb-6">
        <Link href="/admin" className="flex items-center gap-1.5 mb-4 group w-fit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] group-hover:text-[#111] transition-colors">
            Back to Admin
          </span>
        </Link>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[52px] uppercase leading-none text-[#111]">
          Add Race
        </h1>
      </div>

      <div className="max-w-[600px] mx-auto px-14 py-8">
        <DiscoverRaceForm action={createDiscoverRace} />
      </div>
    </main>
  )
}

function DiscoverRaceForm({ action, defaults }: {
  action: (f: FormData) => Promise<void>
  defaults?: Record<string, string>
}) {
  return (
    <form action={action} className="space-y-5">
      {[
        { name: 'name', label: 'Race Name', placeholder: 'Ironman 70.3 Singapore' },
        { name: 'date', label: 'Date', placeholder: '2025-11-15', type: 'date' },
        { name: 'location_city', label: 'City', placeholder: 'Singapore' },
        { name: 'location_country', label: 'Country (2-letter ISO code)', placeholder: 'SG' },
        { name: 'registration_url', label: 'Registration URL', placeholder: 'https://...', type: 'url' },
      ].map(({ name, label, placeholder, type = 'text' }) => (
        <div key={name}>
          <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] block mb-1.5">
            {label}
          </label>
          <input
            type={type}
            name={name}
            defaultValue={defaults?.[name] ?? ''}
            required
            placeholder={placeholder}
            className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-[family-name:var(--font-space-mono)] text-[12px] text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#e8001d]"
          />
        </div>
      ))}

      {/* Sport type */}
      <div>
        <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] block mb-1.5">
          Sport Type
        </label>
        <select
          name="sport_type"
          defaultValue={defaults?.sport_type ?? 'triathlon'}
          className="w-full border-[1.5px] border-[#111] bg-[#f0ebe0] px-3 py-2.5 font-[family-name:var(--font-space-mono)] text-[12px] text-[#111] focus:outline-none focus:border-[#e8001d]"
        >
          <option value="triathlon">Triathlon</option>
          <option value="running">Running</option>
          <option value="cycling">Cycling</option>
          <option value="duathlon">Duathlon</option>
          <option value="open_water">Open Water</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Distance */}
      <div>
        <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] block mb-1.5">
          Distance
        </label>
        <select
          name="distance_category"
          defaultValue={defaults?.distance_category ?? '70.3'}
          className="w-full border-[1.5px] border-[#111] bg-[#f0ebe0] px-3 py-2.5 font-[family-name:var(--font-space-mono)] text-[12px] text-[#111] focus:outline-none focus:border-[#e8001d]"
        >
          <optgroup label="Triathlon">
            <option value="sprint">Sprint</option>
            <option value="olympic">Olympic</option>
            <option value="70.3">70.3</option>
            <option value="ironman">Ironman</option>
          </optgroup>
          <optgroup label="Running">
            <option value="5k">5K</option>
            <option value="10k">10K</option>
            <option value="half">Half Marathon</option>
            <option value="full">Full Marathon</option>
            <option value="ultra">Ultra</option>
          </optgroup>
          <optgroup label="Other">
            <option value="other">Other</option>
          </optgroup>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-widest text-[#888] block mb-1.5">
          Short Description (optional)
        </label>
        <input
          type="text"
          name="description"
          defaultValue={defaults?.description ?? ''}
          placeholder="Scenic coastal route through the CBD"
          className="w-full border-[1.5px] border-[#111] bg-transparent px-3 py-2.5 font-[family-name:var(--font-space-mono)] text-[12px] text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#e8001d]"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#111] text-[#f0ebe0] font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest font-bold py-3.5 hover:bg-[#e8001d] transition-colors mt-2"
      >
        Save Race
      </button>
    </form>
  )
}
