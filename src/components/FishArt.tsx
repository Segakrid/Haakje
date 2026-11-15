import { hueFromString } from '@/lib/utils'

/** Vis-silhouet. Kop naar links, staart naar rechts. */
export const FishShape = ({ className, flip = false }: { className?: string; flip?: boolean }) => (
  <svg viewBox="0 0 120 60" className={className} aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path
      fill="currentColor"
      d="M4 30C16 12 40 4 62 8c6-6 14-8 20-7-2 4-3 8-2 12 6 3 11 7 15 11l21-16c-3 11-3 21 0 32L95 36c-5 6-12 11-20 14 0 4 1 7 3 9-7 1-14-2-19-7-21 3-43-5-55-22Zm20-4a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
    />
  </svg>
)

/**
 * Illustratie voor vangsten zonder foto: elke vissoort krijgt zijn eigen tint
 * water, zodat het logboek ook zonder camera kleur heeft.
 */
export const CatchPlaceholder = ({ name, className = '' }: { name: string; className?: string }) => {
  const hue = hueFromString(name)
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 85% 0%, hsl(${hue} 70% 62% / 0.55), transparent 60%), linear-gradient(160deg, hsl(${hue} 62% 24%), hsl(${hue + 18} 68% 13%))`,
      }}
    >
      <svg className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-25" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40c50-22 100 22 150 0s100-22 150 0 75 14 100 4v56H0Z" fill="#fff" fillOpacity=".18" />
        <path d="M0 64c50-18 100 18 150 0s100-18 150 0 75 10 100 2v34H0Z" fill="#fff" fillOpacity=".22" />
      </svg>
      <FishShape className="absolute top-1/2 left-1/2 w-[52%] -translate-x-1/2 -translate-y-1/2 -rotate-6 text-white/85 drop-shadow-[0_10px_18px_rgb(0_0_0/0.35)]" />
      <span className="absolute top-[22%] left-[24%] size-1.5 rounded-full bg-white/50" />
      <span className="absolute top-[14%] left-[29%] size-2.5 rounded-full border border-white/50" />
      <span className="absolute top-[30%] left-[19%] size-1 rounded-full bg-white/40" />
    </div>
  )
}
