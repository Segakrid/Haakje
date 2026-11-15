import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Haakje — vangstlogboek',
    short_name: 'Haakje',
    description: 'Houd je visvangsten bij: soort, gewicht, stek, aas en foto’s.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f1e8',
    theme_color: '#06222b',
    lang: 'nl',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
