'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/',          label: 'Home',     num: '01' },
  { href: '/races',     label: 'Races',    num: '02' },
  { href: '/passport',  label: 'Passport', num: '03' },
  { href: '/discover',  label: 'Discover', num: '04' },
  { href: '/profile',   label: 'Profile',  num: '05' },
]

export default function TopBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between border-b-2 border-[#111] h-14 px-5 sm:px-8 sticky top-0 bg-[#f0ebe0] z-50 flex-shrink-0">
        {/* Logo */}
        <Link href="/" className="font-[family-name:var(--font-barlow-condensed)] font-black text-2xl uppercase tracking-wider text-[#111]">
          Marka
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex">
          {NAV_ITEMS.map(item => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center h-14 px-5 border-l border-[#c8c0b0] font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest uppercase transition-colors ${
                  active ? 'bg-[#111] text-[#f0ebe0]' : 'text-[#888] hover:text-[#111] hover:bg-[#e4ddd0]'
                }`}
              >
                <span className="text-[#e8001d] font-bold mr-1.5">{item.num}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop: log race */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile: hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-[#111] transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-[#111] transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-[#111] transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#f0ebe0] z-40 flex flex-col border-t-2 border-[#111]">
          {NAV_ITEMS.map(item => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-6 py-5 border-b border-[#c8c0b0] font-[family-name:var(--font-space-mono)] text-[11px] tracking-widest uppercase transition-colors ${
                  active ? 'bg-[#111] text-[#f0ebe0]' : 'text-[#888]'
                }`}
              >
                <span className="text-[#e8001d] font-bold mr-2">{item.num}</span>
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/races/new"
            onClick={() => setOpen(false)}
            className="mx-6 mt-6 flex items-center justify-center gap-2 bg-[#e8001d] text-white font-[family-name:var(--font-space-mono)] text-[11px] font-bold uppercase tracking-widest px-4 py-4"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Log Race
          </Link>
        </div>
      )}
    </>
  )
}
