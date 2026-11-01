import "server-only";

import { prisma } from "./prisma";
import type { Product } from "./catalog/products";

export async function getProductById(id: string): Promise<Product | null> {
  if (!/^P\d{3,}$/.test(id)) {
    return null;
  }

  return prisma.product.findUnique({ where: { id } });
}
