'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { GuestGuard } from '@/components/GuestGuard'
import { AuthShell } from '@/components/AuthShell'
import { PasswordField } from '@/components/PasswordField'
import { ErrorBanner } from '@/components/ui/Bits'

export default function RegisterPage() {
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)
  const { signUp, error, clearError } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  })

  useEffect(() => clearError, [clearError])

  const onSubmit = async (data: RegisterFormData) => {
    const result = await signUp(data.email, data.password, data.name)
    if (result === 'signed_in') router.replace('/')
    else if (result === 'confirmation_required') setConfirmationEmail(data.email)
  }

  if (confirmationEmail) {
    return (
      <GuestGuard>
        <AuthShell title="Check je inbox" subtitle="Nog één stap en je logboek ligt klaar.">
          <div className="card flex items-start gap-4 p-5">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-reed-soft text-reed">
              <MailCheck className="size-6" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              We hebben een bevestigingslink gestuurd naar <strong className="text-ink">{confirmationEmail}</strong>.
              Klik op de link om je account te activeren en log daarna in.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary mt-6 w-full">Naar inloggen</Link>
        </AuthShell>
      </GuestGuard>
    )
  }

  return (
    <GuestGuard>
      <AuthShell
        title="Start je logboek"
        subtitle={
          <>
            Al een account?{' '}
            <Link href="/login" className="font-semibold text-brand underline underline-offset-2">Log in</Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && <ErrorBanner message={error} />}

          <div>
            <label htmlFor="name" className="label">Naam</label>
            <input id="name" type="text" autoComplete="name" placeholder="Hoe mogen we je noemen?" aria-invalid={!!errors.name} className="input" {...register('name')} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">E-mailadres</label>
            <input id="email" type="email" autoComplete="email" placeholder="jij@voorbeeld.nl" aria-invalid={!!errors.email} className="input" {...register('email')} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Wachtwoord</label>
            <PasswordField id="password" autoComplete="new-password" placeholder="Minimaal 6 tekens" aria-invalid={!!errors.password} {...register('password')} />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-accent w-full">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Account aanmaken
          </button>
          <p className="text-center text-xs text-muted">Gratis. Alleen jij ziet je vangsten.</p>
        </form>
      </AuthShell>
    </GuestGuard>
  )
}
