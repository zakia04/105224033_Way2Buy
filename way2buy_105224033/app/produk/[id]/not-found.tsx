import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="route-state-demo">
      <p className="eyebrow">404 · Produk tidak ditemukan</p>
      <h1>Produk ini belum ada di katalog.</h1>
      <p>Periksa kembali ID produk atau jelajahi katalog yang tersedia.</p>
      <Link className="button" href="/produk">
        Kembali ke katalog
      </Link>
    </main>
  );
}
