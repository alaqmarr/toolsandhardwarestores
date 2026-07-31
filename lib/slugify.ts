import slugifyLib from 'slugify'

/**
 * Clean slugify utility for generating URL-safe IDs and slugs across all models and modals
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

/**
 * Generate a unique slugified ID with an optional prefix
 */
export function slugifyId(prefix: string, name: string): string {
  const cleanSlug = slugify(name)
  return prefix ? `${prefix}-${cleanSlug}` : cleanSlug
}
