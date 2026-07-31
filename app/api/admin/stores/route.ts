import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify, slugifyId } from "@/lib/slugify";

export async function POST(req: Request) {
  try {
    // const session = await getSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    // }

    const body = await req.json();
    const {
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      hours = "Mon-Sat: 9:30 AM - 8:30 PM, Sun: 10:00 AM - 2:00 PM",
      isPrimary = false,
    } = body;

    if (
      !name ||
      !address ||
      !phone ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        {
          error: "Name, address, phone, latitude, and longitude are required.",
        },
        { status: 400 },
      );
    }

    const slug = slugify(name);
    const id = slugifyId("store", name);
    const existing = await prisma.storeLocation.findUnique({ where: { id } });
    const finalId = existing ? `${id}-${Date.now().toString().slice(-4)}` : id;

    if (isPrimary) {
      await prisma.storeLocation.updateMany({
        data: { isPrimary: false },
      });
    }

    const store = await prisma.storeLocation.create({
      data: {
        id: finalId,
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        hours: hours.trim(),
        isPrimary: Boolean(isPrimary),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Store branch created successfully.",
      store,
    });
  } catch (error: any) {
    console.error("Create store error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create store branch." },
      { status: 500 },
    );
  }
}
