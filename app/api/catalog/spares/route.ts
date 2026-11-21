import { NextRequest, NextResponse } from 'next/server'
import { querySpares } from '@/lib/catalogQueries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await querySpares({
      q: searchParams.get('q') || undefined,
      topCat: searchParams.get('topCat') || undefined,
      subCat: searchParams.get('subCat') || undefined,
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || 24),
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Catalog spares query error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch spares' },
      { status: 500 }
    )
  }
}
