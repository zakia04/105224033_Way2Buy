import { ProductCatalog } from "../components/ProductCatalog";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function ProductsPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <SiteHeader activePath="/produk" />
      <main className="page-main" id="main-content">
        <section aria-labelledby="catalog-heading" className="page-intro">
          <span className="eyebrow">Pasar lokal, satu tempat</span>
          <h1 className="text-balance" id="catalog-heading">Temukan cerita<br />di setiap <span>produk.</span></h1>
          <p>Jelajahi rasa dan karya dari penjuru Indonesia. Ketik nama produk atau daerah asal untuk menemukan yang kamu cari.</p>
        </section>
        <section aria-labelledby="product-list-heading" className="catalog-section">
          <ProductCatalog />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
