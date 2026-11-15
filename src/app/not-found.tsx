import Link from 'next/link'
import { FishShape } from '@/components/FishArt'

export default function NotFound() {
  return (
    <div className="page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="water inline-flex size-28 items-center justify-center rounded-[2.25rem]">
        <FishShape className="w-16 animate-bob" />
      </span>
      <p className="eyebrow mt-8">404</p>
      <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">Deze is van de haak geschoten</h1>
      <p className="mt-3 max-w-md text-muted">De pagina die je zoekt bestaat niet (meer). Gooi opnieuw in vanaf het begin.</p>
      <Link href="/" className="btn btn-primary mt-8">Terug naar home</Link>
    </div>
  )
}
