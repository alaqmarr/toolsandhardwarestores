import { revalidatePath } from 'next/cache';
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
          revalidatePath('/', 'layout');
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
        }

    const { id } = await context.params;
    const body = await req.json();
    const { name, image, description, isCore, isSpecialty } = body;

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(image && { image }),
        ...(description !== undefined && {
          description: description ? description.trim() : null,
        }),
        ...(isCore !== undefined && { isCore: Boolean(isCore) }),
        ...(isSpecialty !== undefined && { isSpecialty: Boolean(isSpecialty) }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully.",
      brand: updated,
    });
  } catch (error: any) {
    console.error("Update brand error:", error);
    revalidatePath('/', 'layout');
    return NextResponse.json(
      { error: error?.message || "Failed to update brand." },
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
    //   return NextResponse.json(
    //     { error: "Unauthorized admin access." },
    //     { status: 401 },
    //   );
        }

    const { id } = await context.params;

    const productCount = await prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand: ${productCount} tool(s) are assigned to this brand. Please reassign or delete the tools first.`,
        },
        { status: 400 },
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete brand error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete brand." },
      { status: 500 },
    );
  }
}
