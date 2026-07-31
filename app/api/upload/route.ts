import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/db'
import path from 'path'
import fs from 'fs/promises'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name) || '.jpg'
    const fileName = `tools-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`

    // Fetch settings to check DB config as fallback
    const settings = await prisma.contactSetting.findUnique({
      where: { id: 'settings-main' },
    })

    const accountId = process.env.R2_ACCOUNT_ID || settings?.r2AccountId
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || settings?.r2AccessKeyId
    const secretAccessKey =
      process.env.R2_SECRET_ACCESS_KEY ||
      process.env.R2_SECRET_KEY ||
      settings?.r2SecretKey
    const bucketName =
      process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || settings?.r2Bucket
    const publicUrl = process.env.R2_PUBLIC_URL || settings?.r2PublicUrl

    const useR2 = accountId && accessKeyId && secretAccessKey && bucketName

    if (useR2) {
      // Upload to Cloudflare R2
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
      })

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName!,
          Key: fileName,
          Body: buffer,
          ContentType: file.type || 'application/octet-stream',
        })
      )

      const publicBaseUrl =
        publicUrl?.replace(/\/+$/, '') ||
        `https://pub-${accountId}.r2.dev`
      const fileUrl = `${publicBaseUrl}/${fileName}`

      return NextResponse.json({ url: fileUrl, mode: 'r2' })
    } else {
      // Fallback: Upload locally to /public/uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, fileName)
      await fs.writeFile(filePath, buffer)

      const fileUrl = `/uploads/${fileName}`
      return NextResponse.json({ url: fileUrl, mode: 'local' })
    }
  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
