import { revalidatePath } from 'next/cache';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify, slugifyId } from "@/lib/slugify";

export async function POST(req: Request) {
  try {
const session = await getSession()
if (!session) {
      revalidatePath('/', 'layout');
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    }
    const body = await req.json();
    const {
      name,
      brandId,
      categoryId,
      description,
      features = "[]",
      images,
      videoUrl,
      isFeatured = false,
      spareIds = [],
    } = body;

    if (!name || !brandId || !categoryId || !description) {
      return NextResponse.json(
        { error: "Name, brand, category, and description are required." },
        { status: 400 },
      );
    }

    const slug = slugify(name);
    const id = slugifyId("tool", name);

    // Ensure slug doesn't collide
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing
      ? `${slug}-${Date.now().toString().slice(-4)}`
      : slug;
    const finalId = existing ? `${id}-${Date.now().toString().slice(-4)}` : id;

    const product = await prisma.product.create({
      data: {
        id: finalId,
        name: name.trim(),
        slug: finalSlug,
        brandId,
        categoryId,
        description: description.trim(),
        features:
          typeof features === "string" ? features : JSON.stringify(features),
        images:
          images ||
          "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop",
        videoUrl: videoUrl || null,
        isFeatured: Boolean(isFeatured),
        spares: {
          create: Array.isArray(spareIds)
            ? spareIds.map((spareId: string) => ({
                id: `${finalId}-${spareId}`,
                spare: { connect: { id: spareId } },
              }))
            : [],
        },
      },
      include: {
        brand: true,
        category: true,
        spares: { include: { spare: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    revalidatePath('/', 'layout');
    return NextResponse.json(
      { error: error?.message || "Failed to create product." },
      { status: 500 },
    );
  }}

export async function DELETE(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    }

    const body = await req.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided." }, { status: 400 })
    }

    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} products.`,
      count: result.count
    })
  } catch (error: any) {
    console.error("Bulk delete products error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to delete products." },
      { status: 500 }
    )
  }
}


