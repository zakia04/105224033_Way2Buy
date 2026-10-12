import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link className="brand" href="/">
          <span aria-hidden="true" className="brand__mark">w.</span>
          <span className="brand__name">way2buy<span className="brand__dot">.</span></span>
        </Link>
        <p>Produk lokal, lebih dekat ke kamu.</p>
        <div>
          <span>© 2026 Way2Buy · Marketplace Jasa Titip Produk Lokal</span>
        </div>
      </div>
    </footer>
  );
}
