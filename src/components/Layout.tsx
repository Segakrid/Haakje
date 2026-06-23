'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Fish, FishingRod, LogIn, LogOut, UserPlus, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const Layout = ({ children }: { children: ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut, isAuthenticated } = useAuth()

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/catches', icon: Fish, label: 'Vangsten' },
    { href: '/rods', icon: FishingRod, label: 'Hengels' },
    { href: '/stats', icon: BarChart3, label: 'Statistieken' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Fish className="w-6 h-6" />
            <span className="text-xl font-bold">Haakje</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive(href) 
                    ? 'bg-blue-700' 
                    : 'hover:bg-blue-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Hoi, {user?.email?.split('@')[0]}</span>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Uitloggen</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-3 py-2 hover:bg-blue-500 rounded-md transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Inloggen</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registreren</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-700 px-4 py-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md mb-1 ${
                  isActive(href) ? 'bg-blue-800' : 'hover:bg-blue-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            <div className="border-t border-blue-600 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <span className="block text-sm px-3 py-1">Hoi, {user?.email?.split('@')[0]}</span>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Uitloggen</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-blue-600 rounded-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Inloggen</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registreren</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Haakje - Visvangst Tracker</p>
        </div>
      </footer>
    </div>
  )
}
