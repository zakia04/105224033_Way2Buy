import { Suspense } from "react";
import { HomePage } from "../components/features/home/HomePage";
import { DatabaseUnavailable } from "@/components/features/system/DatabaseUnavailable";
import { getPrismaDatabaseError } from "@/lib/prisma-database-error";
import { prisma } from "@/lib/prisma";

export default function HomeRoute() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <HomeData />
    </Suspense>
  );
}

async function loadHomeProducts() {
  try {
    return {
      kind: "success" as const,
      products: await prisma.product.findMany({
        orderBy: { id: "asc" },
        take: 6,
      }),
    };
  } catch (error: unknown) {
    const databaseError = getPrismaDatabaseError(error);
    if (!databaseError) {
      throw error;
    }

    console.error("Gagal memuat produk beranda:", databaseError.code);
    return { kind: "error" as const, databaseError };
  }
}

async function HomeData() {
  const result = await loadHomeProducts();
  if (result.kind === "error") {
    return <DatabaseUnavailable {...result.databaseError} />;
  }

  return <HomePage products={result.products} />;
}
