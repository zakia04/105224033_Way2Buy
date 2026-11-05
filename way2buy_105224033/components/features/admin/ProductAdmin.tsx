
"use client";

import {
  createProduct,
  updateProduct,
  deleteProduct as deleteProductAction,
} from "@/app/actions/product";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface ProductRecord {
  id: string;
  name: string;
  category: string;
  origin: string;
  price: number;
  rating: number;
  illustration: string;
  description: string;
}

type ProductForm = Omit<ProductRecord, "price" | "rating"> & {
  price: string;
  rating: string;
};

const emptyProduct: ProductForm = {
  id: "",
  name: "",
  category: "Makanan",
  origin: "",
  price: "",
  rating: "5",
  illustration: "",
  description: "",
};

function isProductList(
  value: unknown,
): value is { products: ProductRecord[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "products" in value &&
    Array.isArray(value.products)
  );
}

function responseError(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return null;
}

async function fetchProducts(): Promise<ProductRecord[]> {
  const response = await fetch("/api/products", {
    cache: "no-store",
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(responseError(data) ?? "Katalog gagal dimuat.");
  }

  if (!isProductList(data)) {
    throw new Error("Respons katalog tidak sesuai format.");
  }

  return data.products;
}

export function ProductAdmin() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [token, setToken] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchProducts()
      .then((loadedProducts) => {
        if (active) {
          setProducts(loadedProducts);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Katalog gagal dimuat.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshProducts() {
    setLoading(true);
    setError(null);

    try {
      const loadedProducts = await fetchProducts();
      setProducts(loadedProducts);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Katalog gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product: ProductRecord) {
    setEditing(true);

    setForm({
      ...product,
      price: String(product.price),
      rating: String(product.rating),
    });

    setNotice(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(false);
    setForm(emptyProduct);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError(null);
  setNotice(null);
  setSaving(true);

  try {
    const input = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating),
    };

    const result = editing
      ? await updateProduct(token, input)
      : await createProduct(token, input);

    if (!result.success) {
      throw new Error(result.message);
    }

    setNotice(result.message);
    resetForm();
    await refreshProducts();
  } catch (caught: unknown) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Perubahan produk gagal.",
    );
  } finally {
    setSaving(false);
  }
}

 async function deleteProduct(id: string) {
  if (!window.confirm(`Hapus produk ${id}?`)) {
    return;
  }

  setError(null);
  setNotice(null);

  try {
    const result = await deleteProductAction(token, id);

    if (!result.success) {
      throw new Error(result.message);
    }

    setNotice(result.message);

    if (form.id === id) {
      resetForm();
    }

    await refreshProducts();
  } catch (caught: unknown) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Produk gagal dihapus.",
    );
  }
}

  const averageRating =
    products.length > 0
      ? (
          products.reduce((total, product) => total + product.rating, 0) /
          products.length
        ).toFixed(1)
      : "0.0";

  const categoryCount = new Set(
    products.map((product) => product.category),
  ).size;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              WAY2BUY / MANAGEMENT
            </span>

            <h1>Administrasi Produk</h1>

            <p>
              Kelola katalog produk Way2Buy melalui dashboard
              administrasi.
            </p>
          </div>

          <Link href="/" className="admin-back-link">
            ← Kembali ke halaman utama
          </Link>
        </header>

        <section className="admin-stats">
          <article className="admin-stat-card">
            <span>Total Produk</span>
            <strong>{loading ? "..." : products.length}</strong>
            <small>Produk dalam katalog</small>
          </article>

          <article className="admin-stat-card">
            <span>Kategori</span>
            <strong>{loading ? "..." : categoryCount}</strong>
            <small>Kategori produk tersedia</small>
          </article>

          <article className="admin-stat-card">
            <span>Rata-rata Rating</span>
            <strong>{loading ? "..." : averageRating}</strong>
            <small>Dari skala 0 sampai 5</small>
          </article>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Keamanan Administrasi</h2>
              <p>
                Masukkan token admin untuk mengelola data produk.
                Token tidak disimpan oleh halaman ini.
              </p>
            </div>

            <div className="admin-lock-icon" aria-hidden="true">
              🔒
            </div>
          </div>

          <label className="admin-label" htmlFor="admin-token">
            Token Admin
          </label>

          <input
            className="admin-input"
            autoComplete="off"
            id="admin-token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Masukkan token admin"
            type="password"
            value={token}
          />

          <small className="admin-helper">
            Token digunakan untuk autentikasi ketika menambah,
            memperbarui, atau menghapus produk.
          </small>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">
                PRODUCT MANAGEMENT
              </span>

              <h2>
                {editing ? "Perbarui Produk" : "Tambah Produk Baru"}
              </h2>

              <p>
                Lengkapi informasi produk pada formulir berikut.
              </p>
            </div>

            <div className="admin-form-number">
              {editing ? "EDIT" : "01"}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label className="admin-label" htmlFor="product-id">
                  ID Produk
                </label>

                <input
                  className="admin-input"
                  id="product-id"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      id: event.target.value,
                    }))
                  }
                  placeholder="Contoh: P007"
                  readOnly={editing}
                  required
                  value={form.id}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="product-name">
                  Nama Produk
                </label>

                <input
                  className="admin-input"
                  id="product-name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nama produk"
                  required
                  value={form.name}
                />
              </div>

              <div className="admin-field">
                <label
                  className="admin-label"
                  htmlFor="product-category"
                >
                  Kategori
                </label>

                <select
                  className="admin-input"
                  id="product-category"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  value={form.category}
                >
                  <option>Makanan</option>
                  <option>Fashion</option>
                  <option>Minuman</option>
                  <option>Oleh-oleh</option>
                </select>
              </div>

              <div className="admin-field">
                <label
                  className="admin-label"
                  htmlFor="product-origin"
                >
                  Asal Produk
                </label>

                <input
                  className="admin-input"
                  id="product-origin"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      origin: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Bandung, Jawa Barat"
                  required
                  value={form.origin}
                />
              </div>

              <div className="admin-field">
                <label
                  className="admin-label"
                  htmlFor="product-price"
                >
                  Harga (Rupiah)
                </label>

                <input
                  className="admin-input"
                  id="product-price"
                  min="1"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  placeholder="Contoh: 50000"
                  required
                  type="number"
                  value={form.price}
                />
              </div>

              <div className="admin-field">
                <label
                  className="admin-label"
                  htmlFor="product-rating"
                >
                  Rating (0–5)
                </label>

                <input
                  className="admin-input"
                  id="product-rating"
                  max="5"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rating: event.target.value,
                    }))
                  }
                  required
                  step="0.1"
                  type="number"
                  value={form.rating}
                />
              </div>

              <div className="admin-field admin-field-full">
                <label
                  className="admin-label"
                  htmlFor="product-illustration"
                >
                  Ilustrasi Produk
                </label>

                <input
                  className="admin-input"
                  id="product-illustration"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      illustration: event.target.value,
                    }))
                  }
                  placeholder="Contoh: 🍘"
                  required
                  value={form.illustration}
                />

                <small className="admin-helper">
                  Masukkan emoji atau karakter ilustrasi produk.
                </small>
              </div>

              <div className="admin-field admin-field-full">
                <label
                  className="admin-label"
                  htmlFor="product-description"
                >
                  Deskripsi Produk
                </label>

                <textarea
                  className="admin-input admin-textarea"
                  id="product-description"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Tuliskan deskripsi produk..."
                  required
                  value={form.description}
                />
              </div>
            </div>

            <div className="admin-form-actions">
              {editing && (
                <button
                  className="admin-button admin-button-secondary"
                  onClick={resetForm}
                  type="button"
                >
                  Batal Edit
                </button>
              )}

              <button
                className="admin-button admin-button-primary"
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Menyimpan..."
                  : editing
                    ? "Simpan Perubahan"
                    : "+ Tambah Produk"}
              </button>
            </div>
          </form>
        </section>

        <div aria-live="polite" role="status">
          {error && (
            <div className="admin-alert admin-alert-error">
              {error}
            </div>
          )}

          {notice && (
            <div className="admin-alert admin-alert-success">
              {notice}
            </div>
          )}
        </div>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">
                PRODUCT CATALOG
              </span>

              <h2>Daftar Produk</h2>

              <p>
                Seluruh produk yang tersimpan dalam database.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty">
              Memuat katalog produk...
            </div>
          ) : products.length === 0 ? (
            <div className="admin-empty">
              Belum ada produk. Tambahkan produk pertama Anda.
            </div>
          ) : (
            <div className="admin-product-grid">
              {products.map((product) => (
                <article
                  className="admin-product-card"
                  key={product.id}
                >
                  <div
                    className="admin-product-illustration"
                    aria-label={`Ilustrasi ${product.name}`}
                  >
                    {product.illustration}
                  </div>

                  <div className="admin-product-content">
                    <div className="admin-product-meta">
                      <span>{product.id}</span>
                      <span>{product.category}</span>
                    </div>

                    <h3>{product.name}</h3>

                    <p className="admin-product-origin">
                      📍 {product.origin}
                    </p>

                    <p className="admin-product-description">
                      {product.description}
                    </p>

                    <div className="admin-product-bottom">
                      <strong>{formatPrice(product.price)}</strong>
                      <small>⭐ {product.rating} / 5</small>
                    </div>

                    <div className="admin-product-actions">
                      <button
                        className="admin-button admin-button-secondary"
                        onClick={() => startEdit(product)}
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        className="admin-button admin-button-danger"
                        onClick={() => void deleteProduct(product.id)}
                        type="button"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="admin-footer">
          Way2Buy Administration Dashboard
        </footer>
      </div>
    </main>
  );
}
