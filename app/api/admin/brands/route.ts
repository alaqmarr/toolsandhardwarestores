import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify, slugifyId } from '@/lib/slugify'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      image,
      description,
      isCore = true,
      isSpecialty = false,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Brand name is required.' },
        { status: 400 }
      )
    }

    const slug = slugify(name)
    const id = slugifyId('brand', name)

    const existing = await prisma.brand.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug
    const finalId = existing ? `${id}-${Date.now().toString().slice(-4)}` : id

    const brand = await prisma.brand.create({
      data: {
        id: finalId,
        name: name.trim(),
        slug: finalSlug,
        image:
          image ||
          'https://images.unsplash.com/photo-1541888946425-d0ebb18086f6?q=80&w=800&auto=format&fit=crop',
        description: description?.trim() || null,
        isCore: Boolean(isCore),
        isSpecialty: Boolean(isSpecialty),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Brand created successfully.',
      brand,
    })
  } catch (error: any) {
    console.error('Create brand error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create brand.' },
      { status: 500 }
    )
  }
}
