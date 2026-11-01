import { Suspense } from "react";
import { DatabaseUnavailable } from "@/components/features/system/DatabaseUnavailable";
import { getPrismaDatabaseError } from "@/lib/prisma-database-error";
import { ProductsPage } from "../../components/features/products/ProductsPage";
import { prisma } from "@/lib/prisma";

export default function ProductsRoute() {
  return (
    <Suspense fallback={<p>Memuat katalog...</p>}>
      <ProductsData />
    </Suspense>
  );
}

async function loadProducts() {
  try {
    return {
      kind: "success" as const,
      products: await prisma.product.findMany({ orderBy: { id: "asc" } }),
    };
  } catch (error: unknown) {
    const databaseError = getPrismaDatabaseError(error);
    if (!databaseError) {
      throw error;
    }

    console.error("Gagal memuat katalog:", databaseError.code);
    return { kind: "error" as const, databaseError };
  }
}

async function ProductsData() {
  const result = await loadProducts();
  if (result.kind === "error") {
    return <DatabaseUnavailable {...result.databaseError} />;
  }

  return <ProductsPage products={result.products} />;
}
