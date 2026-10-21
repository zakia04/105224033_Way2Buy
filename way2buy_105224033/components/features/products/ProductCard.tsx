import Link from "next/link";
import type { Product } from "../../../lib/catalog/products";
import { formatPrice } from "../../../lib/catalog/products";
import { ProductArtwork } from "./ProductArtwork";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <ProductArtwork className="product-card__image" product={product} />
        <span className="product-card__category">{product.category}</span>
        <span
          aria-label={`Rating ${product.rating} dari 5`}
          className="product-card__rating"
        >
          <span aria-hidden="true">★</span> {product.rating.toFixed(1)}
        </span>
      </div>
      <div className="product-card__body">
        <p className="product-card__origin">
          <span aria-hidden="true">↗</span> {product.origin}
        </p>
        <h3>
          <Link href={`/produk/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__description line-clamp-2">
          {product.description}
        </p>
        <div className="product-card__bottom">
          <div>
            <span className="product-card__price-label">Mulai dari</span>
            <p className="product-card__price">{formatPrice(product.price)}</p>
          </div>
          <Link
            aria-label={`Titip ${product.name}`}
            className="product-card__link"
            href="/titip"
          >
            Titip <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
