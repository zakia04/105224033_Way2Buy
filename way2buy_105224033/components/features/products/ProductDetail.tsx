import Link from "next/link";
import { formatPrice, type Product } from "../../../lib/catalog/products";
import { SiteFooter } from "../../layout/SiteFooter";
import { SiteHeader } from "../../layout/SiteHeader";
import { ProductArtwork } from "./ProductArtwork";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <SiteHeader activePath="/produk" />
      <main className="page-main" id="main-content">
        <div className="breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <Link href="/produk">Jelajahi produk</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </div>
        <article className="product-detail">
          <ProductArtwork
            className="product-detail__artwork"
            product={product}
          />
          <div className="product-detail__content">
            <span className="eyebrow">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="product-card__origin">
              <span aria-hidden="true">↗</span> {product.origin}
            </p>
            <p
              aria-label={`Rating ${product.rating} dari 5`}
              className="product-detail__rating"
            >
              <span aria-hidden="true">★</span> {product.rating.toFixed(1)}
            </p>
            <p>{product.description}</p>
            <p className="product-detail__price">{formatPrice(product.price)}</p>
            <Link className="button" href="/titip">
              Titip produk ini <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
