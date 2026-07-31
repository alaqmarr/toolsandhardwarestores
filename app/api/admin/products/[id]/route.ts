import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
          return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
        }

    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      brandId,
      categoryId,
      description,
      features,
      images,
      videoUrl,
      isFeatured,
      spareIds,
    } = body;

    // Update existing product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(description && { description: description.trim() }),
        ...(features !== undefined && {
          features:
            typeof features === "string" ? features : JSON.stringify(features),
        }),
        ...(images && { images }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(Array.isArray(spareIds) && {
          spares: {
            deleteMany: {},
            create: spareIds.map((spareId: string) => ({
              id: `${id}-${spareId}`,
              spare: { connect: { id: spareId } },
            })),
          },
        }),
      },
      include: {
        brand: true,
        category: true,
        spares: { include: { spare: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: updated,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized admin access." },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete product." },
      { status: 500 },
    );
  }
}
