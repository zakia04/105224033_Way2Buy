
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encryptAddress } from "@/lib/crypto";
import { orderSchema } from "@/lib/schema/order.schema";

type OrderActionResult = {
  success: boolean;
  orderId?: string;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createOrder(
  input: unknown,
): Promise<OrderActionResult> {
  // Validasi data di sisi server menggunakan Zod
  const validation = orderSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Data pesanan tidak valid.",
      errors: validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const body = validation.data;

  try {
    // Periksa apakah produk tersedia
    const product =
      body.product === "custom"
        ? null
        : await prisma.product.findUnique({
            where: { id: body.product },
          });

    if (body.product !== "custom" && !product) {
      return {
        success: false,
        message: "Produk tidak lagi tersedia di basis data.",
      };
    }

    // Enkripsi alamat sebelum disimpan
    const encryptedDestination = encryptAddress(body.destination);

    const orderId = `W2B-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // Simpan pesanan ke PostgreSQL
    await prisma.order.create({
      data: {
        id: orderId,
        customerName: body.name,
        email: body.email,
        phone: body.phone,
        productName: product?.name ?? body.notes.trim(),
        product: product
          ? { connect: { id: product.id } }
          : undefined,
        quantity: Number(body.quantity),
        notes: body.notes,
        destinationCiphertext: encryptedDestination.ciphertext,
        destinationIv: encryptedDestination.iv,
        destinationAuthTag: encryptedDestination.authTag,
      },
    });

    // Perbarui cache halaman yang berkaitan dengan pesanan
    revalidatePath("/admin/pesanan");

    return {
      success: true,
      orderId,
      message: "Permintaan titip berhasil disimpan.",
    };
  } catch (error) {
    console.error("Gagal menyimpan pesanan:", error);

    return {
      success: false,
      message: "Pesanan gagal disimpan. Silakan coba kembali.",
    };
  }
}
