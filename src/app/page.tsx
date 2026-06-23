'use client'

import Link from 'next/link'
import { Fish, FishingRod, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Fish,
      title: 'Vangsten bijhouden',
      description: 'Registreer alle vis die je vangt met details zoals gewicht, lengte, soort en locatie.',
    },
    {
      icon: FishingRod,
      title: 'Hengels beheer',
      description: 'Houd bij welke hengels je bezit en gebruik ze bij je vangsten.',
    },
    {
      icon: BarChart3,
      title: 'Statistieken',
      description: 'Bekijk je vangststatistieken en analyseer je prestaties.',
    },
    {
      icon: ShieldCheck,
      title: 'Veilig & Privé',
      description: 'Jouw data is veilig opgeslagen en alleen voor jou toegankelijk.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welkom bij Haakje
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            De ultieme app voor het bijhouden van je visvangsten
          </p>
          
          {isAuthenticated ? (
            <Link
              href="/catches"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              Naar mijn vangsten
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Gratis registreren
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg"
              >
                Inloggen
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Waarom Haakje?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Hoe werkt het?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Registreer</h3>
              <p className="text-gray-600">Maak een gratis account aan om te beginnen.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vang & Registreer</h3>
              <p className="text-gray-600">Voer je vangsten in met alle details en foto's.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyseer</h3>
              <p className="text-gray-600">Bekijk je statistieken en verbeter je techniek.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start vandaag nog met het bijhouden van je visvangsten.
          </p>
          
          {isAuthenticated ? (
            <Link
              href="/catches"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              Naar mijn vangsten
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              Gratis starten
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
