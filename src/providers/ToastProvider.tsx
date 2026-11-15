'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

type ToastKind = 'success' | 'error'
interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-2), { id, kind, message }])
      setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500)
    },
    [dismiss]
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-md animate-pop items-center gap-3 rounded-2xl bg-deep py-3 pr-2 pl-4 text-sm font-medium text-white shadow-lift ring-1 ring-white/10"
          >
            {t.kind === 'success' ? (
              <CheckCircle2 className="size-5 shrink-0 text-[#7fe0b0]" />
            ) : (
              <CircleAlert className="size-5 shrink-0 text-[#ff9b7d]" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Melding sluiten"
              className="inline-flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast moet binnen <ToastProvider> gebruikt worden')
  return ctx
}
