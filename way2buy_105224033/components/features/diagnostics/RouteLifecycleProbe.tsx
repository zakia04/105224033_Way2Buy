"use client";

import { useState } from "react";

export function RouteLifecycleProbe({ label }: { label: string }) {
  const [count, setCount] = useState(0);

  return (
    <section className="lifecycle-probe" aria-label={label}>
      <h2>{label}</h2>
      <p>
        Nilai state: <output>{count}</output>
      </p>
      <button onClick={() => setCount((value) => value + 1)} type="button">
        Tambah
      </button>
    </section>
  );
}
