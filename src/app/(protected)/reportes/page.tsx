// src/app/(protected)/reportes/page.tsx
import { Topbar } from "@/components/layout/Topbar";
import ReporteClientPage from "@/components/reportes/ReporteClientPage";

export default function ReportesPage() {
  return (
    <>
      <Topbar title="Reportes" subtitle="Resúmenes y envíos mensuales a tu contadora" />
      <ReporteClientPage />
    </>
  );
}