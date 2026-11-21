import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { slugify } from '../lib/slugify'

const SCRIPT_ID = 'bosch-import-v1'
const SNAPSHOT_PATH = path.join(process.cwd(), 'prisma', 'data', 'bosch-catalog.json')

interface BoschProduct {
  model: string
  partNumber: string
  name: string
  type: string
  categorySlug: string
  accessories?: string
  isFeatured?: boolean
  specs: Record<string, string>
  features: string[]
  images: string[]
}

interface BoschCatalog {
  source: string
  brand: {
    name: string
    slug: string
    image: string
    isCore: boolean
    isSpecialty: boolean
    description: string
  }
  products: BoschProduct[]
}

function buildDescription(p: BoschProduct): string {
  const highlights: string[] = []
  for (const key of [
    'RATED INPUT POWER',
    'NO-LOAD SPEED',
    'IMPACT ENERGY',
    'DISC DIAMETER',
    'MAX. CUTTING DISC DIAMETER',
    'BLADE SIZE',
    'DRILLING DIAMETER',
    'CHUCK CAPACITY',
  ]) {
    if (p.specs[key]) highlights.push(`${key}: ${p.specs[key]}`)
    if (highlights.length >= 4) break
  }
  const specText = highlights.length > 0 ? ` Key specs: ${highlights.join(' | ')}.` : ''
  const accText = p.accessories ? ` Includes: ${p.accessories}.` : ''
  return `${p.name} (${p.partNumber}) — Genuine Bosch ${p.type} built for reliable performance and trade durability.${specText}${accText}`
}

function buildSpecs(p: BoschProduct): Record<string, string> {
  return {
    BRAND: 'Bosch',
    MODEL: p.model,
    TYPE: p.type,
    SERIES: 'Bosch Standard Line',
    ...p.specs,
  }
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
        `[import-bosch] Script "${SCRIPT_ID}" already ran at ${alreadyRan.ranAt.toISOString()}. Skipping.`
      )
      return
    }

    const catalog: BoschCatalog = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'))
    console.log(`[import-bosch] Importing ${catalog.products.length} Bosch Standard Tools...`)

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

    const categorySlugs = Array.from(new Set(catalog.products.map((p) => p.categorySlug)))
    const categoryIdBySlug = new Map<string, string>()

    for (const cSlug of categorySlugs) {
      const existingCat = await prisma.category.findUnique({ where: { slug: cSlug } })
      if (existingCat) {
        categoryIdBySlug.set(cSlug, existingCat.id)
      } else {
        const created = await prisma.category.create({
          data: {
            id: `cat-${cSlug}`,
            name: cSlug.toUpperCase().replace(/-/g, ' '),
            slug: cSlug,
            description: `Industrial ${cSlug.replace(/-/g, ' ')} and accessories.`,
          },
        })
        categoryIdBySlug.set(cSlug, created.id)
      }
    }

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
          features: JSON.stringify([
            `Brand: Bosch | Model: ${p.model} (${p.partNumber})`,
            ...p.features,
            '100% Genuine Bosch OEM Warranty & Service Support',
          ]),
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
        notes: `Imported Bosch brand and ${catalog.products.length} Standard Line models from ${catalog.source}.`,
      },
      create: {
        id: SCRIPT_ID,
        notes: `Imported Bosch brand and ${catalog.products.length} Standard Line models from ${catalog.source}.`,
      },
    })

    console.log(
      `[import-bosch] Completed "${SCRIPT_ID}" successfully (${catalog.products.length} Bosch products)!`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[import-bosch] Failed:', err)
  process.exit(1)
})
