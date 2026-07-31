import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import path from 'path'
import fs from 'fs/promises'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function GET(req: NextRequest) {
  try {
    let catalogues = await prisma.resourceCatalogue.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // No dummy resources needed

    return NextResponse.json(catalogues)
  } catch (error: any) {
    console.error('Error fetching resource catalogues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalogues' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const category = formData.get('category') as string | null
    const description = formData.get('description') as string | null

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    let fileUrl = formData.get('fileUrl') as string | null
    let fileSize = '2.4 MB'
    let fileType = 'PDF'

    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = path.extname(file.name) || '.pdf'
      const fileName = `catalogue-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
      fileType = ext.replace('.', '').toUpperCase() || 'PDF'
      fileSize = `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`

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
            ContentType: file.type || 'application/pdf',
          })
        )

        const publicBaseUrl =
          publicUrl?.replace(/\/+$/, '') || `https://pub-${accountId}.r2.dev`
        fileUrl = `${publicBaseUrl}/${fileName}`
      } else {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'catalogues')
        await fs.mkdir(uploadDir, { recursive: true })
        const filePath = path.join(uploadDir, fileName)
        await fs.writeFile(filePath, buffer)
        fileUrl = `/uploads/catalogues/${fileName}`
      }
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Please provide a file or valid file URL' },
        { status: 400 }
      )
    }

    const newCatalogue = await prisma.resourceCatalogue.create({
      data: {
        title,
        category,
        description: description || 'Authorized Industrial Catalogue & Technical Data Sheet',
        fileUrl,
        fileSize,
        fileType,
        isPublic: true,
      },
    })

    return NextResponse.json(newCatalogue, { status: 201 })
  } catch (error: any) {
    console.error('Error creating resource catalogue:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create catalogue' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.resourceCatalogue.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting catalogue:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete catalogue' },
      { status: 500 }
    )
  }
}
