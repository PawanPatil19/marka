'use client'

const KEYFRAMES = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

export function HeroGreeting({ name }: { name: string }) {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black text-[80px] uppercase leading-[0.88] text-[#111]">
        <span
          className="block"
          style={{ animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}
        >
          HELLO,
        </span>
        <span
          className="block"
          style={{ animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both', animationDelay: '120ms' }}
        >
          {name}.
        </span>
      </h1>
    </>
  )
}
