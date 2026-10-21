import { NextRequest, NextResponse } from "next/server";
import { encryptAddress, decryptAddress, EncryptedData } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "encrypt") {
      const { address } = body;
      const result = encryptAddress(address);
      return NextResponse.json({
        success: true,
        action: "encrypt",
        data: result,
        algorithm: "aes-256-gcm",
        keyLengthBits: 256,
        ivLengthBytes: 12,
        authTagLengthBytes: 16,
      });
    }

    if (body.action === "decrypt") {
      const { data } = body;
      const decrypted = decryptAddress(data);
      return NextResponse.json({
        success: true,
        action: "decrypt",
        address: decrypted,
      });
    }

    if (body.action === "simulate_tamper") {
      // Skenario simulasi integritas: memodifikasi 1 byte ciphertext
      const { data } = body as { data: EncryptedData };
      if (!data?.ciphertext) {
        return NextResponse.json(
          {
            error: "Data ciphertext tidak ditemukan untuk simulasi tampering.",
          },
          { status: 400 },
        );
      }

      const buf = Buffer.from(data.ciphertext, "base64");
      if (buf.length > 0) {
        buf[0] = buf[0] ^ 0xff; // flip bit byte pertama
      }
      const tamperedData: EncryptedData = {
        ...data,
        ciphertext: buf.toString("base64"),
      };

      try {
        decryptAddress(tamperedData);
        // Seharusnya tidak pernah sampai sini jika GCM bekerja
        return NextResponse.json({
          tamperDetected: false,
          message:
            "Peringatan: Verifikasi integritas tidak mendeteksi perubahan.",
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Authentication failed";
        return NextResponse.json({
          tamperDetected: true,
          tamperedCiphertext: tamperedData.ciphertext,
          error: errorMsg,
          message:
            "Verifikasi GCM berhasil menggagalkan dekripsi karena integritas data terlanggar (tampering terdeteksi).",
        });
      }
    }

    return NextResponse.json(
      {
        error:
          "Aksi tidak valid. Gunakan 'encrypt', 'decrypt', atau 'simulate_tamper'.",
      },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan pada modul kriptografi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
