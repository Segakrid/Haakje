'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { useFishingRods } from '@/hooks/useFishingRods'
import { useToast } from '@/providers/ToastProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { CatchForm } from '@/components/CatchForm'
import { FishShape } from '@/components/FishArt'
import { EmptyState, ErrorBanner, PageHeader } from '@/components/ui/Bits'
import { PageLoader } from '@/components/ui/PageLoader'

export default function EditCatchPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { catches, loading, editCatch } = useCatches(user?.id || null)
  const { fishSpecies, baitTypes, loading: refLoading, error: refError } = useReferenceData()
  const { rods, loading: rodsLoading } = useFishingRods(user?.id || null)
  const toast = useToast()

  const catchItem = catches.find((c) => c.id === id)
  const knownLocations = useMemo(() => [...new Set(catches.map((c) => c.location))].slice(0, 30), [catches])

  return (
    <AuthGuard>
      <div className="page max-w-2xl space-y-6">
        <PageHeader backHref={`/catches/${id}`} eyebrow="Logboek" title="Vangst bewerken" />
        {refError ? (
          <ErrorBanner message={refError} onRetry={() => window.location.reload()} />
        ) : (loading && !catchItem) || refLoading || rodsLoading ? (
          <PageLoader />
        ) : !catchItem ? (
          <EmptyState
            art={<FishShape className="w-20 text-muted" />}
            title="Vangst niet gevonden"
            description="Deze vangst bestaat niet (meer)."
            action={<Link href="/catches" className="btn btn-primary">Naar mijn vangsten</Link>}
          />
        ) : (
          <CatchForm
            key={catchItem.id}
            initial={catchItem}
            fishSpecies={fishSpecies}
            baitTypes={baitTypes}
            rods={rods}
            knownLocations={knownLocations}
            submitLabel="Wijzigingen opslaan"
            cancelHref={`/catches/${id}`}
            onSubmit={async (input) => {
              try {
                await editCatch(catchItem.id, input)
                toast.success('Vangst bijgewerkt')
                router.push(`/catches/${catchItem.id}`)
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
