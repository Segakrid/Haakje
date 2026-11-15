'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/PageLoader'

export const GuestGuard = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/')
  }, [loading, isAuthenticated, router])

  if (loading || isAuthenticated) return <PageLoader />
  return <>{children}</>
}
