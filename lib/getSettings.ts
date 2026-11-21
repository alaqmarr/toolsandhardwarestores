import { prisma } from './db'

export async function getContactSettings() {
  try {
    const settings = await prisma.contactSetting.findUnique({
      where: { id: 'settings-main' },
    })
    if (settings) return settings
  } catch (error) {
    console.error('Error fetching contact settings:', error)
  }

  // Fallback defaults if DB is uninitialized
  return {
    id: 'settings-main',
    primaryPhone: '+91 98854 16452',
    whatsappNumber: '919885416452',
    primaryEmail: 'ths.exclusive1973@gmail.com',
    supportEmail: 'ths.exclusive1973@gmail.com',
    addressText: '5-5-187/2, Victoria Ranigunj, Old Ghasmandi, Bolaram Nagar, Rani Gunj, Secunderabad, Telangana 500003',
    mapEmbedUrl: 'https://maps.app.goo.gl/y3eDjWizCPCTYuUo8',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    r2Bucket: '',
    r2AccountId: '',
    r2AccessKeyId: '',
    r2SecretKey: '',
    r2PublicUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
