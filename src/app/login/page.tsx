'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { GuestGuard } from '@/components/GuestGuard'
import { AuthShell } from '@/components/AuthShell'
import { PasswordField } from '@/components/PasswordField'
import { ErrorBanner } from '@/components/ui/Bits'

export default function LoginPage() {
  const { signIn, error, clearError } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => clearError, [clearError])

  const onSubmit = async (data: LoginFormData) => {
    if (await signIn(data.email, data.password)) router.replace('/')
  }

  return (
    <GuestGuard>
      <AuthShell
        title="Welkom terug"
        subtitle={
          <>
            Nog geen account?{' '}
            <Link href="/register" className="font-semibold text-brand underline underline-offset-2">Maak er gratis een aan</Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && <ErrorBanner message={error} />}

          <div>
            <label htmlFor="email" className="label">E-mailadres</label>
            <input id="email" type="email" autoComplete="email" placeholder="jij@voorbeeld.nl" aria-invalid={!!errors.email} className="input" {...register('email')} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="label">Wachtwoord</label>
              <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">Vergeten?</Link>
            </div>
            <PasswordField id="password" autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} {...register('password')} />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Inloggen
          </button>
        </form>
      </AuthShell>
    </GuestGuard>
  )
}
