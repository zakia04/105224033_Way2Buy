import type { PrismaDatabaseError } from "@/lib/prisma-database-error";

export function DatabaseUnavailable({
  code,
  message,
}: PrismaDatabaseError) {
  return (
    <main
      aria-labelledby="database-unavailable-heading"
      className="page-main"
    >
      <section aria-live="assertive" className="form-summary" role="alert">
        <h1 id="database-unavailable-heading">
          Data belum dapat dimuat
        </h1>
        <p>{message}</p>
        <p>
          Kode: <code>{code}</code>. Perbaiki konfigurasi database, lalu muat
          ulang halaman.
        </p>
      </section>
    </main>
  );
}
