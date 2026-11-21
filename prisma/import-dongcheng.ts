import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { slugify } from '../lib/slugify'

const SCRIPT_ID = 'dongcheng-import-v1'
const SNAPSHOT_PATH = path.join(process.cwd(), 'prisma', 'data', 'dongcheng-catalog.json')

interface DongChengProduct {
  model: string
  name: string
  subtitle: string
  source_url: string
  categorySlug: string
  images: string[]
  features: string[]
  specifications: Record<string, string>
  packing?: string
  isFeatured?: boolean
}

interface DongChengCatalog {
  source: string
  brand: {
    name: string
    slug: string
    image: string
    isCore: boolean
    isSpecialty: boolean
    description: string
  }
  products: DongChengProduct[]
}

function buildDescription(p: DongChengProduct): string {
  const specs = p.specifications || {}
  const highlights: string[] = []
  for (const key of [
    'RATED POWER INPUT',
    'MAX. POWER OUTPUT',
    'BATTERY',
    'NO-LOAD SPEED',
    'RATED SPEED',
    'IMPACT ENERGY',
    'MAX. WHEEL DIA.',
    'BLADE DIA.',
    'MAX. DRILLING CAPACITY',
  ]) {
    if (specs[key]) highlights.push(`${key}: ${specs[key]}`)
    if (highlights.length >= 4) break
  }
  const specText = highlights.length > 0 ? ` Key specs: ${highlights.join(' | ')}.` : ''
  const packText = p.packing ? ` Standard accessories: ${p.packing}.` : ''
  return `${p.name} — Genuine DongCheng ${p.subtitle.toLowerCase()} engineered for heavy-duty industrial and commercial applications.${specText}${packText}`
}

function buildFeatures(p: DongChengProduct): string[] {
  const out: string[] = []
  out.push(`Brand: DongCheng | Model: ${p.model}`)
  for (const f of p.features || []) {
    const clean = f.replace(/^[0-9]+\.\s*/, '').replace(/;$/, '').trim()
    if (clean && !out.includes(clean)) out.push(clean)
  }
  for (const [k, v] of Object.entries(p.specifications || {})) {
    if (out.length >= 10) break
    out.push(`${k}: ${v}`)
  }
  if (p.packing && out.length < 12) {
    out.push(`Standard Packing: ${p.packing}`)
  }
  out.push('100% Genuine DongCheng OEM Warranty & Service Support')
  return out
}

function buildSpecs(p: DongChengProduct): Record<string, string> {
  const out: Record<string, string> = {
    BRAND: 'DongCheng',
    MODEL: p.model,
    TYPE: p.subtitle,
  }
  for (const [k, v] of Object.entries(p.specifications || {})) {
    if (v && String(v).trim()) out[k] = String(v).trim()
  }
  if (p.packing) {
    out['STANDARD PACKING'] = p.packing
  }
  return out
}

async function main() {
  const force = process.argv.includes('--force')

  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/database.db'
  const rawPath = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath)

  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  }

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('synchronous = NORMAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.close()

  const adapter = new PrismaBetterSqlite3({ url: dbUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    const alreadyRan = await prisma.scriptRun.findUnique({ where: { id: SCRIPT_ID } })
    if (alreadyRan && !force) {
      console.log(
        `[import-dongcheng] Script "${SCRIPT_ID}" already ran at ${alreadyRan.ranAt.toISOString()}. Skipping.`
      )
      return
    }

    const catalog: DongChengCatalog = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'))
    console.log(
      `[import-dongcheng] Importing ${catalog.products.length} DongCheng dotted models from ${catalog.source}...`
    )

    // 1. Upsert DongCheng brand
    const brand = await prisma.brand.upsert({
      where: { slug: catalog.brand.slug },
      update: {
        name: catalog.brand.name,
        image: catalog.brand.image,
        isCore: catalog.brand.isCore,
        isSpecialty: catalog.brand.isSpecialty,
        description: catalog.brand.description,
      },
      create: {
        id: `brand-${catalog.brand.slug}`,
        name: catalog.brand.name,
        slug: catalog.brand.slug,
        image: catalog.brand.image,
        isCore: catalog.brand.isCore,
        isSpecialty: catalog.brand.isSpecialty,
        description: catalog.brand.description,
      },
    })

    // 2. Ensure required categories exist
    const categorySlugs = Array.from(new Set(catalog.products.map((p) => p.categorySlug)))
    const categoryIdBySlug = new Map<string, string>()

    const defaultNames: Record<string, string> = {
      'power-tools': 'POWER TOOLS',
      'cordless-tools': 'CORDLESS TOOLS',
      'cleaning-tools': 'CLEANING TOOLS',
      'agriculture-tools': 'AGRICULTURE TOOLS',
    }

    for (const cSlug of categorySlugs) {
      const existingCat = await prisma.category.findUnique({ where: { slug: cSlug } })
      if (existingCat) {
        categoryIdBySlug.set(cSlug, existingCat.id)
      } else {
        const created = await prisma.category.create({
          data: {
            id: `cat-${cSlug}`,
            name: defaultNames[cSlug] || cSlug.toUpperCase().replace(/-/g, ' '),
            slug: cSlug,
            description: `Industrial ${cSlug.replace(/-/g, ' ')} and accessories.`,
          },
        })
        categoryIdBySlug.set(cSlug, created.id)
      }
    }

    // 3. Upsert all 61 products in a transaction
    await prisma.$transaction(
      catalog.products.map((p) => {
        const slug = slugify(p.name)
        const id = `tool-${slug}`
        const categoryId = categoryIdBySlug.get(p.categorySlug)!
        const data = {
          name: p.name.trim(),
          brandId: brand.id,
          categoryId,
          description: buildDescription(p),
          features: JSON.stringify(buildFeatures(p)),
          specifications: JSON.stringify(buildSpecs(p)),
          images: JSON.stringify(p.images),
          videoUrl: null,
          isFeatured: Boolean(p.isFeatured),
        }
        return prisma.product.upsert({
          where: { slug },
          update: data,
          create: { id, slug, ...data },
        })
      })
    )

    await prisma.scriptRun.upsert({
      where: { id: SCRIPT_ID },
      update: {
        ranAt: new Date(),
        notes: `Imported DongCheng brand and ${catalog.products.length} dotted catalog models from ${catalog.source}.`,
      },
      create: {
        id: SCRIPT_ID,
        notes: `Imported DongCheng brand and ${catalog.products.length} dotted catalog models from ${catalog.source}.`,
      },
    })

    console.log(
      `[import-dongcheng] Completed "${SCRIPT_ID}" successfully (${catalog.products.length} DongCheng products)!`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[import-dongcheng] Failed:', err)
  process.exit(1)
})
