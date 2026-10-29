import { NextRequest, NextResponse } from "next/server";
import { encryptAddress, EncryptedData } from "@/lib/crypto";
import { orderSchema } from "@/lib/schema/order.schema";

export async function POST(request: NextRequest) {
  try {
    const validation = orderSchema.safeParse(await request.json());
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

    // Penerapan Kriptografi: Enkripsi Alamat Pengiriman (Aset D-05) dengan AES-256-GCM
    const encryptedDestination: EncryptedData = encryptAddress(
      body.destination,
    );

    // Bentuk ID pesanan sintetis
    const orderId = `W2B-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      orderId,
      message:
        "Permintaan titip berhasil diproses dan alamat pengiriman telah diamankan dengan AES-256-GCM.",
      order: {
        orderId,
        customerName: body.name,
        product: body.product,
        quantity: Number(body.quantity) || 1,
        // Alamat disimpan dalam bentuk terenkripsi (at-rest & in-transit)
        encryptedDestination,
        protection: {
          algorithm: "aes-256-gcm",
          assetId: "D-05",
          assetName: "Alamat pengiriman konsumen",
          securityObjective:
            "Kerahasiaan dan integritas (Confidentiality & Integrity)",
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses pesanan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
