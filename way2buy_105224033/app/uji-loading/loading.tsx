export default function Loading() {
  return (
    <main aria-live="polite" className="route-state-demo">
      <p className="eyebrow">Status rute</p>
      <h1>Memuat demonstrasi…</h1>
      <p>Fallback dari loading.tsx tampil selama halaman disiapkan.</p>
      <div aria-label="Memuat" className="route-state-demo__spinner" role="status" />
    </main>
  );
}
