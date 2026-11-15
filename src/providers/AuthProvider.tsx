'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from '@/lib/api'
import { translateAuthError } from '@/lib/utils'

type SignUpResult = 'signed_in' | 'confirmation_required' | false

interface AuthContextValue {
  user: User | null
  /** Voornaam / weergavenaam voor begroetingen. */
  displayName: string
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Eén gedeelde auth-status voor de hele app. Voorheen hield elke component die
// useAuth() aanriep zijn eigen kopie bij (en deed zijn eigen netwerkverzoek).
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setUser(data.session?.user ?? null)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const { data, error } = await apiSignIn(email, password)
      if (error) {
        setError(translateAuthError(error.message))
        return false
      }
      setUser(data.user)
      return true
    } catch {
      setError('Inloggen is mislukt. Controleer je verbinding en probeer het opnieuw.')
      return false
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<SignUpResult> => {
    setError(null)
    try {
      const { data, error } = await apiSignUp(email, password, name)
      if (error) {
        setError(translateAuthError(error.message))
        return false
      }
      // Geen sessie = e-mailbevestiging vereist: de gebruiker is nog niet ingelogd.
      if (!data.session) return 'confirmation_required'
      setUser(data.user)
      return 'signed_in'
    } catch {
      setError('Registreren is mislukt. Controleer je verbinding en probeer het opnieuw.')
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await apiSignOut()
    } finally {
      setUser(null)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AuthContextValue>(() => {
    const metaName = typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
    const displayName = metaName.split(' ')[0] || user?.email?.split('@')[0] || ''
    return { user, displayName, loading, error, isAuthenticated: !!user, signIn, signUp, signOut, clearError }
  }, [user, loading, error, signIn, signUp, signOut, clearError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth moet binnen <AuthProvider> gebruikt worden')
  return ctx
}
