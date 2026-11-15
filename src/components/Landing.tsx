import Link from 'next/link'
import { ArrowRight, BarChart3, Camera, FishingRod, LockKeyhole, MapPin, Ruler, Trophy, Weight } from 'lucide-react'
import { CatchPlaceholder, FishShape } from '@/components/FishArt'

const Waves = () => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden sm:h-32" aria-hidden="true">
    {[
      { opacity: 0.35, duration: '22s', d: 'M0 60c120-40 240 40 360 0s240-40 360 0 240 40 360 0 240-40 360 0v80H0Z' },
      { opacity: 0.6, duration: '16s', d: 'M0 80c120-30 240 30 360 0s240-30 360 0 240 30 360 0 240-30 360 0v60H0Z' },
      { opacity: 1, duration: '11s', d: 'M0 100c120-22 240 22 360 0s240-22 360 0 240 22 360 0 240-22 360 0v40H0Z' },
    ].map((wave) => (
      <svg
        key={wave.duration}
        className="absolute bottom-0 left-0 h-full w-[200%] animate-drift text-paper"
        style={{ animationDuration: wave.duration, opacity: wave.opacity }}
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
      >
        <path fill="currentColor" d={wave.d} />
      </svg>
    ))}
  </div>
)

/** Voorbeeld van het logboek in de hero. Puur illustratief, met voorbeeldgegevens. */
const HeroPreview = () => (
  <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
    {/* Dobber aan een lijn */}
    <div className="absolute -top-28 right-10 hidden h-28 w-px bg-white/30 lg:block" />
    <div className="absolute -top-3 right-[1.9rem] z-20 hidden animate-bob lg:block">
      <svg viewBox="0 0 24 44" className="h-11 w-6 drop-shadow-lg">
        <path d="M12 0v8" stroke="#fff" strokeWidth="2" />
        <path d="M12 8c6 0 9 6 9 12H3c0-6 3-12 9-12Z" fill="#ff6b3d" />
        <path d="M3 20h18c0 8-4 16-9 22C7 36 3 28 3 20Z" fill="#fff" />
      </svg>
    </div>

    <div className="relative rotate-2 rounded-[1.75rem] bg-[#fffdf9] p-3 text-[#0f2530] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/20 transition duration-500 hover:rotate-0">
      <div className="relative overflow-hidden rounded-2xl">
        <CatchPlaceholder name="Snoek" className="aspect-[4/3]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06222b]/85 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#f6c544] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#3d2a00] uppercase">
          <Trophy className="size-3" />
          Record
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xs text-white/75">Vandaag, 07:42</p>
          <p className="display text-2xl text-white">Snoek</p>
        </div>
      </div>
      <div className="space-y-2.5 p-3 pt-3.5">
        <p className="flex items-center gap-1.5 text-sm text-[#5a6c73]">
          <MapPin className="size-4 text-[#0d5c6e]" />
          Kagerplassen, rietkraag
        </p>
        <div className="flex gap-1.5 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e1d9c9] px-3 py-1"><Weight className="size-3.5 text-[#5a6c73]" />6,40 kg</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e1d9c9] px-3 py-1"><Ruler className="size-3.5 text-[#5a6c73]" />94 cm</span>
          <span className="rounded-full border border-[#e1d9c9] px-3 py-1 text-[#5a6c73]">Jerkbait</span>
        </div>
      </div>
    </div>

    <div className="absolute -bottom-16 -left-4 w-44 -rotate-3 rounded-2xl bg-[#fffdf9] p-4 text-[#0f2530] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)] ring-1 ring-black/5 sm:-left-16">
      <p className="text-[11px] font-semibold tracking-wider text-[#5a6c73] uppercase">Dit seizoen</p>
      <div className="mt-2 flex h-12 items-end gap-1.5">
        {[30, 55, 40, 75, 60, 100, 85].map((h, i) => (
          <span key={i} className="flex-1 rounded-t-[3px] bg-[#0d5c6e]" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.45 }} />
        ))}
      </div>
      <p className="mt-2 text-sm"><strong className="display text-lg">47</strong> vangsten</p>
    </div>
  </div>
)

const features = [
  {
    icon: Camera,
    title: 'Elke vangst, compleet',
    text: 'Soort, gewicht, lengte, aas, hengel en foto’s. In een halve minuut vastgelegd, ook met natte handen.',
  },
  {
    icon: MapPin,
    title: 'Je stekken onthouden',
    text: 'Sla de GPS-positie op met één tik en vind die ene gouden plek volgend seizoen moeiteloos terug.',
  },
  {
    icon: BarChart3,
    title: 'Zien wat werkt',
    text: 'Welk aas vangt het best? Op welk uur bijten ze? Je statistieken geven antwoord, zonder natte vinger.',
  },
  {
    icon: Trophy,
    title: 'Records die tellen',
    text: 'Haakje houdt per soort je zwaarste en langste vis bij en zet een kroontje op elk nieuw record.',
  },
  {
    icon: FishingRod,
    title: 'Je materiaal op orde',
    text: 'Beheer je hengels en ontdek welke het vaakst krom staat.',
  },
  {
    icon: LockKeyhole,
    title: 'Alleen van jou',
    text: 'Je logboek is privé. Niemand kijkt mee naar je stekken — beloofd.',
  },
]

export const Landing = () => (
  <>
    <section className="water relative overflow-hidden">
      <FishShape className="pointer-events-none absolute top-[58%] left-0 w-28 animate-swim text-white/[0.06]" flip />
      <FishShape className="pointer-events-none absolute top-[30%] left-0 w-16 animate-swim text-white/[0.05] [animation-delay:-14s] [animation-duration:52s]" flip />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pt-32 pb-44 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-40 lg:pb-52">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-[#ff6b3d]" />
            Het vangstlogboek voor sportvissers
          </p>
          <h1 className="display mt-6 text-5xl leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Elke vangst verdient een <em className="text-[#8fe3e8]">verhaal</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Leg vast wat je vangt, waar en waarmee. Haakje maakt er een logboek van dat je slimmer laat vissen —
            en waar je over tien jaar nog met plezier in bladert.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn btn-accent min-h-13 px-7 text-base">
              Begin je logboek
              <ArrowRight className="size-5" />
            </Link>
            <Link href="/login" className="btn min-h-13 px-7 text-base text-white ring-1 ring-white/30 hover:bg-white/10">
              Ik heb al een account
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/50">Gratis · Werkt op je telefoon aan de waterkant</p>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <HeroPreview />
        </div>
      </div>
      <Waves />
    </section>

    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Waarom Haakje</p>
        <h2 className="display mt-2 text-4xl text-ink sm:text-5xl">Minder gokken, meer vangen.</h2>
        <p className="mt-4 text-lg text-muted">
          Een goed logboek is het verschil tussen geluk en inzicht. Haakje doet het rekenwerk, jij het vissen.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-on-brand">
              <Icon className="size-6" />
            </span>
            <h3 className="display mt-5 text-xl text-ink">{title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow">Zo werkt het</p>
        <h2 className="display mt-2 text-4xl text-ink sm:text-5xl">In drie worpen binnen.</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            { title: 'Maak een account', text: 'Gratis en in een minuut geregeld. Je logboek staat direct voor je klaar.' },
            { title: 'Vang en leg vast', text: 'Beet? Foto, soort en gewicht erin. De stek pakt Haakje via GPS voor je mee.' },
            { title: 'Leer van je logboek', text: 'Ontdek patronen in aas, tijd en plek, en ga gericht achter je volgende record aan.' },
          ].map((step, i) => (
            <li key={step.title} className="relative">
              <span className="display tnum text-7xl leading-none text-brand/20">{i + 1}</span>
              <h3 className="display mt-2 text-2xl text-ink">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="water relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12">
        <FishShape className="pointer-events-none absolute -right-8 -bottom-6 w-64 text-white/[0.07]" />
        <h2 className="display relative text-4xl text-white sm:text-5xl">De volgende is voor het logboek.</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/75">
          Begin vandaag, dan weet je volgend seizoen precies waar je moet zijn.
        </p>
        <Link href="/register" className="btn btn-accent relative mt-8 min-h-13 px-7 text-base">
          Gratis starten
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  </>
)
