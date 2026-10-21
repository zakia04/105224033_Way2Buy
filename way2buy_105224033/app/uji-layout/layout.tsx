import { RouteLifecycleProbe } from "../../components/features/diagnostics/RouteLifecycleProbe";

export default function LifecycleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="lifecycle-demo">
      <h1>Uji persistensi Layout dan Template</h1>
      <RouteLifecycleProbe label="State di layout.tsx (tetap saat navigasi)" />
      {children}
    </main>
  );
}
