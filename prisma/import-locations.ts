import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const SCRIPT_ID = 'locations-import-v3'

const STORE_LOCATIONS = [
  {
    id: 'store-ths-ranigunj-hq',
    name: 'THS HQ',
    address:
      '5-5-187/2, Victoria Ranigunj, Old Ghasmandi, Bolaram Nagar, Rani Gunj, Secunderabad, Telangana 500003',
    phone: '+91 98854 16452',
    email: 'ths.exclusive1973@gmail.com',
    latitude: 17.4339,
    longitude: 78.4878,
    hours: 'Mon-Sat: 9:30 AM - 8:30 PM, Sun: 10:00 AM - 2:00 PM',
    mapUrl: 'https://maps.app.goo.gl/y3eDjWizCPCTYuUo8',
    isPrimary: true,
  },
  {
    id: 'store-ths-exclusive-showroom',
    name: 'THS Exclusive Showroom',
    address:
      'Shop No. 3, 4-1-82 & 83/G, K Street, Rani Gunj, Secunderabad, Telangana 500003',
    phone: '+91 98854 16452',
    email: 'ths.exclusive1973@gmail.com',
    latitude: 17.4326,
    longitude: 78.4871,
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 3:00 PM',
    mapUrl: 'https://g.co/kgs/7zVBJG',
    isPrimary: false,
  },
]

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
        `[import-locations] Script "${SCRIPT_ID}" already ran at ${alreadyRan.ranAt.toISOString()}. Skipping.`
      )
      return
    }

    console.log('[import-locations] Updating store locations and contact settings...')

    // Remove placeholder/test store rows
    await prisma.storeLocation.deleteMany({
      where: {
        OR: [{ id: 'store-test' }, { name: 'TEST' }],
      },
    })

    // Clear existing primary flags so only THS HQ is primary
    await prisma.storeLocation.updateMany({
      where: { id: { not: 'store-ths-ranigunj-hq' } },
      data: { isPrimary: false },
    })

    for (const store of STORE_LOCATIONS) {
      await prisma.storeLocation.upsert({
        where: { id: store.id },
        update: {
          name: store.name,
          address: store.address,
          phone: store.phone,
          email: store.email,
          latitude: store.latitude,
          longitude: store.longitude,
          hours: store.hours,
          mapUrl: store.mapUrl,
          isPrimary: store.isPrimary,
        },
        create: store,
      })
    }

    // Ensure main contact setting has accurate HQ address, map link, and email without overwriting SMTP/R2 keys
    await prisma.contactSetting.upsert({
      where: { id: 'settings-main' },
      update: {
        primaryEmail: 'ths.exclusive1973@gmail.com',
        supportEmail: 'ths.exclusive1973@gmail.com',
        addressText:
          '5-5-187/2, Victoria Ranigunj, Old Ghasmandi, Bolaram Nagar, Rani Gunj, Secunderabad, Telangana 500003',
        mapEmbedUrl: 'https://maps.app.goo.gl/y3eDjWizCPCTYuUo8',
      },
      create: {
        id: 'settings-main',
        primaryPhone: '+91 98854 16452',
        whatsappNumber: '919885416452',
        primaryEmail: 'ths.exclusive1973@gmail.com',
        supportEmail: 'ths.exclusive1973@gmail.com',
        addressText:
          '5-5-187/2, Victoria Ranigunj, Old Ghasmandi, Bolaram Nagar, Rani Gunj, Secunderabad, Telangana 500003',
        mapEmbedUrl: 'https://maps.app.goo.gl/y3eDjWizCPCTYuUo8',
      },
    })

    await prisma.scriptRun.upsert({
      where: { id: SCRIPT_ID },
      update: {
        ranAt: new Date(),
        notes: 'Updated THS HQ & Exclusive Showroom locations and ths.exclusive1973@gmail.com.',
      },
      create: {
        id: SCRIPT_ID,
        notes: 'Updated THS HQ & Exclusive Showroom locations and ths.exclusive1973@gmail.com.',
      },
    })

    console.log(`[import-locations] Completed "${SCRIPT_ID}" successfully!`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[import-locations] Failed:', err)
  process.exit(1)
})
