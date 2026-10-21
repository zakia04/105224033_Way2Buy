import Link from "next/link";
import { RequestForm } from "./RequestForm";
import { SiteFooter } from "../../layout/SiteFooter";
import { SiteHeader } from "../../layout/SiteHeader";

export function RequestPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <SiteHeader activePath="/titip" />
      <main className="page-main" id="main-content">
        <div className="breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <span>Permintaan titip</span>
        </div>
        <div className="request-layout">
          <section className="request-intro">
            <span className="eyebrow">Ada yang kamu inginkan?</span>
            <h1>
              Biar kami
              <br />
              bantu <span>titipkan.</span>
            </h1>
            <div className="request-tip">
              <span aria-hidden="true">✳</span>
              <p>
                <strong>Belum tahu mau titip apa?</strong>
                <br />
                Lihat inspirasi produk lokal di{" "}
                <Link href="/produk">halaman jelajahi produk</Link>.
              </p>
            </div>
          </section>
          <section aria-labelledby="form-heading" className="form-panel">
            <div className="form-panel__heading">
              <span className="form-step">PERMINTAAN BARU · 01</span>
              <h2 id="form-heading">Ceritakan titipanmu</h2>
              <p>
                Lengkapi detail berikut agar jastiper tahu yang kamu butuhkan.
              </p>
            </div>
            <RequestForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
