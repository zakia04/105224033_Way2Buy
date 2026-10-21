import { Suspense } from "react";
import { connection } from "next/server";

async function ThrowDemoError(): Promise<never> {
  await connection();
  throw new Error("Kesalahan demonstrasi untuk menguji error.tsx.");
}

export default function ErrorDemoPage() {
  return (
    <Suspense fallback={<p className="route-state-demo">Menyiapkan uji error…</p>}>
      <ThrowDemoError />
    </Suspense>
  );
}
