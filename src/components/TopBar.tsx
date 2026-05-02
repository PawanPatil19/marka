'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',         label: 'Home',     num: '01' },
  { href: '/races',    label: 'Races',    num: '02' },
  { href: '/passport', label: 'Passport', num: '03' },
  { href: '/profile',  label: 'Profile',  num: '04' },
]

export default function TopBar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between border-b-2 border-[#111] h-14 px-8 sticky top-0 bg-[#f0ebe0] z-50 flex-shrink-0">
      {/* Logo */}
      <span className="font-[family-name:var(--font-barlow-condensed)] font-black text-2xl uppercase tracking-wider text-[#111]">
        Marka
      </span>

      {/* Nav links */}
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center h-14 px-5 border-l border-[#c8c0b0] font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest uppercase transition-colors ${
                active
                  ? 'bg-[#111] text-[#f0ebe0]'
                  : 'text-[#888] hover:text-[#111] hover:bg-[#e4ddd0]'
              }`}
            >
              <span className="text-[#e8001d] font-bold mr-1.5">{item.num}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Right: log race */}
      <div className="flex items-center gap-3">
        <Link
          href="/races/new"
          className="flex items-center gap-2 bg-[#e8001d] text-white font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:opacity-85 transition-opacity"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Log Race
        </Link>
      </div>
    </nav>
  )
}
