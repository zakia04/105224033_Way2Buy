import { NextRequest, NextResponse } from "next/server";
import { encryptAddress, EncryptedData } from "@/lib/crypto";

interface OrderPayload {
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  destination: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderPayload = await request.json();

    // Validasi dasar server-side (Mitigasi T-03: Tampering parameter pesanan)
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama minimal 2 karakter." },
        { status: 400 },
      );
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Alamat email tidak valid." },
        { status: 400 },
      );
    }
    if (!body.destination || body.destination.trim().length < 3) {
      return NextResponse.json(
        { error: "Kota tujuan pengiriman harus diisi." },
        { status: 400 },
      );
    }

    // Penerapan Kriptografi: Enkripsi Alamat Pengiriman (Aset D-05) dengan AES-256-GCM
    const encryptedDestination: EncryptedData = encryptAddress(
      body.destination.trim(),
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
        customerName: body.name.trim(),
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
