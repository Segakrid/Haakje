import { HookMark } from '@/components/Logo'

export const PageLoader = ({ label = 'Even geduld…' }: { label?: string }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status">
    <div className="animate-bob">
      <HookMark className="size-12" />
    </div>
    <p className="text-sm text-muted">{label}</p>
  </div>
)
