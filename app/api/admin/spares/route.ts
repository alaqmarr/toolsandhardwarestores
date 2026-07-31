import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify, slugifyId } from "@/lib/slugify";

export async function POST(req: Request) {
  try {
const session = await getSession()
if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    }
    const body = await req.json();
    const {
      name,
      spareCategoryId,
      description,
      images,
      priceNote = "Wholesale Bulk & Retail Availability",
      productIds = [],
    } = body;

    if (!name || !spareCategoryId) {
      return NextResponse.json(
        { error: "Spare part name and category are required." },
        { status: 400 },
      );
    }

    const slug = slugify(name);
    const id = slugifyId("spare", name);

    const existing = await prisma.spare.findUnique({ where: { slug } });
    const finalSlug = existing
      ? `${slug}-${Date.now().toString().slice(-4)}`
      : slug;
    const finalId = existing ? `${id}-${Date.now().toString().slice(-4)}` : id;

    const spare = await prisma.spare.create({
      data: {
        id: finalId,
        name: name.trim(),
        slug: finalSlug,
        spareCategoryId,
        description: description?.trim() || null,
        images:
          images ||
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
        priceNote: priceNote?.trim() || "Wholesale Bulk & Retail Availability",
        products: {
          create: Array.isArray(productIds)
            ? productIds.map((productId: string) => ({
                id: `${productId}-${finalId}`,
                product: { connect: { id: productId } },
              }))
            : [],
        },
      },
      include: {
        spareCategory: true,
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Spare part created successfully.",
      spare,
    });
  } catch (error: any) {
    console.error("Create spare error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create spare part." },
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

    const result = await prisma.spare.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} spares.`,
      count: result.count
    })
  } catch (error: any) {
    console.error("Bulk delete spares error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to delete spares." },
      { status: 500 }
    )
  }
}


