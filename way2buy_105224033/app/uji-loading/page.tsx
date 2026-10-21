export default async function LoadingDemoPage() {
  await new Promise((resolve) => setTimeout(resolve, 6000));

  return (
    <main className="route-state-demo">
      <p className="eyebrow">Status rute</p>
      <h1>Halaman berhasil dimuat</h1>
      <p>Konten ini menggantikan fallback loading.tsx setelah proses selesai.</p>
    </main>
  );
}
