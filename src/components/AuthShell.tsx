import { ReactNode } from 'react'
import { Logo } from '@/components/Logo'
import { FishShape } from '@/components/FishArt'

/** Tweeluik voor inloggen/registreren: links het water, rechts het formulier. */
export const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) => (
  <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
    <aside className="water relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <Logo light />
      <div className="relative z-10 max-w-md">
        <p className="display text-4xl leading-[1.1] text-white">
          “De mooiste vangst is degene die je nooit meer vergeet.”
        </p>
        <p className="mt-5 text-white/70">
          Haakje bewaart ze allemaal: soort, gewicht, stek, aas en het verhaal erachter.
        </p>
      </div>
      <p className="relative z-10 text-sm text-white/50">Jouw gegevens blijven van jou — alleen jij kunt je logboek zien.</p>
      <FishShape className="pointer-events-none absolute top-[22%] -right-10 w-72 text-white/[0.07]" />
      <FishShape flip className="pointer-events-none absolute bottom-[18%] -left-16 w-56 text-white/[0.05]" />
    </aside>

    <div className="flex flex-col px-5 py-8 sm:px-10">
      <div className="lg:hidden">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
        <h1 className="display text-4xl text-ink">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </div>
)
