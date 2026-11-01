"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

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

function isProductList(value: unknown): value is { products: ProductRecord[] } {
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
  const response = await fetch("/api/products", { cache: "no-store" });
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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts());
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Katalog gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchProducts()
      .then((loadedProducts) => {
        if (active) setProducts(loadedProducts);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : "Katalog gagal dimuat.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function startEdit(product: ProductRecord) {
    setEditing(true);
    setForm({
      ...product,
      price: String(product.price),
      rating: String(product.rating),
    });
    setNotice(null);
    setError(null);
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
      const response = await fetch("/api/products", {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          rating: Number(form.rating),
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(responseError(data) ?? "Perubahan produk gagal.");
      }

      setNotice(editing ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
      resetForm();
      await loadProducts();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Perubahan produk gagal.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm(`Hapus produk ${id}?`)) return;
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/products?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(responseError(data) ?? "Produk gagal dihapus.");
      }
      setNotice("Produk berhasil dihapus.");
      if (form.id === id) resetForm();
      await loadProducts();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Produk gagal dihapus.",
      );
    }
  }

  return (
    <main>
      <h1>Administrasi produk</h1>
      <p>
        Masukkan token admin untuk membuat, memperbarui, atau menghapus produk.
        Token hanya digunakan pada permintaan ini dan tidak disimpan.
      </p>

      <div>
        <label htmlFor="admin-token">Token admin</label>
        <input
          autoComplete="off"
          id="admin-token"
          onChange={(event) => setToken(event.target.value)}
          type="password"
          value={token}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <h2>{editing ? "Perbarui produk" : "Tambah produk"}</h2>
        <label htmlFor="product-id">ID produk</label>
        <input
          id="product-id"
          onChange={(event) =>
            setForm((current) => ({ ...current, id: event.target.value }))
          }
          readOnly={editing}
          required
          value={form.id}
        />

        <label htmlFor="product-name">Nama</label>
        <input
          id="product-name"
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          required
          value={form.name}
        />

        <label htmlFor="product-category">Kategori</label>
        <select
          id="product-category"
          onChange={(event) =>
            setForm((current) => ({ ...current, category: event.target.value }))
          }
          value={form.category}
        >
          <option>Makanan</option>
          <option>Fashion</option>
          <option>Minuman</option>
          <option>Oleh-oleh</option>
        </select>

        <label htmlFor="product-origin">Asal</label>
        <input
          id="product-origin"
          onChange={(event) =>
            setForm((current) => ({ ...current, origin: event.target.value }))
          }
          required
          value={form.origin}
        />

        <label htmlFor="product-price">Harga (rupiah)</label>
        <input
          id="product-price"
          min="1"
          onChange={(event) =>
            setForm((current) => ({ ...current, price: event.target.value }))
          }
          required
          type="number"
          value={form.price}
        />

        <label htmlFor="product-rating">Rating (0–5)</label>
        <input
          id="product-rating"
          max="5"
          min="0"
          onChange={(event) =>
            setForm((current) => ({ ...current, rating: event.target.value }))
          }
          required
          step="0.1"
          type="number"
          value={form.rating}
        />

        <label htmlFor="product-illustration">Ilustrasi</label>
        <input
          id="product-illustration"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              illustration: event.target.value,
            }))
          }
          required
          value={form.illustration}
        />

        <label htmlFor="product-description">Deskripsi</label>
        <textarea
          id="product-description"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          required
          value={form.description}
        />

        <button disabled={saving} type="submit">
          {saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Tambah produk"}
        </button>
        {editing && (
          <button onClick={resetForm} type="button">
            Batal edit
          </button>
        )}
      </form>

      <div aria-live="polite" role="status">
        {error && <p>{error}</p>}
        {notice && <p>{notice}</p>}
      </div>

      <section aria-labelledby="product-list-heading">
        <h2 id="product-list-heading">Daftar produk</h2>
        {loading ? (
          <p>Memuat katalog…</p>
        ) : products.length === 0 ? (
          <p>Belum ada produk. Jalankan seed untuk mengisi katalog awal.</p>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <strong>{product.id} · {product.name}</strong>
                <span> — {product.origin} · Rp{product.price}</span>
                <button onClick={() => startEdit(product)} type="button">
                  Edit
                </button>
                <button
                  onClick={() => void deleteProduct(product.id)}
                  type="button"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
