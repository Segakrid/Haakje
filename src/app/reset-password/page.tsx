'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'
import { updatePassword, signOut } from '@/lib/api'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import { translateAuthError } from '@/lib/utils'
import { AuthShell } from '@/components/AuthShell'
import { PasswordField } from '@/components/PasswordField'
import { PageLoader } from '@/components/ui/PageLoader'
import { ErrorBanner } from '@/components/ui/Bits'

// Reached via the reset-password email link. Supabase's client automatically
// exchanges the `?code=` in the URL for a (temporary) recovery session and
// fires a PASSWORD_RECOVERY auth event; we wait for that before showing the form.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      }
    })

    // In case the event already fired before we subscribed.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) setStatus('ready')
    })

    const timeout = setTimeout(() => {
      if (active) {
        setStatus((current) => (current === 'checking' ? 'invalid' : current))
      }
    }, 3000)

    return () => {
      active = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null)
    const { error: updateError } = await updatePassword(data.password)
    if (updateError) {
      setError(translateAuthError(updateError.message))
      return
    }
    await signOut()
    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (status === 'checking') return <PageLoader label="Link controleren…" />

  if (status === 'invalid') {
    return (
      <AuthShell title="Link verlopen" subtitle="Deze resetlink is ongeldig of niet meer geldig.">
        <Link href="/forgot-password" className="btn btn-primary w-full">Nieuwe resetlink aanvragen</Link>
      </AuthShell>
    )
  }

  if (success) {
    return (
      <AuthShell title="Wachtwoord gewijzigd" subtitle="Je wordt doorgestuurd naar de inlogpagina…">
        <Link href="/login" className="btn btn-primary w-full">Nu inloggen</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Nieuw wachtwoord" subtitle="Kies een nieuw wachtwoord voor je account.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <ErrorBanner message={error} />}
        <div>
          <label htmlFor="password" className="label">Nieuw wachtwoord</label>
          <PasswordField id="password" autoComplete="new-password" placeholder="Minimaal 6 tekens" aria-invalid={!!errors.password} {...register('password')} />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="label">Herhaal wachtwoord</label>
          <PasswordField id="confirmPassword" autoComplete="new-password" placeholder="Nog een keer" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Wachtwoord opslaan
        </button>
      </form>
    </AuthShell>
  )
}
