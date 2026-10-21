import { RouteLifecycleProbe } from "../../components/features/diagnostics/RouteLifecycleProbe";

export default function LifecycleTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <RouteLifecycleProbe label="State di template.tsx (di-reset saat navigasi)" />
      {children}
    </>
  );
}
