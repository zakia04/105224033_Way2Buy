import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/features/system/DatabaseUnavailable";
import { ProductDetail } from "../../../components/features/products/ProductDetail";
import { getProductById } from "../../../lib/data";
import { getPrismaDatabaseError } from "@/lib/prisma-database-error";

interface ProductRouteProps {
  params: Promise<{ id: string }>;
}

export default function ProductRoute(props: ProductRouteProps) {
  return (
    <Suspense fallback={<p>Memuat detail produk...</p>}>
      <ProductData {...props} />
    </Suspense>
  );
}

async function ProductData({ params }: ProductRouteProps) {
  const { id } = await params;
  let product: Awaited<ReturnType<typeof getProductById>>;

  try {
    product = await getProductById(id);
  } catch (error: unknown) {
    const databaseError = getPrismaDatabaseError(error);
    if (!databaseError) {
      throw error;
    }

    console.error("Gagal memuat detail produk:", databaseError.code);
    return <DatabaseUnavailable {...databaseError} />;
  }

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
