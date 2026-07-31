import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolsandhardwarestores.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/setup/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
