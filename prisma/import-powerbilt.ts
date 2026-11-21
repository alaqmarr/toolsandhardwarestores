import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { slugify } from '../lib/slugify'

const SCRIPT_ID = 'powerbilt-import-v1'
const API_BASE = 'https://api.powerbilt.in/v1'
const SNAPSHOT_PATH = path.join(process.cwd(), 'prisma', 'data', 'powerbilt-catalog.json')

interface RawBrand {
  id: number
  name: string
  image: string | null
  thumb_image?: string | null
  background_image?: string | null
}

interface RawCategory {
  id: number
  name: string
  image: string | null
}

interface RawProduct {
  id: number
  name: string
  brand_id: number
  brand_name?: string | null
  category_id: number
  category_name?: string | null
  sub_category_name?: string | null
  serial_number?: string | null
  price?: string | null
  images: string[]
  product_video?: string | null
  document?: string | null
  attachment_link?: string | null
  remarks?: string | null
  specifications?: Record<string, string | number | null>
  spare_ids?: number[]
  isFeatured?: boolean
}

interface RawSpareCategory {
  id: number
  name: string
  parentId: number | null
  image: string | null
}

interface RawSpare {
  id: number
  name: string
  product_id?: number | null
  brand_name?: string | null
  category_id?: number | null
  sub_category_id?: number | null
  model_number?: string | null
  serial_number?: string | null
  sku?: string | null
  price?: string | null
  images: string[]
  specifications?: Record<string, string | number | null>
}

interface RawCatalogue {
  id: number
  title: string
  description?: string | null
  image?: string | null
  pdf_file: string
}

interface CatalogSnapshot {
  source: string
  fetchedAt: string
  brands: RawBrand[]
  categories: RawCategory[]
  products: RawProduct[]
  spareCategories: RawSpareCategory[]
  spares: RawSpare[]
  catalogues: RawCatalogue[]
}

const BRAND_DESCRIPTIONS: Record<string, string> = {
  powerbilt:
    'Powerbilt is a flagship industrial power tools, cordless equipment, agriculture machinery, diamond saw blades, and genuine spare parts brand built for heavy-duty commercial and contractor applications.',
  checkmate:
    'Checkmate supplies precision power tools, cordless drivers, diamond blades, cleaning equipment, and industrial accessories engineered for reliable jobsite performance.',
  tewort:
    'Tewort manufactures high-torque rotary hammers, demolition breakers, cordless impact wrenches, and heavy-duty construction & forestry machinery.',
  powermatic:
    'Powermatic delivers professional power tools, cordless systems, abrasives, chisels, and workshop machinery for industrial and fabrication workflows.',
  ironking:
    'Iron King produces rugged demolition hammers, SDS rotary hammers, cordless tools, and heavy-duty petrol chainsaws for demanding site conditions.',
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'power-tools':
    'Electric drills, angle grinders, rotary & demolition hammers, marble/wood cutters, cut-off machines, blowers, welders, and air compressors.',
  'cordless-tools':
    'Brushless 12V–21V cordless drills, impact wrenches, rotary hammers, laser levels, suction cups, and lithium battery systems.',
  generator:
    'Portable petrol and inverter generators engineered for reliable jobsite, commercial, and emergency backup power.',
  'cleaning-tools':
    'High-pressure washers, industrial wet & dry vacuum cleaners, and commercial surface cleaning equipment.',
  'agriculture-tools':
    'Petrol & electric chainsaws, brush cutters, earth augers, water pumps, guide bars, and saw chains for forestry and agriculture.',
  'diamond-saw-blades':
    'Segmented, turbo, continuous rim, and ring saw diamond blades across Silver, Gold, Red, Cream, Yellow, Blue, Black, and Green series.',
  abrasives:
    'Cut-off wheels, DC grinding wheels, flap discs, GC stone wheels, and non-woven polishing wheels for metal and stone fabrication.',
  'tct-saw-blades':
    'Tungsten carbide tipped circular saw blades for precision wood, aluminum, and multi-material cutting.',
  'sds-drill-bit':
    'SDS Plus and SDS Max masonry and reinforced concrete drill bits for rotary hammer machines.',
  chisel:
    'Point, flat, and wide SDS Plus / SDS Max / Hex demolition chisels for concrete and masonry breaking.',
  'core-bits':
    'Diamond core drill bits for clean precision boring in reinforced concrete, brick, and stone.',
  accessories:
    'Genuine tool chucks, adapters, laser tripods, batteries, chargers, and jobsite attachments.',
}

function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJsonWithRateLimit(url: string, retries = 6): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    })
    if (res.status === 429) {
      const reset = Number(res.headers.get('RateLimit-Reset') || res.headers.get('Retry-After') || 31)
      console.log(`  [429] Rate limited on ${url}, waiting ${reset + 2}s...`)
      await sleep((reset + 2) * 1000)
      continue
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`)
    }
    const remaining = res.headers.get('RateLimit-Remaining')
    const reset = res.headers.get('RateLimit-Reset')
    const data = await res.json()
    if (remaining !== null && Number(remaining) <= 5) {
      const waitSec = Number(reset || 30) + 1
      console.log(`  [rate-limit] ${remaining} left, pausing ${waitSec}s...`)
      await sleep(waitSec * 1000)
    }
    return data
  }
  throw new Error(`Failed after ${retries} retries: ${url}`)
}

async function fetchLiveSnapshot(): Promise<CatalogSnapshot> {
  console.log('[import-powerbilt] Fetching live data from https://api.powerbilt.in/v1 ...')
  const [brandsRes, allCatsRes, cataloguesRes, mostSellingRes, newArrivalsRes, allProdsRes, sparesRes] =
    await Promise.all([
      fetchJsonWithRateLimit(`${API_BASE}/web/get-brands`),
      fetchJsonWithRateLimit(`${API_BASE}/web/get-categories`),
      fetchJsonWithRateLimit(`${API_BASE}/web/get-active-catalogues`),
      fetchJsonWithRateLimit(`${API_BASE}/web/web-most-selling`),
      fetchJsonWithRateLimit(`${API_BASE}/web/web-new-arrivals`),
      fetchJsonWithRateLimit(`${API_BASE}/user/product/web-get-all-products?limit=5000`),
      fetchJsonWithRateLimit(`${API_BASE}/user/spareparts/fetchspareparts?page=1&limit=5000`),
    ])

  const brandsData = brandsRes.data || []
  const catImages: Record<number, string> = {}
  for (const b of brandsData) {
    const bcats = (await fetchJsonWithRateLimit(`${API_BASE}/user/home/web-get-categories?brand_id=${b.id}`)).data || []
    for (const c of bcats) {
      if (c.image && !catImages[c.id]) catImages[c.id] = c.image
    }
  }

  const spareSubcats: Record<number, RawSpareCategory> = {}
  for (const cid of [15, 16, 17, 18, 19, 22]) {
    for (const b of brandsData) {
      try {
        const subs =
          (await fetchJsonWithRateLimit(`${API_BASE}/user/home/get-sub-categories?brand_id=${b.id}&category_id=${cid}`))
            .data || []
        for (const sc of subs) {
          if (!spareSubcats[sc.id]) {
            spareSubcats[sc.id] = { id: sc.id, name: sc.name, parentId: cid, image: sc.image || null }
          }
        }
      } catch {
        // Not every brand has subcategories for every spare category
      }
    }
  }

  const prodList: any[] = []
  for (const g of allProdsRes.data || []) {
    prodList.push(...(g.products || []))
  }

  const featuredIds = new Set<number>([
    ...(mostSellingRes.data || []).map((x: any) => x.id),
    ...(newArrivalsRes.data || []).map((x: any) => x.id),
  ])

  const detailsById: Record<number, any> = {}
  for (let i = 0; i < prodList.length; i++) {
    const p = prodList[i]
    const d = (await fetchJsonWithRateLimit(`${API_BASE}/user/product/${p.id}`)).data
    detailsById[p.id] = d
    if ((i + 1) % 100 === 0 || i + 1 === prodList.length) {
      console.log(`  Fetched ${i + 1}/${prodList.length} product details...`)
    }
  }

  const seenCatIds = new Set<number>()
  const categories: RawCategory[] = []
  for (const p of prodList) {
    if (p.category && !seenCatIds.has(p.category.id)) {
      seenCatIds.add(p.category.id)
      categories.push({ id: p.category.id, name: p.category.name, image: catImages[p.category.id] || null })
    }
  }

  const products: RawProduct[] = prodList.map((p) => {
    const d = detailsById[p.id]
    const imgs: string[] = []
    if (d.primary_image) imgs.push(d.primary_image)
    for (const im of d.images || []) {
      const u = typeof im === 'string' ? im : im?.url
      if (u && !imgs.includes(u)) imgs.push(u)
    }
    return {
      id: d.id,
      name: d.name,
      brand_id: p.brand_id,
      brand_name: d.brand?.name || null,
      category_id: p.category_id,
      category_name: d.category?.name || null,
      sub_category_name: d.sub_category?.name || null,
      serial_number: d.serial_number || null,
      price: d.price || null,
      images: imgs,
      product_video: d.product_video || null,
      document: d.document || null,
      attachment_link: d.attachment_link || null,
      remarks: d.remarks || null,
      specifications: d.specifications || p.specifications || {},
      spare_ids: (d.spareParts || []).map((sp: any) => sp.id),
      isFeatured: featuredIds.has(d.id),
    }
  })

  const spareCategories: RawSpareCategory[] = [
    ...(allCatsRes.data || [])
      .filter((c: any) => [15, 16, 17, 18, 19, 22].includes(c.id))
      .map((c: any) => ({ id: c.id, name: c.name, parentId: null, image: catImages[c.id] || null })),
    ...Object.values(spareSubcats),
  ]

  const spares: RawSpare[] = (sparesRes.data || []).map((s: any) => {
    const imgs: string[] = []
    if (s.primary_image) imgs.push(s.primary_image)
    for (const im of s.images || []) {
      const u = typeof im === 'string' ? im : im?.url
      if (u && !imgs.includes(u)) imgs.push(u)
    }
    return {
      id: s.id,
      name: s.name,
      product_id: s.product_id || null,
      brand_name: s.brand?.name || null,
      category_id: s.category_id || null,
      sub_category_id: s.sub_category_id || null,
      model_number: s.model_number || null,
      serial_number: s.serial_number || null,
      sku: s.sku || null,
      price: s.price || null,
      images: imgs,
      specifications: s.specifications || {},
    }
  })

  const snapshot: CatalogSnapshot = {
    source: 'https://powerbilt.in',
    fetchedAt: new Date().toISOString(),
    brands: brandsData.map((b: any) => ({
      id: b.id,
      name: b.name,
      image: b.web_image || b.image,
      thumb_image: b.image,
      background_image: b.background_image,
    })),
    categories,
    products,
    spareCategories,
    spares,
    catalogues: (cataloguesRes.data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || null,
      image: c.image || null,
      pdf_file: c.pdf_file,
    })),
  }

  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true })
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf-8')
  console.log(`[import-powerbilt] Saved refreshed snapshot to ${SNAPSHOT_PATH}`)
  return snapshot
}

function buildProductDescription(p: RawProduct): string {
  const brand = p.brand_name || 'Powerbilt'
  const cat = p.sub_category_name || p.category_name || 'Industrial Equipment'
  const specs = p.specifications || {}
  const highlights: string[] = []
  for (const key of ['INPUT POWER', 'VOLTAGE/FREQUENCY', 'NO LOAD SPEED', 'BLADE DIAMETER', 'CHUCK SIZE', 'MAX. DRILLING CAPACITY', 'CAPACITY', 'PRESSURE']) {
    if (specs[key]) highlights.push(`${key}: ${specs[key]}`)
  }
  const specText = highlights.length > 0 ? ` Key specs: ${highlights.slice(0, 4).join(' | ')}.` : ''
  const partText = p.serial_number ? ` Part/SKU: ${p.serial_number}.` : ''
  return `${p.name} — Genuine ${brand} ${cat.toLowerCase()} engineered for heavy-duty industrial and professional applications.${specText}${partText}`
}

function buildProductFeatures(p: RawProduct): string[] {
  const features: string[] = []
  if (p.brand_name) features.push(`Brand: ${p.brand_name}`)
  if (p.sub_category_name) features.push(`Equipment Type: ${p.sub_category_name}`)
  const specs = p.specifications || {}
  for (const [k, v] of Object.entries(specs)) {
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      features.push(`${k}: ${String(v).trim()}`)
    }
    if (features.length >= 10) break
  }
  if (p.serial_number && !features.some((f) => f.includes(String(p.serial_number)))) {
    features.push(`Part Number: ${p.serial_number}`)
  }
  features.push('100% Genuine OEM Warranty & Spares Support')
  return features
}

function buildProductSpecs(p: RawProduct): Record<string, string> {
  const out: Record<string, string> = {}
  if (p.brand_name) out['BRAND'] = p.brand_name
  if (p.category_name) out['CATEGORY'] = p.category_name
  if (p.sub_category_name) out['SUB-CATEGORY'] = p.sub_category_name
  for (const [k, v] of Object.entries(p.specifications || {})) {
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      out[k] = String(v).trim()
    }
  }
  if (p.serial_number && !out['PART NUMBER']) {
    out['PART NUMBER'] = String(p.serial_number)
  }
  return out
}

function mapCatalogueCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('spare')) return 'Spare Parts'
  if (t.includes('garden') || t.includes('saw chain')) return 'Heavy Machinery'
  return 'Power Tools'
}

async function runInBatches<T>(items: T[], batchSize: number, fn: (batch: T[]) => Promise<void>) {
  for (let i = 0; i < items.length; i += batchSize) {
    await fn(items.slice(i, i + batchSize))
  }
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const force = args.has('--force')
  const live = args.has('--live')

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
    // One-time execution guard
    const alreadyRan = await prisma.scriptRun.findUnique({ where: { id: SCRIPT_ID } })
    if (alreadyRan && !force) {
      console.log(
        `[import-powerbilt] Script "${SCRIPT_ID}" already ran at ${alreadyRan.ranAt.toISOString()}. Skipping.`
      )
      return
    }

    const catalog: CatalogSnapshot = live
      ? await fetchLiveSnapshot()
      : JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'))

    console.log(
      `[import-powerbilt] Starting import from ${catalog.source} (${catalog.brands.length} brands, ${catalog.categories.length} categories, ${catalog.products.length} products, ${catalog.spares.length} spares, ${catalog.catalogues.length} catalogues)...`
    )

    // 1. Brands (upsert & reuse existing matching brands by normalized name)
    const existingBrands = await prisma.brand.findMany()
    const brandMap = new Map<number, { id: string; slug: string; image: string | null }>()

    for (const b of catalog.brands) {
      const slug = slugify(b.name)
      const norm = normalizeKey(b.name)
      const existing = existingBrands.find(
        (eb) => normalizeKey(eb.name) === norm || normalizeKey(eb.slug) === norm
      )
      const logoUrl = b.image || b.thumb_image || null
      const description = BRAND_DESCRIPTIONS[norm] || `Authorized distributor for ${b.name} tools and equipment.`
      const isCore = norm === 'powerbilt' || Boolean(existing?.isCore)
      const isSpecialty = true

      if (existing) {
        const updated = await prisma.brand.update({
          where: { id: existing.id },
          data: {
            image: logoUrl || existing.image,
            description: existing.description || description,
            isCore,
            isSpecialty,
          },
        })
        brandMap.set(b.id, { id: updated.id, slug: updated.slug, image: updated.image })
      } else {
        const created = await prisma.brand.create({
          data: {
            id: `brand-${slug}`,
            name: b.name.trim(),
            slug,
            image: logoUrl,
            isCore,
            isSpecialty,
            description,
          },
        })
        brandMap.set(b.id, { id: created.id, slug: created.slug, image: created.image })
      }
    }
    console.log(`[import-powerbilt] Synced ${brandMap.size} brands.`)

    // 2. Categories
    const categoryMap = new Map<number, { id: string; slug: string; image: string | null }>()
    for (const c of catalog.categories) {
      const slug = slugify(c.name)
      const description =
        CATEGORY_DESCRIPTIONS[slug] || `Industrial ${c.name.toLowerCase()} and heavy-duty accessories.`
      const existing = await prisma.category.findUnique({ where: { slug } })

      if (existing) {
        const updated = await prisma.category.update({
          where: { id: existing.id },
          data: {
            image: c.image || existing.image,
            description: existing.description || description,
          },
        })
        categoryMap.set(c.id, { id: updated.id, slug: updated.slug, image: updated.image })
      } else {
        const created = await prisma.category.create({
          data: {
            id: `cat-${slug}`,
            name: c.name.trim(),
            slug,
            image: c.image,
            description,
          },
        })
        categoryMap.set(c.id, { id: created.id, slug: created.slug, image: created.image })
      }
    }
    console.log(`[import-powerbilt] Synced ${categoryMap.size} categories.`)

    // 3. Products
    const existingProducts = await prisma.product.findMany({ select: { id: true, slug: true } })
    const existingSlugToId = new Map(existingProducts.map((p) => [p.slug, p.id]))
    const usedProductSlugs = new Set<string>(existingProducts.map((p) => p.slug))
    const productMap = new Map<number, { id: string; primaryImage: string | null }>()

    const productOps: Array<{
      id: string
      slug: string
      data: {
        name: string
        brandId: string
        categoryId: string
        description: string
        features: string
        specifications: string
        images: string
        videoUrl: string | null
        isFeatured: boolean
      }
    }> = []

    for (const p of catalog.products) {
      const brand = brandMap.get(p.brand_id)
      const category = categoryMap.get(p.category_id)
      if (!brand || !category) continue

      const baseSlug = slugify(p.name) || `product-${p.id}`
      let slug = baseSlug
      const expectedId = `tool-${baseSlug}`
      // If slug exists for a DIFFERENT id (e.g. a user-created item or duplicate in source), disambiguate
      if (existingSlugToId.has(slug) && existingSlugToId.get(slug) !== expectedId) {
        slug = `${baseSlug}-${p.id}`
      } else if (!existingSlugToId.has(slug) && usedProductSlugs.has(slug)) {
        slug = `${baseSlug}-${p.id}`
      }
      usedProductSlugs.add(slug)
      const id = existingSlugToId.get(slug) ?? `tool-${slug}`

      const imagesList =
        p.images && p.images.length > 0
          ? p.images
          : [category.image || brand.image || 'https://powerbilt.b-cdn.net/media/brands/1786171756364_661648.png']

      productMap.set(p.id, { id, primaryImage: imagesList[0] || null })

      productOps.push({
        id,
        slug,
        data: {
          name: p.name.trim(),
          brandId: brand.id,
          categoryId: category.id,
          description: buildProductDescription(p),
          features: JSON.stringify(buildProductFeatures(p)),
          specifications: JSON.stringify(buildProductSpecs(p)),
          images: JSON.stringify(imagesList),
          videoUrl: p.product_video || null,
          isFeatured: Boolean(p.isFeatured),
        },
      })
    }

    await runInBatches(productOps, 100, async (batch) => {
      await prisma.$transaction(
        batch.map((item) =>
          prisma.product.upsert({
            where: { slug: item.slug },
            update: item.data,
            create: { id: item.id, slug: item.slug, ...item.data },
          })
        )
      )
    })
    console.log(`[import-powerbilt] Synced ${productOps.length} products.`)

    // 4. Spare Categories (parents first, then children)
    const spareCatMap = new Map<number, { id: string; image: string | null }>()
    const parentSpareCats = catalog.spareCategories.filter((c) => c.parentId === null)
    const childSpareCats = catalog.spareCategories.filter((c) => c.parentId !== null)

    const fallbackCatImages: Record<number, string | null> = {
      15: categoryMap.get(1)?.image || null,
      16: categoryMap.get(2)?.image || null,
      17: categoryMap.get(6)?.image || null,
      18: categoryMap.get(8)?.image || null,
      19: categoryMap.get(7)?.image || null,
      22: categoryMap.get(13)?.image || null,
    }

    for (const sc of [...parentSpareCats, ...childSpareCats]) {
      const slug = slugify(sc.name)
      const parentDbId = sc.parentId ? spareCatMap.get(sc.parentId)?.id || null : null
      const image = sc.image || fallbackCatImages[sc.id] || (sc.parentId ? fallbackCatImages[sc.parentId] : null)
      const existing = await prisma.spareCategory.findUnique({ where: { slug } })

      if (existing) {
        const updated = await prisma.spareCategory.update({
          where: { id: existing.id },
          data: {
            parentId: parentDbId ?? existing.parentId,
            image: image || existing.image,
          },
        })
        spareCatMap.set(sc.id, { id: updated.id, image: updated.image })
      } else {
        const created = await prisma.spareCategory.create({
          data: {
            id: `scat-${slug}`,
            name: sc.name.trim(),
            slug,
            parentId: parentDbId,
            image,
            description: `Genuine replacement parts under ${sc.name.trim()}.`,
          },
        })
        spareCatMap.set(sc.id, { id: created.id, image: created.image })
      }
    }
    console.log(`[import-powerbilt] Synced ${spareCatMap.size} spare categories.`)

    // 5. Spares
    const existingSpares = await prisma.spare.findMany({ select: { id: true, slug: true } })
    const existingSpareSlugToId = new Map(existingSpares.map((s) => [s.slug, s.id]))
    const usedSpareSlugs = new Set<string>(existingSpares.map((s) => s.slug))
    const spareMap = new Map<number, string>()

    const spareOps: Array<{
      id: string
      slug: string
      data: {
        name: string
        spareCategoryId: string | null
        description: string
        images: string
        priceNote: string
      }
    }> = []

    const defaultSpareImg =
      categoryMap.get(13)?.image ||
      categoryMap.get(1)?.image ||
      'https://powerbilt.b-cdn.net/media/brands/1786171756364_661648.png'

    for (const s of catalog.spares) {
      const baseSlug = slugify(s.name) || `spare-${s.id}`
      let slug = baseSlug
      const expectedId = `spare-${baseSlug}`
      if (existingSpareSlugToId.has(slug) && existingSpareSlugToId.get(slug) !== expectedId) {
        slug = `${baseSlug}-${s.id}`
      } else if (!existingSpareSlugToId.has(slug) && usedSpareSlugs.has(slug)) {
        slug = `${baseSlug}-${s.id}`
      }
      usedSpareSlugs.add(slug)
      const id = existingSpareSlugToId.get(slug) ?? `spare-${slug}`
      spareMap.set(s.id, id)

      const spareCatEntry =
        (s.sub_category_id ? spareCatMap.get(s.sub_category_id) : undefined) ??
        (s.category_id ? spareCatMap.get(s.category_id) : undefined)

      const linkedProdImg = s.product_id ? productMap.get(s.product_id)?.primaryImage : null
      const imgs =
        s.images && s.images.length > 0
          ? s.images
          : [linkedProdImg || spareCatEntry?.image || defaultSpareImg]

      const brandLabel = s.brand_name || 'Powerbilt'
      const itemName = s.sku || (s.specifications?.['ITEM NAME'] ? String(s.specifications['ITEM NAME']) : 'spare part')
      const modelLabel =
        s.model_number || (s.specifications?.['MODEL NUMBER'] ? String(s.specifications['MODEL NUMBER']) : '')
      const partNo =
        s.serial_number || (s.specifications?.['PART NUMBER'] ? String(s.specifications['PART NUMBER']) : '')

      const desc = `Genuine ${brandLabel} ${itemName.toLowerCase()}${modelLabel ? ` compatible with model ${modelLabel}` : ''}${partNo ? ` (Part No: ${partNo})` : ''}.`
      const priceNote = modelLabel
        ? `Fits ${modelLabel}${partNo ? ` • Part #${partNo}` : ''} • Genuine OEM Spare`
        : partNo
          ? `Part #${partNo} • Genuine OEM Spare`
          : 'Genuine OEM Replacement Spare'

      spareOps.push({
        id,
        slug,
        data: {
          name: s.name.trim(),
          spareCategoryId: spareCatEntry?.id || null,
          description: desc,
          images: JSON.stringify(imgs),
          priceNote,
        },
      })
    }

    await runInBatches(spareOps, 200, async (batch) => {
      await prisma.$transaction(
        batch.map((item) =>
          prisma.spare.upsert({
            where: { slug: item.slug },
            update: item.data,
            create: { id: item.id, slug: item.slug, ...item.data },
          })
        )
      )
    })
    console.log(`[import-powerbilt] Synced ${spareOps.length} spares.`)

    // 6. ProductSpare compatibility links (union of product.spare_ids and spare.product_id)
    const linkPairs = new Map<string, { id: string; productId: string; spareId: string }>()
    for (const p of catalog.products) {
      const prodDb = productMap.get(p.id)
      if (!prodDb) continue
      for (const spRawId of p.spare_ids || []) {
        const spareDbId = spareMap.get(spRawId)
        if (!spareDbId) continue
        const key = `${prodDb.id}::${spareDbId}`
        if (!linkPairs.has(key)) {
          linkPairs.set(key, {
            id: `${prodDb.id}-${spareDbId}`,
            productId: prodDb.id,
            spareId: spareDbId,
          })
        }
      }
    }
    for (const s of catalog.spares) {
      if (!s.product_id) continue
      const prodDb = productMap.get(s.product_id)
      const spareDbId = spareMap.get(s.id)
      if (!prodDb || !spareDbId) continue
      const key = `${prodDb.id}::${spareDbId}`
      if (!linkPairs.has(key)) {
        linkPairs.set(key, {
          id: `${prodDb.id}-${spareDbId}`,
          productId: prodDb.id,
          spareId: spareDbId,
        })
      }
    }

    const linkList = Array.from(linkPairs.values())
    await runInBatches(linkList, 250, async (batch) => {
      await prisma.$transaction(
        batch.map((link) =>
          prisma.productSpare.upsert({
            where: { productId_spareId: { productId: link.productId, spareId: link.spareId } },
            update: {},
            create: link,
          })
        )
      )
    })
    console.log(`[import-powerbilt] Synced ${linkList.length} product-spare compatibility links.`)

    // 7. Resource Catalogues (PDF brochures)
    const existingCatalogues = await prisma.resourceCatalogue.findMany({ select: { fileUrl: true } })
    const existingUrls = new Set(existingCatalogues.map((c) => c.fileUrl))
    let createdCats = 0
    for (const c of catalog.catalogues) {
      if (!c.pdf_file || existingUrls.has(c.pdf_file)) continue
      await prisma.resourceCatalogue.create({
        data: {
          id: `cat-res-pb-${c.id}`,
          title: c.title.trim(),
          category: mapCatalogueCategory(c.title),
          description:
            c.description && c.description.trim() !== c.title.trim()
              ? c.description.trim()
              : `Official ${c.title.trim()} PDF brochure and product reference guide.`,
          fileUrl: c.pdf_file,
          fileType: 'PDF',
          fileSize: 'Official PDF',
          isPublic: true,
        },
      })
      createdCats++
    }
    console.log(`[import-powerbilt] Added ${createdCats} official PDF catalogues.`)

    // 8. Record one-time execution marker
    await prisma.scriptRun.upsert({
      where: { id: SCRIPT_ID },
      update: {
        ranAt: new Date(),
        notes: `Imported ${brandMap.size} brands, ${categoryMap.size} categories, ${productOps.length} products, ${spareOps.length} spares, ${linkList.length} fitment links, ${createdCats} catalogues from ${catalog.source}.`,
      },
      create: {
        id: SCRIPT_ID,
        notes: `Imported ${brandMap.size} brands, ${categoryMap.size} categories, ${productOps.length} products, ${spareOps.length} spares, ${linkList.length} fitment links, ${createdCats} catalogues from ${catalog.source}.`,
      },
    })

    console.log(`[import-powerbilt] Completed "${SCRIPT_ID}" successfully!`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[import-powerbilt] Failed:', err)
  process.exit(1)
})
