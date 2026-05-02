'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({
  value,
  duration = 2400,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (value === 0) return
    startRef.current = null

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      // ease-out quart: starts counting fast, glides smoothly to the final number
      const eased = 1 - Math.pow(1 - progress, 4)

      setDisplay(Math.round(eased * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return <span className={className}>{display}</span>
}
