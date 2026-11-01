import { Suspense } from "react";
import { DatabaseUnavailable } from "@/components/features/system/DatabaseUnavailable";
import { getPrismaDatabaseError } from "@/lib/prisma-database-error";
import { RequestPage } from "../../components/features/requests/RequestPage";
import { prisma } from "@/lib/prisma";

export default function RequestRoute() {
  return (
    <Suspense fallback={<p>Memuat formulir...</p>}>
      <RequestData />
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

    console.error("Gagal memuat produk untuk formulir:", databaseError.code);
    return { kind: "error" as const, databaseError };
  }
}

async function RequestData() {
  const result = await loadProducts();
  if (result.kind === "error") {
    return <DatabaseUnavailable {...result.databaseError} />;
  }

  return <RequestPage products={result.products} />;
}
