import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
const session = await getSession()
if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 })
    }
    const body = await req.json();
    const {
      primaryPhone = "+91 98854 16452",
      whatsappNumber = "919885416452",
      primaryEmail = "sales@toolsandhardwarestores.com",
      supportEmail = "support@toolsandhardwarestores.com",
      addressText = "5-5, 187/2, Victoria Ranigunj, Old Ghasmandi, Ranigunj, Secunderabad, Telangana 500003",
      mapEmbedUrl,
      smtpHost = "smtp.gmail.com",
      smtpPort = 465,
      smtpUser,
      smtpPass,
      r2Bucket,
      r2AccountId,
      r2AccessKeyId,
      r2SecretKey,
      r2PublicUrl,
    } = body;

    const updated = await prisma.contactSetting.upsert({
      where: { id: "settings-main" },
      update: {
        primaryPhone: primaryPhone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        primaryEmail: primaryEmail.trim(),
        supportEmail: supportEmail ? supportEmail.trim() : null,
        addressText: addressText.trim(),
        mapEmbedUrl: mapEmbedUrl ? mapEmbedUrl.trim() : null,
        smtpHost: smtpHost ? smtpHost.trim() : null,
        smtpPort: smtpPort ? Number(smtpPort) : null,
        smtpUser: smtpUser ? smtpUser.trim() : null,
        smtpPass: smtpPass ? smtpPass.trim() : null,
        r2Bucket: r2Bucket ? r2Bucket.trim() : null,
        r2AccountId: r2AccountId ? r2AccountId.trim() : null,
        r2AccessKeyId: r2AccessKeyId ? r2AccessKeyId.trim() : null,
        r2SecretKey: r2SecretKey ? r2SecretKey.trim() : null,
        r2PublicUrl: r2PublicUrl ? r2PublicUrl.trim() : null,
      },
      create: {
        id: "settings-main",
        primaryPhone: primaryPhone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        primaryEmail: primaryEmail.trim(),
        supportEmail: supportEmail ? supportEmail.trim() : null,
        addressText: addressText.trim(),
        mapEmbedUrl: mapEmbedUrl ? mapEmbedUrl.trim() : null,
        smtpHost: smtpHost ? smtpHost.trim() : null,
        smtpPort: smtpPort ? Number(smtpPort) : null,
        smtpUser: smtpUser ? smtpUser.trim() : null,
        smtpPass: smtpPass ? smtpPass.trim() : null,
        r2Bucket: r2Bucket ? r2Bucket.trim() : null,
        r2AccountId: r2AccountId ? r2AccountId.trim() : null,
        r2AccessKeyId: r2AccessKeyId ? r2AccessKeyId.trim() : null,
        r2SecretKey: r2SecretKey ? r2SecretKey.trim() : null,
        r2PublicUrl: r2PublicUrl ? r2PublicUrl.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Portal settings updated successfully.",
      settings: updated,
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update portal settings." },
      { status: 500 },
    );
  }
}

