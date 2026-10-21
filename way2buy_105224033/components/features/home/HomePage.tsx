import Link from "next/link";
import { ProductCard } from "../products/ProductCard";
import { ProductArtwork } from "../products/ProductArtwork";
import { SiteFooter } from "../../layout/SiteFooter";
import { SiteHeader } from "../../layout/SiteHeader";
import { products } from "../../../lib/catalog/products";

const benefits = [
  {
    number: "01",
    title: "Cari yang kamu suka",
    description:
      "Jelajahi produk lokal pilihan dari berbagai kota di Indonesia.",
  },
  {
    number: "02",
    title: "Buat permintaan titip",
    description: "Ceritakan produk dan kota tujuanmu kepada jastiper.",
  },
  {
    number: "03",
    title: "Produk sampai di rumah",
    description: "Jastiper membantu belanja langsung dari daerah asal.",
  },
];

export function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <SiteHeader activePath="/" />
      <main id="main-content">
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__copy">
              <span className="eyebrow">
                <span aria-hidden="true">✳</span> Cerita lokal, sampai ke kotamu
              </span>
              <h1 className="text-balance">
                Jauh di kota,
                <br />
                dekat di <span>hati.</span>
              </h1>
              <p className="hero__description">
                Rindu rasa, karya, dan cerita dari daerah lain? Temukan produk
                lokal favoritmu dan titip lewat jastiper terpercaya.
              </p>
              <div className="hero__actions">
                <Link className="button" href="/produk">
                  Jelajahi produk <span aria-hidden="true">↗</span>
                </Link>
                <Link className="text-link" href="/titip">
                  Belum menemukan produk? <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="hero__proof">
                <div aria-hidden="true" className="avatar-stack">
                  <span>🌶️</span>
                  <span>☕</span>
                  <span>🧵</span>
                </div>
                <p>
                  <strong>Produk pilihan lokal</strong>
                  <br />
                  Dari berbagai penjuru Indonesia
                </p>
              </div>
            </div>
            <div className="hero__art">
              <div className="hero__sun" />
              <ProductArtwork className="hero__photo" product={products[1]} />
              <div className="hero-note hero-note--top">
                <span aria-hidden="true">📍</span>
                <span>
                  <strong>Salam dari Jogja</strong>
                  <br />
                  Dibuat dengan cerita
                </span>
              </div>
              <div className="hero-note hero-note--bottom">
                <span aria-hidden="true" className="hero-note__star">
                  ★
                </span>
                <span>
                  <strong>Favorit minggu ini</strong>
                  <br />
                  Bakpia Pathok 25
                </span>
              </div>
              <span aria-hidden="true" className="hero__scribble">
                dari sini,
                <br />
                untukmu ↙
              </span>
            </div>
          </div>
          <div aria-hidden="true" className="hero__ticker">
            <span>RASA ASLI</span>
            <i>✳</i>
            <span>KARYA LOKAL</span>
            <i>✳</i>
            <span>CERITA NUSANTARA</span>
            <i>✳</i>
            <span>RASA ASLI</span>
          </div>
        </section>

        <section
          aria-labelledby="popular-heading"
          className="section section--products"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">Pilihan untukmu</span>
              <h2 id="popular-heading">Dari sana, untuk di sini.</h2>
            </div>
            <Link className="text-link" href="/produk">
              Lihat semua produk <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="product-grid product-grid--featured">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section aria-labelledby="how-heading" className="how-section">
          <div className="how-section__intro">
            <span className="eyebrow">Semudah itu</span>
            <h2 id="how-heading">
              Kota boleh berjauhan.
              <br />
              <span>Keinginan jangan.</span>
            </h2>
            <p>
              Way2Buy mempertemukanmu dengan jastiper lokal supaya produk dari
              kota lain terasa lebih dekat.
            </p>
            <Link className="button button--light" href="/titip">
              Mulai perjalananmu <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ol className="steps-list">
            {benefits.map((benefit) => (
              <li className="step-card" key={benefit.number}>
                <span className="step-card__number">{benefit.number}</span>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
                <span aria-hidden="true" className="step-card__arrow">
                  ↗
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
