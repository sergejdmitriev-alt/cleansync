import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="cs-empty-wrapper" style={{
      textAlign: 'center',
      padding: '56px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div className="cs-empty-icon" style={{ width: 80, height: 80, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--cs-text-2)', margin: 0 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--cs-text-3)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function HouseIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <path d="M40 12L68 38H60V66H20V38H12L40 12Z" stroke="#3b7ef8" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7"/>
      <path d="M32 66V50H48V66" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="61" cy="19" r="2" fill="#3b7ef8" opacity="0.5"/>
      <circle cx="69" cy="12" r="1.5" fill="#3b7ef8" opacity="0.35"/>
      <circle cx="55" cy="10" r="1" fill="#3b7ef8" opacity="0.25"/>
      <path d="M28 44H52" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
    </svg>
  )
}

export function BoxIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect x="14" y="36" width="52" height="32" rx="3" stroke="#3b7ef8" strokeWidth="1.5" opacity="0.7"/>
      <path d="M10 28H70L66 38H14L10 28Z" stroke="#3b7ef8" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
      <path d="M32 24L40 28L48 24" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      <path d="M34 52L40 58L46 52" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 46V58" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function SearchEmptyIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <circle cx="34" cy="34" r="19" stroke="#3b7ef8" strokeWidth="1.5" opacity="0.7"/>
      <path d="M48 48L64 64" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 34H40" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <path d="M34 28V40" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <path d="M54 20L58 24M58 20L54 24" stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}
