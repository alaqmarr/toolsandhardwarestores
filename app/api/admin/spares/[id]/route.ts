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
    const {
      name,
      spareCategoryId,
      description,
      images,
      priceNote,
      productIds,
    } = body;

    const updated = await prisma.spare.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(spareCategoryId && { spareCategoryId }),
        ...(description !== undefined && {
          description: description ? description.trim() : null,
        }),
        ...(images && { images }),
        ...(priceNote !== undefined && {
          priceNote: priceNote ? priceNote.trim() : null,
        }),
        ...(Array.isArray(productIds) && {
          products: {
            deleteMany: {},
            create: productIds.map((productId: string) => ({
              id: `${productId}-${id}`,
              product: { connect: { id: productId } },
            })),
          },
        }),
      },
      include: {
        spareCategory: true,
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Spare part updated successfully.",
      spare: updated,
    });
  } catch (error: any) {
    console.error("Update spare error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update spare part." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // const session = await getSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    // }

    const { id } = await context.params;

    await prisma.spare.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Spare part deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete spare error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete spare part." },
      { status: 500 },
    );
  }
}
