import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'American Adages Society',
    short_name: 'AAS',
    description: 'Big Wisdom, small sentences. Exploring the timeless wisdom within language.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F1E8',
    theme_color: '#8B7355',
    icons: [
      {
        src: '/Favicon Logo AAS.jpeg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
    categories: ['education', 'reference', 'culture'],
    lang: 'en-US',
    orientation: 'portrait-primary',
  }
}














