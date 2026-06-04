// src/app/(protected)/categorias/page.tsx
import { Topbar } from "@/components/layout/Topbar";
import { Tag } from "lucide-react";

export default function CategoriasPage() {
  return (
    <>
      <Topbar title="Categorías" subtitle="Administra las categorías de gasto" />
      <div className="flex-1 p-8">
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--cyan-muted)" }}
          >
            <Tag size={28} style={{ color: "var(--cyan)" }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: "var(--charcoal)" }}>
            Módulo de Categorías
          </p>
          <p className="text-sm text-center max-w-sm" style={{ color: "var(--muted)" }}>
            Alimentación, Transporte, Salud, Servicios y más. Próximamente en el Sprint 2.
          </p>
        </div>
      </div>
    </>
  );
}
