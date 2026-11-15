'use client'

import { ReactNode, useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Fish, FishingRod, Home, LogOut, Moon, Plus, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/Logo'
import { useDismiss } from '@/hooks/useDismiss'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/catches', icon: Fish, label: 'Vangsten' },
  { href: '/rods', icon: FishingRod, label: 'Hengels' },
  { href: '/stats', icon: BarChart3, label: 'Statistieken' },
]

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

const ThemeToggle = ({ light }: { light: boolean }) => {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('haakje-theme', next)
    } catch {
      // Privémodus: thema geldt dan alleen voor deze sessie.
    }
  }
  return (
    <button
      onClick={toggle}
      aria-label="Wissel tussen licht en donker thema"
      className={`icon-btn ${light ? 'text-white/80 hover:bg-white/10 hover:text-white' : ''}`}
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  )
}

const UserMenu = () => {
  const { user, displayName, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  useDismiss(menuRef, open, useCallback(() => setOpen(false), []))

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    router.push('/')
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Accountmenu"
        className="flex size-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand uppercase ring-2 ring-surface transition hover:scale-105"
      >
        {displayName.charAt(0) || '?'}
      </button>
      {open && (
        <>
          <div role="menu" className="card absolute top-full right-0 z-50 mt-2 w-64 animate-pop p-2 shadow-lift">
            <div className="px-3 py-2.5">
              <p className="truncate font-semibold text-ink">{displayName}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-surface-2"
            >
              <LogOut className="size-4 text-muted" />
              Uitloggen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export const AppShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  const isAuthRoute = AUTH_ROUTES.includes(pathname)
  // De landingspagina heeft een donkere hero waar de header overheen ligt.
  const overHero = pathname === '/' && !isAuthenticated && !loading
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const showTabBar = isAuthenticated && !isAuthRoute

  if (isAuthRoute) return <>{children}</>

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#inhoud" className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80]">
        Naar inhoud
      </a>

      <header
        className={
          overHero
            ? 'absolute inset-x-0 top-0 z-30'
            : 'sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md'
        }
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo light={overHero} />

          {isAuthenticated && (
            <nav className="hidden items-center gap-1 rounded-2xl border border-line bg-surface p-1 shadow-card md:flex" aria-label="Hoofdnavigatie">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    isActive(href) ? 'bg-brand text-on-brand' : 'text-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-1.5">
            <ThemeToggle light={overHero} />
            {loading ? (
              <div className="size-10" />
            ) : isAuthenticated ? (
              <>
                <Link href="/catches/new" className="btn btn-accent ml-1 hidden md:inline-flex">
                  <Plus className="size-4" />
                  Nieuwe vangst
                </Link>
                <div className="ml-1.5">
                  <UserMenu />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`btn ${overHero ? 'text-white hover:bg-white/10' : 'btn-quiet'}`}
                >
                  Inloggen
                </Link>
                <Link href="/register" className="btn btn-accent hidden sm:inline-flex">
                  Gratis starten
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="inhoud" className={`flex-1 ${showTabBar ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </main>

      <footer className={`border-t border-line/70 ${showTabBar ? 'hidden md:block' : ''}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Haakje — jouw vangstlogboek</p>
          <p className="italic">Strakke lijnen!</p>
        </div>
      </footer>

      {showTabBar && (
        <nav
          aria-label="Hoofdnavigatie"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
          <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
            {navItems.slice(0, 2).map((item) => (
              <TabLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
            <div className="flex justify-center">
              <Link
                href="/catches/new"
                aria-label="Nieuwe vangst"
                className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-accent text-on-accent shadow-lift ring-4 ring-paper transition active:scale-95"
              >
                <Plus className="size-7" strokeWidth={2.5} />
              </Link>
            </div>
            {navItems.slice(2).map((item) => (
              <TabLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}

const TabLink = ({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: typeof Home
  label: string
  active: boolean
}) => (
  <Link
    href={href}
    aria-current={active ? 'page' : undefined}
    className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
      active ? 'text-brand' : 'text-muted'
    }`}
  >
    <span className={`flex h-7 w-12 items-center justify-center rounded-full transition ${active ? 'bg-brand-soft' : ''}`}>
      <Icon className="size-5" />
    </span>
    {label === 'Statistieken' ? 'Stats' : label}
  </Link>
)
