// src/app/(protected)/reportes/page.tsx
import { Topbar } from "@/components/layout/Topbar";
import { BarChart3 } from "lucide-react";

export default function ReportesPage() {
  return (
    <>
      <Topbar title="Reportes" subtitle="Resúmenes y envíos mensuales a tu contadora" />
      <div className="flex-1 p-8">
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#d1fae5" }}
          >
            <BarChart3 size={28} style={{ color: "var(--success)" }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: "var(--charcoal)" }}>
            Módulo de Reportes
          </p>
          <p className="text-sm text-center max-w-sm" style={{ color: "var(--muted)" }}>
            Genera resúmenes mensuales y compártelos por WhatsApp o correo con tu contadora. Próximamente en el Sprint 3.
          </p>
        </div>
      </div>
    </>
  );
}
