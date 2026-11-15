'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'
import { requestPasswordReset } from '@/lib/api'
import { translateAuthError } from '@/lib/utils'
import { GuestGuard } from '@/components/GuestGuard'
import { AuthShell } from '@/components/AuthShell'
import { ErrorBanner } from '@/components/ui/Bits'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)
    const redirectTo = `${window.location.origin}/reset-password`
    const { error: resetError } = await requestPasswordReset(data.email, redirectTo)
    if (resetError) {
      setError(translateAuthError(resetError.message))
      return
    }
    setSent(true)
  }

  return (
    <GuestGuard>
      <AuthShell title="Wachtwoord vergeten" subtitle="Vul je e-mailadres in, dan sturen we je een link om een nieuw wachtwoord te kiezen.">
        {sent ? (
          <div className="card flex items-start gap-4 p-5">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-reed-soft text-reed">
              <MailCheck className="size-6" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              Als er een account bestaat voor dit e-mailadres, staat er zo een resetlink in je inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {error && <ErrorBanner message={error} />}
            <div>
              <label htmlFor="email" className="label">E-mailadres</label>
              <input id="email" type="email" autoComplete="email" placeholder="jij@voorbeeld.nl" aria-invalid={!!errors.email} className="input" {...register('email')} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Stuur resetlink
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-brand hover:underline">Terug naar inloggen</Link>
        </p>
      </AuthShell>
    </GuestGuard>
  )
}
