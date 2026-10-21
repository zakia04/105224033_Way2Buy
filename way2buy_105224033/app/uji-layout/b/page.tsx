import Link from "next/link";

export default function LayoutTestPageB() {
  return (
    <section>
      <h2>Halaman B</h2>
      <Link href="/uji-layout/a" prefetch={false}>
        Kembali ke Halaman A
      </Link>
    </section>
  );
}
