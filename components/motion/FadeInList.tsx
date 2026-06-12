'use client'

interface FadeInListProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

// Semantic grouping wrapper for animated lists — use FadeInItem for individual items
export function FadeInList({ children, style, className }: FadeInListProps) {
  return <div style={style} className={className}>{children}</div>
}
