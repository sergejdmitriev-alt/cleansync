'use client'
import { useEffect } from 'react'

function getViennaHour(): number {
  return parseInt(
    new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Vienna',
      hour: 'numeric',
      hour12: false,
    })
  )
}

function hueShift(h: number): number {
  if (h >= 5  && h < 12) return  15  // morning  → bluish
  if (h >= 12 && h < 18) return   0  // day      → base
  if (h >= 18 && h < 22) return -15  // evening  → indigo
  return -20                          // night    → deepest indigo
}

export function TimeOfDayTheme() {
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--cs-hue-shift',
      String(hueShift(getViennaHour()))
    )
  }, [])
  return null
}
