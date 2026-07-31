import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.set('test_cookie', '123', { httpOnly: true, path: '/' })
  return NextResponse.json({ success: true })
}