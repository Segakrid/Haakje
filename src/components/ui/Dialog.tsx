'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { Loader2, X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** Op mobiel als bottom sheet tonen. */
  sheet?: boolean
}

export const Dialog = ({ open, onClose, title, children, footer, sheet = false }: DialogProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-center bg-deep/60 backdrop-blur-sm ${
        sheet ? 'items-end sm:items-center sm:p-4' : 'items-center p-4'
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`flex max-h-[90dvh] w-full max-w-md animate-pop flex-col border border-line bg-surface shadow-lift outline-none ${
          sheet ? 'rounded-t-3xl pb-[env(safe-area-inset-bottom)] sm:rounded-3xl sm:pb-0' : 'rounded-3xl'
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-2">
          <h2 className="display text-xl text-ink">{title}</h2>
          <button onClick={onClose} className="icon-btn -mr-2" aria-label="Sluiten">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-3">{children}</div>
        {footer && <div className="flex gap-3 px-6 pt-3 pb-6">{footer}</div>}
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  busy?: boolean
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Verwijderen',
  busy = false,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={busy ? () => undefined : onClose}
    title={title}
    footer={
      <>
        <button onClick={onClose} disabled={busy} className="btn btn-ghost flex-1">
          Annuleren
        </button>
        <button onClick={onConfirm} disabled={busy} className="btn btn-danger flex-1">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm leading-relaxed text-muted">{description}</p>
  </Dialog>
)
