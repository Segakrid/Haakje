import { useId } from 'react'
import Link from 'next/link'

export const HookMark = ({ className = 'size-9' }: { className?: string }) => {
  // Uniek id per exemplaar: een gedeeld gradient-id breekt zodra één logo verborgen is.
  const gradientId = useId()
  return (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0e6274" />
        <stop offset="1" stopColor="#06222b" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
    <path
      d="M38 16v24a11 11 0 0 1-22 0v-8l7 6"
      fill="none"
      stroke="#fff"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="38" cy="13" r="4.5" fill="none" stroke="#fff" strokeWidth="4" />
    <circle cx="49" cy="46" r="5" fill="#ff6b3d" />
  </svg>
  )
}

export const Logo = ({ href = '/', light = false }: { href?: string; light?: boolean }) => (
  <Link href={href} className="group flex items-center gap-2.5" aria-label="Haakje — naar home">
    <HookMark className="size-9 transition-transform duration-300 group-hover:-rotate-6" />
    <span className={`display text-[1.45rem] leading-none ${light ? 'text-white' : 'text-ink'}`}>Haakje</span>
  </Link>
)
