import { NextRequest, NextResponse } from 'next/server'
import { queryProducts } from '@/lib/catalogQueries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await queryProducts({
      q: searchParams.get('q') || undefined,
      brand: searchParams.get('brand') || undefined,
      category: searchParams.get('category') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || 24),
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Catalog products query error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
