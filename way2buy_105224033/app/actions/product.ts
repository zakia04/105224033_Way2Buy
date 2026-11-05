
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/schema/product.schema";
import { verifyAdminToken } from "@/lib/admin-api";

type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

function authorize(token: string): ActionResult | null {
  const error = verifyAdminToken(token);

  if (error) {
    return {
      success: false,
      message: error,
    };
  }

  return null;
}

export async function createProduct(
  token: string,
  input: unknown,
): Promise<ActionResult> {
  const denied = authorize(token);
  if (denied) return denied;

  const validation = productSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Data produk tidak valid.",
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.product.create({ data: validation.data });

    revalidatePath("/produk");
    revalidatePath("/admin/produk");

    return { success: true, message: "Produk berhasil ditambahkan." };
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    return {
      success: false,
      message: "Produk gagal ditambahkan. Periksa ID dan nama produk.",
    };
  }
}

export async function updateProduct(
  token: string,
  input: unknown,
): Promise<ActionResult> {
  const denied = authorize(token);
  if (denied) return denied;

  const validation = productSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Data produk tidak valid.",
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.product.update({
      where: { id: validation.data.id },
      data: validation.data,
    });

    revalidatePath("/produk");
    revalidatePath(`/produk/${validation.data.id}`);
    revalidatePath("/admin/produk");

    return { success: true, message: "Produk berhasil diperbarui." };
  } catch (error) {
    console.error("Gagal memperbarui produk:", error);
    return {
      success: false,
      message: "Produk gagal diperbarui atau tidak ditemukan.",
    };
  }
}

export async function deleteProduct(
  token: string,
  id: string,
): Promise<ActionResult> {
  const denied = authorize(token);
  if (denied) return denied;

  if (typeof id !== "string" || !/^P\d{3,}$/.test(id)) {
    return { success: false, message: "ID produk tidak valid." };
  }

  try {
    await prisma.product.delete({ where: { id } });

    revalidatePath("/produk");
    revalidatePath("/admin/produk");

    return { success: true, message: "Produk berhasil dihapus." };
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return {
      success: false,
      message: "Produk tidak dapat dihapus. Periksa apakah produk masih memiliki pesanan.",
    };
  }
}
