import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { products } from "../lib/catalog/products";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL harus diatur untuk menjalankan seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: product,
      update: product,
    });
  }

  console.log(`Seed berhasil: ${products.length} produk disinkronkan.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
