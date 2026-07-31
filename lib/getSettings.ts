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
    primaryEmail: 'info@toolsandhardwarestores.com',
    supportEmail: 'support@toolsandhardwarestores.com',
    addressText: '5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Ranigunj, Secunderabad, Telangana 500003',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.4!2d78.4878!3d17.4339',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'demo.toolsandhardware@gmail.com',
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
