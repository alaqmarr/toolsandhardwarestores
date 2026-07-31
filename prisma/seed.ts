import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import fs from 'fs'
import slugifyLib from 'slugify'

const dbDir = path.join(process.cwd(), 'prisma')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}
const dbPath = path.join(dbDir, 'dev.db')

// Enable WAL and SHM mode explicitly on SQLite database
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('synchronous = NORMAL')
sqlite.close()

const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true })
}

async function main() {
  console.log('Seeding Tools & Hardware Stores Database...')

  // 1. Contact & SMTP Settings
  await prisma.contactSetting.upsert({
    where: { id: 'settings-main' },
    update: {},
    create: {
      id: 'settings-main',
      primaryPhone: '+91 98854 16452',
      whatsappNumber: '919885416452',
      primaryEmail: 'info@toolsandhardwarestores.com',
      supportEmail: 'support@toolsandhardwarestores.com',
      addressText: '5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Ranigunj, Secunderabad, Telangana 500003',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.4!2d78.4878!3d17.4339',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'demo.toolsandhardware@gmail.com',
      smtpPass: 'app-password-demo',
      r2Bucket: 'tools-hardware-assets',
      r2AccountId: 'demo-account-id',
      r2AccessKeyId: 'demo-access-key',
      r2SecretKey: 'demo-secret-key',
      r2PublicUrl: 'https://assets.toolsandhardwarestores.com',
    },
  })

  // 2. Multi-Store Locations (with exact GPS coordinates for distance calculator)
  const storesData = [
    {
      id: 'store-ranigunj-secunderabad',
      name: 'Victoria Ranigunj HQ (Secunderabad)',
      address: '5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Ranigunj, Secunderabad, Telangana 500003',
      phone: '+91 98854 16452',
      email: 'ranigunj@toolsandhardwarestores.com',
      latitude: 17.4339,
      longitude: 78.4878,
      hours: 'Mon-Sat: 9:30 AM - 8:30 PM | Sun: 10:00 AM - 2:00 PM',
      isPrimary: true,
    },
    {
      id: 'store-banjara-hills-hyderabad',
      name: 'Banjara Hills Industrial Supply Hub',
      address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
      phone: '+91 40 2345 6789',
      email: 'banjara@toolsandhardwarestores.com',
      latitude: 17.4116,
      longitude: 78.4357,
      hours: 'Mon-Sat: 9:00 AM - 8:00 PM | Sun: Closed',
      isPrimary: false,
    },
    {
      id: 'store-vijayawada-wholesale',
      name: 'Regional Wholesale Distribution Centre (Vijayawada)',
      address: 'Benz Circle Industrial Area, Vijayawada, Andhra Pradesh 520010',
      phone: '+91 866 247 8890',
      email: 'vijayawada@toolsandhardwarestores.com',
      latitude: 16.5062,
      longitude: 80.648,
      hours: 'Mon-Sat: 8:30 AM - 7:30 PM | Sun: Closed',
      isPrimary: false,
    },
  ]

  for (const st of storesData) {
    await prisma.storeLocation.upsert({
      where: { id: st.id },
      update: st,
      create: st,
    })
  }

  // 3. Brands (Core & Specialty)
  const brandsData = [
    { name: 'Bosch', isCore: true, isSpecialty: false, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Robert_Bosch_GmbH_logo.svg', description: 'Leading industrial power tools manufacturer. Core Distributor.' },
    { name: 'DeWalt', isCore: true, isSpecialty: false, image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/DeWalt_Logo.svg', description: 'Guaranteed Tough industrial power tools and attachments. Core Distributor.' },
    { name: 'Hitachi (Hikoki)', isCore: true, isSpecialty: false, image: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Hitachi_logo.svg', description: 'Precision Japanese engineering for heavy-duty construction. Core Distributor.' },
    { name: 'Makita', isCore: true, isSpecialty: false, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Makita_Logo.svg', description: 'World-class brushless cordless & corded power tools. Core Distributor.' },
    { name: 'Stanley', isCore: true, isSpecialty: false, image: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Stanley_Hand_Tools_logo.svg', description: 'Authorized distributor of Stanley hand tools, levels, and storage.' },
    { name: 'Black & Decker', isCore: true, isSpecialty: false, image: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Black_and_Decker_Logo.svg', description: 'Power tools and hardware for professional and home improvement.' },
    { name: 'Powerbilt', isCore: false, isSpecialty: true, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Caterpillar_logo.svg', description: 'Specialty professional equipment and heavy ringsaw machinery.' },
    { name: 'Powermatic', isCore: false, isSpecialty: true, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Snap-on_logo.svg', description: 'Industrial compressors, generators, and pneumatic systems.' },
    { name: 'Iron King', isCore: false, isSpecialty: true, image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Hilti_logo.svg', description: 'Heavy-duty impact wrenches and structural hardware.' },
    { name: 'Check Mate', isCore: false, isSpecialty: true, image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Stihl_logo.svg', description: 'High-precision laser measurement and calibration tools.' },
  ]

  for (const b of brandsData) {
    const slug = slugify(b.name)
    await prisma.brand.upsert({
      where: { slug },
      update: {
        image: b.image,
      },
      create: {
        id: `brand-${slug}`,
        name: b.name,
        slug,
        isCore: b.isCore,
        isSpecialty: b.isSpecialty,
        image: b.image,
        description: b.description,
      },
    })
  }

  // 4. Categories
  const categoriesData = [
    { name: 'Power Tools', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80', description: 'Drills, angle grinders, impact wrenches, and rotary hammers.' },
    { name: 'Heavy Machinery', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80', description: 'Generators, industrial air compressors, and demolition hammers.' },
    { name: 'Ringsaw & Specialty Equipment', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80', description: 'Concrete cutting ringsaw machines and precision diamond equipment.' },
    { name: 'Hand Tools & Measuring', image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80', description: 'Wrenches, pliers, laser measurement levels, and industrial hand tools.' },
  ]

  for (const c of categoriesData) {
    const slug = slugify(c.name)
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        id: `cat-${slug}`,
        name: c.name,
        slug,
        image: c.image,
        description: c.description,
      },
    })
  }

  // 5. Products
  const productsData = [
    {
      name: 'Bosch GSB 600 Professional Impact Drill',
      brandSlug: 'bosch',
      categorySlug: 'power-tools',
      description: 'Compact and powerful 600W impact drill designed for rigorous drilling in masonry, steel, and wood. Features forward/reverse rotation and variable speed.',
      features: JSON.stringify(['600W High-Performance Motor', '13mm Keyed Chuck', 'Dual Mode: Drilling & Impact Drilling', 'Ergonomic Auxiliary Handle', 'Same Day Delivery Available in Secunderabad']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isFeatured: true,
    },
    {
      name: 'DeWalt DWE4010 730W Angle Grinder 100mm',
      brandSlug: 'dewalt',
      categorySlug: 'power-tools',
      description: 'Robust 730W motor with advanced airflow design for prolonged durability in industrial metal and masonry cutting.',
      features: JSON.stringify(['730W Heavy Duty Motor', '100mm (4-Inch) Disc Diameter', 'Spindle Lock for Quick Disc Changes', 'Toggle Switch with Safety Lock', 'Wholesale Pricing Available']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
      ]),
      isFeatured: true,
    },
    {
      name: 'Makita HM1307C 1500W Demolition Hammer',
      brandSlug: 'makita',
      categorySlug: 'heavy-machinery',
      description: 'Heavy-duty electric demolition breaker with electronic speed control and anti-vibration technology for heavy road and structural demolition.',
      features: JSON.stringify(['1500W Brushless Motor', '33.8 Joules Impact Energy', 'LED Service Indicator for Carbon Brush Replacement', '30mm Hex Shank', 'In-Store Workshop Support']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&q=80',
      ]),
      isFeatured: true,
    },
    {
      name: 'Powerbilt PB-RS400 Industrial Ringsaw Machine',
      brandSlug: 'powerbilt',
      categorySlug: 'ringsaw-specialty-equipment',
      description: 'Specialized 400mm diamond ringsaw machine capable of deep cuts up to 260mm in reinforced concrete without over-cutting corners.',
      features: JSON.stringify(['400mm Diamond Ringsaw Ring', '260mm Maximum Cutting Depth', 'Integrated Water Feed for Dust Suppression', 'High Torque Electric Drive', 'Full Spares Stocked at Ranigunj Store']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80',
      ]),
      isFeatured: true,
    },
    {
      name: 'Powermatic 100L Industrial Air Compressor 3HP',
      brandSlug: 'powermatic',
      categorySlug: 'heavy-machinery',
      description: 'Belt-driven twin cylinder air compressor designed for automotive workshops, pneumatic machinery, and heavy industrial spray painting.',
      features: JSON.stringify(['3 HP Copper Wound Motor', '100 Litre Heavy Gauge Tank', '8 Bar Working Pressure', 'Overload Protection Switch', 'Wholesale Supply & Rapid Dispatch']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617886322207-6f504e7472c5?w=800&q=80',
      ]),
      isFeatured: false,
    },
    {
      name: 'Check Mate Laser Level 3D 12-Line Green Laser',
      brandSlug: 'check-mate',
      categorySlug: 'hand-tools-measuring',
      description: 'Self-leveling 360-degree 3D green laser level for precision structural alignment, tiling, and ceiling leveling.',
      features: JSON.stringify(['12-Line 360 Degree Beam', 'High Visibility Green Laser', 'Self-Leveling Alarm Mode', 'Rechargeable Lithium Battery Pack', 'Ideal for Contractors & Interior Decorators']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80',
      ]),
      isFeatured: false,
    },
  ]

  for (const p of productsData) {
    const slug = slugify(p.name)
    const brand = await prisma.brand.findUnique({ where: { slug: p.brandSlug } })
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } })
    if (brand && category) {
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          id: `prod-${slug}`,
          name: p.name,
          slug,
          brandId: brand.id,
          categoryId: category.id,
          description: p.description,
          features: p.features,
          images: p.images,
          videoUrl: p.videoUrl || null,
          isFeatured: p.isFeatured,
        },
      })
    }
  }

  // 6. Spare Categories & Subcategories
  const parentCat = await prisma.spareCategory.upsert({
    where: { slug: 'armatures-rotors' },
    update: {},
    create: {
      id: 'scat-armatures-rotors',
      name: 'Armatures & Rotors',
      slug: 'armatures-rotors',
      description: 'Precision copper-wound armatures for drills, grinders, and hammers.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80',
    },
  })

  await prisma.spareCategory.upsert({
    where: { slug: 'bosch-armatures' },
    update: {},
    create: {
      id: 'scat-bosch-armatures',
      name: 'Bosch Armatures',
      slug: 'bosch-armatures',
      parentId: parentCat.id,
      description: 'Original Bosch spare armatures with commutator rings.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80',
    },
  })

  await prisma.spareCategory.upsert({
    where: { slug: 'carbon-brushes-caps' },
    update: {},
    create: {
      id: 'scat-carbon-brushes-caps',
      name: 'Carbon Brushes & Caps',
      slug: 'carbon-brushes-caps',
      description: 'High-conductivity carbon brush pairs with auto-cutoff safety.',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&q=80',
    },
  })

  await prisma.spareCategory.upsert({
    where: { slug: 'ringsaw-diamond-blades' },
    update: {},
    create: {
      id: 'scat-ringsaw-diamond-blades',
      name: 'Ringsaw Diamond Blades & Rings',
      slug: 'ringsaw-diamond-blades',
      description: 'Replacement diamond rings and guide rollers for concrete cutting machines.',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&q=80',
    },
  })

  // 7. Spares & Multi-Product Linking
  const armaturesSub = await prisma.spareCategory.findUnique({ where: { slug: 'bosch-armatures' } })
  const brushesCat = await prisma.spareCategory.findUnique({ where: { slug: 'carbon-brushes-caps' } })
  const ringsawCat = await prisma.spareCategory.findUnique({ where: { slug: 'ringsaw-diamond-blades' } })

  const boschDrill = await prisma.product.findUnique({ where: { slug: slugify('Bosch GSB 600 Professional Impact Drill') } })
  const dewaltGrinder = await prisma.product.findUnique({ where: { slug: slugify('DeWalt DWE4010 730W Angle Grinder 100mm') } })
  const powerbiltRingsaw = await prisma.product.findUnique({ where: { slug: slugify('Powerbilt PB-RS400 Industrial Ringsaw Machine') } })

  if (armaturesSub && boschDrill) {
    const spare1Slug = 'armature-bosch-gsb-600-original'
    const spare1 = await prisma.spare.upsert({
      where: { slug: spare1Slug },
      update: {},
      create: {
        id: `spare-${spare1Slug}`,
        name: 'Bosch GSB 600 Original Armature Assembly 220V',
        slug: spare1Slug,
        spareCategoryId: armaturesSub.id,
        description: 'Genuine OEM Bosch replacement armature for 600W impact drill series. High thermal endurance copper coil.',
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80']),
        priceNote: 'Wholesale & Retail Pack • Stocked in Ranigunj Store',
      },
    })
    await prisma.productSpare.upsert({
      where: { productId_spareId: { productId: boschDrill.id, spareId: spare1.id } },
      update: {},
      create: {
        id: `ps-${boschDrill.id}-${spare1.id}`,
        productId: boschDrill.id,
        spareId: spare1.id,
      },
    })
  }

  if (brushesCat && boschDrill && dewaltGrinder) {
    const spare2Slug = 'universal-carbon-brush-pair-cb-325'
    const spare2 = await prisma.spare.upsert({
      where: { slug: spare2Slug },
      update: {},
      create: {
        id: `spare-${spare2Slug}`,
        name: 'Heavy Duty Carbon Brush Pair CB-325 Auto-Cutoff',
        slug: spare2Slug,
        spareCategoryId: brushesCat.id,
        description: 'Long-life electrographite carbon brushes with automatic spring cutoff to protect motor commutator.',
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80']),
        priceNote: 'Available in Bulk 50-Pair Wholesale Packs',
      },
    })
    // Link to BOTH Bosch Drill and DeWalt Grinder!
    await prisma.productSpare.upsert({
      where: { productId_spareId: { productId: boschDrill.id, spareId: spare2.id } },
      update: {},
      create: {
        id: `ps-${boschDrill.id}-${spare2.id}`,
        productId: boschDrill.id,
        spareId: spare2.id,
      },
    })
    await prisma.productSpare.upsert({
      where: { productId_spareId: { productId: dewaltGrinder.id, spareId: spare2.id } },
      update: {},
      create: {
        id: `ps-${dewaltGrinder.id}-${spare2.id}`,
        productId: dewaltGrinder.id,
        spareId: spare2.id,
      },
    })
  }

  if (ringsawCat && powerbiltRingsaw) {
    const spare3Slug = 'diamond-ring-blade-400mm-reinforced-concrete'
    const spare3 = await prisma.spare.upsert({
      where: { slug: spare3Slug },
      update: {},
      create: {
        id: `spare-${spare3Slug}`,
        name: '400mm Diamond Ring Blade for Concrete Ringsaw',
        slug: spare3Slug,
        spareCategoryId: ringsawCat.id,
        description: 'Laser-welded diamond segments for rapid cutting of heavily reinforced concrete and granite. Fits Powerbilt PB-RS400.',
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80']),
        priceNote: 'Specialty Equipment Spares • Immediate Delivery across Hyderabad/Secunderabad',
      },
    })
    await prisma.productSpare.upsert({
      where: { productId_spareId: { productId: powerbiltRingsaw.id, spareId: spare3.id } },
      update: {},
      create: {
        id: `ps-${powerbiltRingsaw.id}-${spare3.id}`,
        productId: powerbiltRingsaw.id,
        spareId: spare3.id,
      },
    })
  }

  console.log('Database seeded successfully with authentic Ranigunj Secunderabad catalog!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
