import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // const session = await getSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    // }

    const { id } = await context.params;
    const body = await req.json();
    const { name, description, image } = body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && {
          description: description ? description.trim() : null,
        }),
        ...(image && { image }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: updated,
    });
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update category." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // const session = await getSession();
    // if (!session) {
    //   return NextResponse.json(
    //     { error: "Unauthorized admin access." },
    //     { status: 401 },
    //   );
    // }

    const { id } = await context.params;

    // Ensure no products are attached before deleting
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${productCount} tool(s) are assigned to this category. Please reassign or delete the tools first.`,
        },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete category." },
      { status: 500 },
    );
  }
}
