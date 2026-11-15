'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FishingRod as FishingRodIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFishingRods } from '@/hooks/useFishingRods'
import { useToast } from '@/providers/ToastProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { RodForm } from '@/components/RodForm'
import { EmptyState, PageHeader } from '@/components/ui/Bits'
import { PageLoader } from '@/components/ui/PageLoader'

export default function EditRodPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { rods, loading, editRod } = useFishingRods(user?.id || null)
  const toast = useToast()
  const rod = rods.find((r) => r.id === id)

  return (
    <AuthGuard>
      <div className="page max-w-2xl space-y-6">
        <PageHeader backHref="/rods" eyebrow="Hengels" title="Hengel bewerken" />
        {loading && !rod ? (
          <PageLoader />
        ) : !rod ? (
          <EmptyState
            art={<FishingRodIcon className="size-12 text-muted" />}
            title="Hengel niet gevonden"
            description="Deze hengel bestaat niet (meer)."
            action={<Link href="/rods" className="btn btn-primary">Naar mijn hengels</Link>}
          />
        ) : (
          <RodForm
            key={rod.id}
            initial={rod}
            submitLabel="Wijzigingen opslaan"
            onSubmit={async (input) => {
              try {
                await editRod(rod.id, input)
                toast.success('Hengel bijgewerkt')
                router.push('/rods')
              } catch {
                toast.error('Opslaan is mislukt. Probeer het opnieuw.')
              }
            }}
          />
        )}
      </div>
    </AuthGuard>
  )
}
