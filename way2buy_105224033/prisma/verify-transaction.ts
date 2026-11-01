import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { prismaErrorCode } from "../lib/admin-api";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL harus diatur untuk menguji transaksi.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const nonTransactionalProductId = `N${suffix}`.slice(0, 24);
  const nonTransactionalOrderId = `NO-TX-${suffix}`;
  const transactionalProductId = `T${suffix}`.slice(0, 24);
  const transactionalOrderId = `ROLLBACK-${suffix}`;

  await prisma.product.create({
    data: {
      id: nonTransactionalProductId,
      name: `No transaction ${suffix}`,
      category: "Makanan",
      origin: "Test lokal",
      price: 1,
      rating: 0,
      illustration: "T",
      description: "Data uji tanpa transaksi.",
    },
  });
  await prisma.order.create({
    data: {
      id: nonTransactionalOrderId,
      customerName: "Pengujian",
      email: "no-transaction@example.invalid",
      phone: "08123456789",
      productName: `No transaction ${suffix}`,
      product: { connect: { id: nonTransactionalProductId } },
      quantity: 1,
      notes: "",
      destinationCiphertext: "ciphertext-test",
      destinationIv: "iv-test",
      destinationAuthTag: "tag-test",
    },
  });

  try {
    await prisma.product.delete({ where: { id: nonTransactionalProductId } });
    throw new Error("Penghapusan seharusnya ditolak oleh RESTRICT.");
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code !== "P2003") {
      throw error;
    }
    const productAfterFailure = await prisma.product.findUnique({
      where: { id: nonTransactionalProductId },
      select: { id: true },
    });
    const orderAfterFailure = await prisma.order.findUnique({
      where: { id: nonTransactionalOrderId },
      select: { id: true },
    });
    if (!productAfterFailure || !orderAfterFailure) {
      throw new Error("Data seharusnya tetap ada setelah gagal tanpa transaksi.");
    }
    console.log("TANPA TRANSAKSI: P2003; product=true, order=true.");
  }

  await prisma.order.delete({ where: { id: nonTransactionalOrderId } });
  await prisma.product.delete({ where: { id: nonTransactionalProductId } });

  const productBefore = await prisma.product.findUnique({
    where: { id: transactionalProductId },
    select: { id: true },
  });
  const orderBefore = await prisma.order.findUnique({
    where: { id: transactionalOrderId },
    select: { id: true },
  });

  if (productBefore || orderBefore) {
    throw new Error("ID verifikasi transaksi bertabrakan dengan data yang ada.");
  }
  console.log("TRANSAKSI SEBELUM: product=false, order=false");

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.product.create({
        data: {
          id: transactionalProductId,
          name: `Rollback probe ${suffix}`,
          category: "Makanan",
          origin: "Test lokal",
          price: 1,
          rating: 0,
          illustration: "T",
          description: "Data uji rollback.",
        },
      });
      await transaction.order.create({
        data: {
          id: transactionalOrderId,
          customerName: "Pengujian",
          email: "rollback@example.invalid",
          phone: "08123456789",
          productName: `Rollback probe ${suffix}`,
          product: { connect: { id: transactionalProductId } },
          quantity: 1,
          notes: "",
          destinationCiphertext: "ciphertext-test",
          destinationIv: "iv-test",
          destinationAuthTag: "tag-test",
        },
      });
      await transaction.product.delete({
        where: { id: transactionalProductId },
      });
    });
    throw new Error("Penghapusan seharusnya ditolak oleh RESTRICT.");
  } catch (error: unknown) {
    const code = prismaErrorCode(error);
    if (code !== "P2003") {
      throw error;
    }
    console.log("GALAT: P2003 (foreign key RESTRICT); transaksi dibatalkan.");
  }

  const productAfter = await prisma.product.findUnique({
    where: { id: transactionalProductId },
    select: { id: true },
  });
  const orderAfter = await prisma.order.findUnique({
    where: { id: transactionalOrderId },
    select: { id: true },
  });

  console.log(
    `TRANSAKSI SESUDAH: product=${Boolean(productAfter)}, order=${Boolean(orderAfter)}`,
  );
  if (productAfter || orderAfter) {
    throw new Error("Rollback tidak memulihkan keadaan sebelum transaksi.");
  }
}

main()
  .catch((error: unknown) => {
    console.error("Verifikasi transaksi gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
