import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth'
import { slugifyId } from '@/lib/slugify'

export async function POST(req: Request) {
  try {
    const adminCount = await prisma.admin.count()
    if (adminCount > 0) {
      return NextResponse.json(
        { error: 'Administrator accounts already exist. Initial setup is locked.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const id = slugifyId('admin', email)
    const passwordHash = await hashPassword(password)

    const newAdmin = await prisma.admin.create({
      data: {
        id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
      },
    })

    const token = await signToken({
      adminId: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
    })

    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      message: 'First administrator registered successfully.',
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize setup.' },
      { status: 500 }
    )
  }
}
