import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, CircleAlert, LucideIcon } from 'lucide-react'

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  backHref,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  backHref?: string
  actions?: ReactNode
}) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-start gap-3">
      {backHref && (
        <Link href={backHref} className="icon-btn mt-1 -ml-2 border border-line bg-surface" aria-label="Terug">
          <ArrowLeft className="size-5" />
        </Link>
      )}
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="display text-3xl text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
)

export const EmptyState = ({
  art,
  title,
  description,
  action,
}: {
  art: ReactNode
  title: string
  description: string
  action?: ReactNode
}) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    <div className="mb-5">{art}</div>
    <h2 className="display text-2xl text-ink">{title}</h2>
    <p className="mt-2 max-w-sm text-muted">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
)

export const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="flex items-center gap-3 rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
    <CircleAlert className="size-5 shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-semibold underline underline-offset-2">
        Opnieuw proberen
      </button>
    )}
  </div>
)

export const StatTile = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'brand',
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'brand' | 'accent' | 'gold' | 'reed'
}) => {
  const tones = {
    brand: 'bg-brand-soft text-brand',
    accent: 'bg-accent-soft text-accent',
    gold: 'bg-gold-soft text-gold',
    reed: 'bg-reed-soft text-reed',
  }
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className={`inline-flex size-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-[18px]" />
        </span>
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <div className="display tnum mt-3 text-[1.75rem] leading-none text-ink sm:text-3xl">{value}</div>
      {hint && <div className="mt-1.5 truncate text-xs text-muted">{hint}</div>}
    </div>
  )
}

export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card overflow-hidden">
        <div className="skeleton aspect-[4/3] rounded-none" />
        <div className="space-y-3 p-4">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)
