import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/features/products/ProductDetail";
import { products } from "../../../lib/catalog/products";
import { getProductById } from "../../../lib/data";

interface ProductRouteProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
