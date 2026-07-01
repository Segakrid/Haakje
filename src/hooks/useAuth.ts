import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, getCurrentUser } from '@/lib/api'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        setError('Failed to get current user')
      } finally {
        setLoading(false)
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await apiSignIn(email, password)
      if (error) {
        setError(error.message)
        return false
      }
      setUser(data.user)
      return true
    } catch (err) {
      setError('Inloggen mislukt')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Returns 'signed_in' when registration also produced a session (email
  // confirmation disabled), 'confirmation_required' when Supabase requires the
  // user to click the confirmation link first (no session yet), or false on error.
  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<'signed_in' | 'confirmation_required' | false> => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await apiSignUp(email, password, name)
      if (error) {
        setError(error.message)
        return false
      }
      if (!data.session) {
        // No session means email confirmation is required: signing up does
        // NOT log the user in yet, so we must not mark them as authenticated.
        return 'confirmation_required'
      }
      setUser(data.user)
      return 'signed_in'
    } catch (err) {
      setError('Registratie mislukt')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await apiSignOut()
      setUser(null)
    } catch (err) {
      setError('Uitloggen mislukt')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}
