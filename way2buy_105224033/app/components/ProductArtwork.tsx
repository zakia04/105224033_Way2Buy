import type { Product } from "../data/products";

export function ProductArtwork({ product, className }: { product: Product; className: string }) {
  return (
    <div
      aria-label={`Ilustrasi ${product.name}`}
      className={`product-art product-art--${product.id.toLowerCase()} ${className}`}
      role="img"
    >
      <span aria-hidden="true" className="product-art__icon">{product.illustration}</span>
      <span aria-hidden="true" className="product-art__caption">{product.origin.split(",")[0]}</span>
    </div>
  );
}
