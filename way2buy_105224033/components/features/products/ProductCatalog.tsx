"use client";

import { useMemo, useState } from "react";
import { categories, products } from "../../../lib/catalog/products";
import { ProductCard } from "./ProductCard";

export function ProductCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Semua");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return products.filter((product) => {
      const matchesQuery =
        product.name.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
        product.origin.toLocaleLowerCase("id-ID").includes(normalizedQuery);
      return (
        matchesQuery && (category === "Semua" || product.category === category)
      );
    });
  }, [category, query]);

  return (
    <>
      <h2 className="catalog-heading" id="product-list-heading">
        Produk untuk dijelajahi
      </h2>
      <div className="catalog-controls">
        <div className="field catalog-search">
          <label htmlFor="product-search">Cari produk atau daerah</label>
          <div className="search-input-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              autoComplete="off"
              id="product-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Misalnya: kopi, Yogyakarta..."
              type="search"
              value={query}
            />
          </div>
        </div>
        <div
          aria-label="Filter kategori produk"
          className="category-list"
          role="group"
        >
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              className={`category-chip${category === item ? " category-chip--active" : ""}`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p aria-live="polite" className="catalog-count">
        Menampilkan <strong>{filteredProducts.length}</strong> dari{" "}
        {products.length} produk
      </p>
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>Belum ada produk yang cocok</h2>
          <p>Coba kata kunci lain atau pilih kategori yang berbeda.</p>
          <button
            className="button button--outline"
            onClick={() => {
              setQuery("");
              setCategory("Semua");
            }}
            type="button"
          >
            Hapus filter
          </button>
        </div>
      )}
    </>
  );
}
