import Link from "next/link";
import { SiteFooter } from "../../layout/SiteFooter";
import { SiteHeader } from "../../layout/SiteHeader";

export function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <SiteHeader activePath="/tentang" />
      <main className="page-main" id="main-content">
        <section aria-labelledby="about-heading" className="page-intro">
          <span className="eyebrow">Cerita Way2Buy</span>
          <h1 className="text-balance" id="about-heading">
            Produk lokal,
            <br />
            lebih dekat <span>ke kamu.</span>
          </h1>
          <p>
            Way2Buy menghubungkan konsumen dengan jastiper lokal agar produk
            khas dari berbagai daerah di Indonesia bisa sampai ke kota tujuan.
          </p>
        </section>
        <section aria-labelledby="about-purpose" className="about-section">
          <div>
            <span className="eyebrow">Tujuan kami</span>
            <h2 id="about-purpose">Mendekatkan cerita dari setiap daerah.</h2>
            <p>
              Produk lokal membawa rasa, karya, dan cerita asalnya. Way2Buy
              membantu konsumen menemukan produk tersebut dan mengajukan
              permintaan titip kepada jastiper.
            </p>
          </div>
          <div>
            <span className="eyebrow">Masalah yang ingin dijawab</span>
            <ul>
              <li>Akses produk khas daerah terbatas oleh jarak.</li>
              <li>Informasi produk dan proses titip sering tersebar.</li>
              <li>Alamat pengiriman perlu ditangani dengan lebih aman.</li>
            </ul>
          </div>
          <div>
            <span className="eyebrow">Fitur utama</span>
            <ul>
              <li>Katalog produk lokal dengan pencarian dan filter.</li>
              <li>Halaman detail produk berdasarkan ID.</li>
              <li>Formulir permintaan jasa titip.</li>
            </ul>
            <Link className="button" href="/produk">
              Jelajahi produk <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
