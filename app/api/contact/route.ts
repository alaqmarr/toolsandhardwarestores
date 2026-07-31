import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Fetch dynamic SMTP settings from database
    const settings = await prisma.contactSetting.findUnique({
      where: { id: 'settings-main' },
    })

    const smtpHost = settings?.smtpHost || 'smtp.gmail.com'
    const smtpPort = settings?.smtpPort || 587
    const smtpUser = settings?.smtpUser || ''
    const smtpPass = settings?.smtpPass || ''
    const targetEmail = settings?.primaryEmail || 'info@toolsandhardwarestores.com'

    // If SMTP credentials are present, send real email via Nodemailer
    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const mailOptions = {
        from: `"${name}" <${smtpUser}>`,
        replyTo: email,
        to: targetEmail,
        subject: `[Website Inquiry] ${subject || 'New Contact Form Submission'} - ${name}`,
        html: `
          <div style="font-family: sans-serif; color: #111; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #f59e0b; margin-top: 0;">New Inquiry: Tools & Hardware Stores</h2>
            <p><strong>Sender Name:</strong> ${name}</p>
            <p><strong>Sender Email:</strong> ${email}</p>
            <p><strong>Phone / WhatsApp:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <h3 style="margin-bottom: 8px;">Message:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f59e0b; white-space: pre-wrap;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">This email was sent via the contact form on Tools & Hardware Stores (Ranigunj HQ) Website.</p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)

      return NextResponse.json({
        success: true,
        message: 'Your email inquiry has been dispatched to our sales team!',
      })
    } else {
      // If SMTP is not yet configured by admin, log nicely and simulate success so user is not blocked
      console.log('--- SIMULATED NODEMAILER DISPATCH (SMTP Credentials Not Set in DB) ---')
      console.log({ name, email, phone, subject, message, targetEmail })
      console.log('-----------------------------------------------------------------------')

      return NextResponse.json({
        success: true,
        message:
          'Inquiry received! (Note: SMTP credentials can be configured in Admin Dashboard -> Settings for live Gmail dispatch).',
      })
    }
  } catch (error: any) {
    console.error('Nodemailer Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch email' },
      { status: 500 }
    )
  }
}
