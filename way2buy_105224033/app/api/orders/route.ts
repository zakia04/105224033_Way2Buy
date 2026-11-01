import { NextRequest, NextResponse } from "next/server";
import { encryptAddress, EncryptedData } from "@/lib/crypto";
import { prismaErrorCode } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readJson } from "@/lib/read-json";
import { orderSchema } from "@/lib/schema/order.schema";

export async function POST(request: NextRequest) {
  const bodyResult = await readJson(request);
  if (!bodyResult.success) {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  const validation = orderSchema.safeParse(bodyResult.data);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: validation.error.issues[0]?.message ?? "Data pesanan tidak valid.",
        issues: validation.error.issues.map(({ path, message }) => ({
          path,
          message,
        })),
      },
      { status: 400 },
    );
  }

  const body = validation.data;
  try {
    const product =
      body.product === "custom"
        ? null
        : await prisma.product.findUnique({ where: { id: body.product } });
    if (body.product !== "custom" && !product) {
      return NextResponse.json(
        { error: "Produk tidak lagi tersedia di basis data." },
        { status: 404 },
      );
    }

    // Penerapan Kriptografi: Enkripsi Alamat Pengiriman (Aset D-05) dengan AES-256-GCM
    const encryptedDestination: EncryptedData = encryptAddress(
      body.destination,
    );

    const orderId = `W2B-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerName: body.name,
        email: body.email,
        phone: body.phone,
        productName: product?.name ?? body.notes.trim(),
        product: product ? { connect: { id: product.id } } : undefined,
        quantity: Number(body.quantity),
        notes: body.notes,
        destinationCiphertext: encryptedDestination.ciphertext,
        destinationIv: encryptedDestination.iv,
        destinationAuthTag: encryptedDestination.authTag,
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: "Permintaan titip berhasil disimpan.",
      order: {
        orderId,
        customerName: body.name,
        product: body.product,
        quantity: order.quantity,
        encryptedDestination,
        protection: {
          algorithm: "aes-256-gcm",
          assetId: "D-05",
          assetName: "Alamat pengiriman konsumen",
          securityObjective:
            "Kerahasiaan dan integritas (Confidentiality & Integrity)",
        },
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const code = prismaErrorCode(err);
    if (code === "P2002") {
      return NextResponse.json(
        { code, error: "ID pesanan sudah digunakan; silakan kirim ulang." },
        { status: 409 },
      );
    }
    if (code === "P2025" || code === "P2003") {
      return NextResponse.json(
        { code, error: "Produk tidak lagi tersedia; muat ulang katalog." },
        { status: 409 },
      );
    }

    console.error("Gagal menyimpan pesanan:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan pesanan; silakan coba lagi." },
      { status: 500 },
    );
  }
}
