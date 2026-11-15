'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { useFishingRods } from '@/hooks/useFishingRods'
import { useToast } from '@/providers/ToastProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { CatchForm } from '@/components/CatchForm'
import { ErrorBanner, PageHeader } from '@/components/ui/Bits'
import { PageLoader } from '@/components/ui/PageLoader'

export default function NewCatchPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { catches, addCatch } = useCatches(user?.id || null)
  const { fishSpecies, baitTypes, loading: refLoading, error: refError } = useReferenceData()
  const { rods, loading: rodsLoading } = useFishingRods(user?.id || null)
  const toast = useToast()

  const knownLocations = useMemo(() => [...new Set(catches.map((c) => c.location))].slice(0, 30), [catches])

  return (
    <AuthGuard>
      <div className="page max-w-2xl space-y-6">
        <PageHeader backHref="/catches" eyebrow="Logboek" title="Nieuwe vangst" subtitle="Beet! Leg hem vast nu het nog vers is." />
        {refError ? (
          <ErrorBanner message={refError} onRetry={() => window.location.reload()} />
        ) : refLoading || rodsLoading ? (
          <PageLoader />
        ) : (
          <CatchForm
            fishSpecies={fishSpecies}
            baitTypes={baitTypes}
            rods={rods}
            knownLocations={knownLocations}
            submitLabel="Vangst opslaan"
            cancelHref="/catches"
            onSubmit={async (input) => {
              try {
                const created = await addCatch({ ...input, images: (input.images || []).filter((i): i is File => typeof i !== 'string') })
                toast.success('Vangst opgeslagen — strakke lijnen!')
                router.push(`/catches/${created.id}`)
              } catch {
                toast.error('Opslaan is mislukt. Controleer je verbinding en probeer het opnieuw.')
              }
            }}
          />
        )}
      </div>
    </AuthGuard>
  )
}
