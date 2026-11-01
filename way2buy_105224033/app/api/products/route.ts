import { NextResponse } from "next/server";
import { getAdminTokenError, prismaErrorCode } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readJson } from "@/lib/read-json";
import { productSchema } from "@/lib/schema/product.schema";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ products });
  } catch (error: unknown) {
    console.error("Gagal membaca katalog produk:", error);
    return NextResponse.json(
      { error: "Katalog tidak dapat dibaca dari basis data." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const tokenError = getAdminTokenError(request);
  if (tokenError) {
    return NextResponse.json(
      { error: tokenError },
      { status: process.env.ADMIN_API_TOKEN ? 401 : 503 },
    );
  }

  const bodyResult = await readJson(request);
  if (!bodyResult.success) {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }
  const parsed = productSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data produk tidak valid." },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code === "P2002") {
      return NextResponse.json(
        { code, error: "Nama produk sudah digunakan (P2002)." },
        { status: 409 },
      );
    }

    console.error("Gagal membuat produk:", error);
    return NextResponse.json(
      { error: "Produk tidak dapat disimpan." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const tokenError = getAdminTokenError(request);
  if (tokenError) {
    return NextResponse.json(
      { error: tokenError },
      { status: process.env.ADMIN_API_TOKEN ? 401 : 503 },
    );
  }

  const bodyResult = await readJson(request);
  if (!bodyResult.success) {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }
  const parsed = productSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data produk tidak valid." },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id: parsed.data.id },
      data: parsed.data,
    });
    return NextResponse.json({ product });
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code === "P2025") {
      return NextResponse.json(
        { code, error: "Produk tidak ditemukan atau sudah dihapus (P2025)." },
        { status: 404 },
      );
    }
    if (code === "P2002") {
      return NextResponse.json(
        { code, error: "Nama produk sudah digunakan (P2002)." },
        { status: 409 },
      );
    }

    console.error("Gagal memperbarui produk:", error);
    return NextResponse.json(
      { error: "Produk tidak dapat diperbarui." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const tokenError = getAdminTokenError(request);
  if (tokenError) {
    return NextResponse.json(
      { error: tokenError },
      { status: process.env.ADMIN_API_TOKEN ? 401 : 503 },
    );
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID produk wajib diisi." },
      { status: 400 },
    );
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code === "P2025") {
      return NextResponse.json(
        { code, error: "Produk tidak ditemukan atau sudah dihapus (P2025)." },
        { status: 404 },
      );
    }
    if (code === "P2003") {
      return NextResponse.json(
        {
          code,
          error: "Produk masih dipakai pesanan dan tidak dapat dihapus (RESTRICT).",
        },
        { status: 409 },
      );
    }

    console.error("Gagal menghapus produk:", error);
    return NextResponse.json(
      { error: "Produk tidak dapat dihapus." },
      { status: 500 },
    );
  }
}
