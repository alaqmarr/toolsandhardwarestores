import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, admin.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const token = await signToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    })

    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error?.message || 'Login request failed.' },
      { status: 500 }
    )
  }
}
