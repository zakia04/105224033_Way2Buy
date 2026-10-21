import "server-only";

import { products, type Product } from "./catalog/products";

export function getProductById(id: string): Product | null {
  if (!/^P\d{3}$/.test(id)) {
    return null;
  }

  return products.find((product) => product.id === id) ?? null;
}
