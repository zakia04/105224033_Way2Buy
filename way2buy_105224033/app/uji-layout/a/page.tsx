import Link from "next/link";

export default function LayoutTestPageA() {
  return (
    <section>
      <h2>Halaman A</h2>
      <Link href="/uji-layout/b" prefetch={false}>
        Navigasi ke Halaman B
      </Link>
      <p>
        <Link href="/uji-loading" prefetch={false}>
          Uji loading.tsx
        </Link>
      </p>
      <p>
        <Link href="/uji-error" prefetch={false}>
          Uji error.tsx
        </Link>
      </p>
    </section>
  );
}
