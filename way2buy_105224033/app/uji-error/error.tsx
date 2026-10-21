"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="route-state-demo" role="alert">
      <p className="eyebrow">Status rute</p>
      <h1>Halaman tidak dapat dimuat</h1>
      <p>Error boundary dari error.tsx menangani kegagalan pada segmen ini.</p>
      <button className="button" onClick={() => reset()} type="button">
        Coba lagi
      </button>
    </main>
  );
}
