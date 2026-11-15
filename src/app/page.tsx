'use client'

import { useAuth } from '@/hooks/useAuth'
import { Landing } from '@/components/Landing'
import { Dashboard } from '@/components/Dashboard'
import { PageLoader } from '@/components/ui/PageLoader'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  return isAuthenticated ? <Dashboard /> : <Landing />
}
