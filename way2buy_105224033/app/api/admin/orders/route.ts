import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminTokenError, prismaErrorCode } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readJson } from "@/lib/read-json";

const orderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);

export async function GET(request: Request) {
  const tokenError = getAdminTokenError(request);
  if (tokenError) {
    return NextResponse.json(
      { error: tokenError },
      { status: process.env.ADMIN_API_TOKEN ? 401 : 503 },
    );
  }

  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        customerName: true,
        email: true,
        phone: true,
        productName: true,
        quantity: true,
        notes: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    console.error("Gagal membaca pesanan admin:", error);
    return NextResponse.json(
      { error: "Pesanan tidak dapat dibaca." },
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

  const parsed = z
    .object({
      id: z.string().min(1),
      status: orderStatusSchema,
    })
    .safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data status tidak valid." },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
      select: { id: true, status: true, updatedAt: true },
    });
    return NextResponse.json({ order });
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code === "P2025") {
      return NextResponse.json(
        { code, error: "Pesanan tidak ditemukan atau sudah dihapus (P2025)." },
        { status: 404 },
      );
    }

    console.error("Gagal memperbarui status pesanan:", error);
    return NextResponse.json(
      { error: "Status pesanan tidak dapat diperbarui." },
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
      { error: "ID pesanan wajib diisi." },
      { status: 400 },
    );
  }

  try {
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code === "P2025") {
      return NextResponse.json(
        { code, error: "Pesanan tidak ditemukan atau sudah dihapus (P2025)." },
        { status: 404 },
      );
    }

    console.error("Gagal menghapus pesanan:", error);
    return NextResponse.json(
      { error: "Pesanan tidak dapat dihapus." },
      { status: 500 },
    );
  }
}
