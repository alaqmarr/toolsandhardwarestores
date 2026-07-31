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
    const { name, description, image } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 },
      );
    }

    const slug = slugify(name);
    const id = slugifyId("cat", name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existing
      ? `${slug}-${Date.now().toString().slice(-4)}`
      : slug;
    const finalId = existing ? `${id}-${Date.now().toString().slice(-4)}` : id;

    const category = await prisma.category.create({
      data: {
        id: finalId,
        name: name.trim(),
        slug: finalSlug,
        description: description ? description.trim() : null,
        image:
          image ||
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error: any) {
    console.error("Create category error:", error);
    revalidatePath('/', 'layout');
    return NextResponse.json(
      { error: error?.message || "Failed to create category." },
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

    const result = await prisma.category.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} categories.`,
      count: result.count
    })
  } catch (error: any) {
    console.error("Bulk delete categories error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to delete categories." },
      { status: 500 }
    )
  }
}


