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
    const {
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      hours,
      isPrimary,
    } = body;

    if (isPrimary) {
      await prisma.storeLocation.updateMany({
        where: { id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.storeLocation.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(address && { address: address.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(email !== undefined && { email: email ? email.trim() : null }),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
        ...(hours && { hours: hours.trim() }),
        ...(isPrimary !== undefined && { isPrimary: Boolean(isPrimary) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Store branch updated successfully.",
      store: updated,
    });
  } catch (error: any) {
    console.error("Update store error:", error);
    revalidatePath('/', 'layout');
    return NextResponse.json(
      { error: error?.message || "Failed to update store branch." },
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

    await prisma.storeLocation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Store branch deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete store error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete store branch." },
      { status: 500 },
    );
  }
}
