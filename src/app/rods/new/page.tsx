'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useFishingRods } from '@/hooks/useFishingRods'
import { useToast } from '@/providers/ToastProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { RodForm } from '@/components/RodForm'
import { PageHeader } from '@/components/ui/Bits'

export default function NewRodPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addRod } = useFishingRods(user?.id || null)
  const toast = useToast()

  return (
    <AuthGuard>
      <div className="page max-w-2xl space-y-6">
        <PageHeader backHref="/rods" eyebrow="Hengels" title="Nieuwe hengel" />
        <RodForm
          submitLabel="Hengel opslaan"
          onSubmit={async (input) => {
            try {
              await addRod(input)
              toast.success('Hengel toegevoegd')
              router.push('/rods')
            } catch {
              toast.error('Opslaan is mislukt. Probeer het opnieuw.')
            }
          }}
        />
      </div>
    </AuthGuard>
  )
}
