/**
 * Helper to construct professional WhatsApp prefilled inquiry URLs
 * Uses the primary phone number from the DB as the target WhatsApp number.
 */
export function getWhatsAppInquiryUrl(params: {
  phone: string
  itemName: string
  itemType: 'Product' | 'Spare Part' | 'General Consultation'
  itemSlug?: string
  extraNotes?: string
}): string {
  // Clean phone number (strip spaces, +, hyphens)
  const cleanPhone = params.phone.replace(/[^0-9]/g, '')

  let message = `Hello Tools & Hardware Stores (Ranigunj HQ),\n\n`
  if (params.itemType === 'General Consultation') {
    message += `I would like to enquire about wholesale and retail tool supply for our projects.\n`
  } else {
    message += `I am interested in the following ${params.itemType}:\n`
    message += `*Item*: ${params.itemName}\n`
    if (params.itemSlug) {
      message += `*Ref ID/Slug*: ${params.itemSlug}\n`
    }
  }

  if (params.extraNotes) {
    message += `\n*Note*: ${params.extraNotes}\n`
  }

  message += `\nPlease let me know about current pricing, wholesale discounts, and same-day/standard delivery options. Thank you!`

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
