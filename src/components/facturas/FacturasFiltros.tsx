// src/components/facturas/FacturasFiltros.tsx
"use client";

import { useRouter } from "next/navigation";
import type { CategoriaGasto } from "@prisma/client";

interface Props {
  mesActual: number;
  anioActual: number;
  categoriaIdActual?: number;
  categorias: CategoriaGasto[];
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export function FacturasFiltros({ mesActual, anioActual, categoriaIdActual, categorias }: Props) {
  const router = useRouter();
  const now = new Date();

  const navigate = (mes: number, anio: number, categoriaId?: number) => {
    const params = new URLSearchParams();
    params.set("mes", String(mes));
    params.set("anio", String(anio));
    if (categoriaId) params.set("categoriaId", String(categoriaId));
    router.push(`/facturas?${params.toString()}`);
  };

  const selectStyle = {
    borderColor: "var(--border)",
    color: "var(--charcoal)",
    background: "white",
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Mes */}
      <select
        value={mesActual}
        onChange={(e) => navigate(Number(e.target.value), anioActual, categoriaIdActual)}
        className="rounded-xl border px-3 py-2 text-sm outline-none cursor-pointer"
        style={selectStyle}
      >
        {MESES.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* Año */}
      <select
        value={anioActual}
        onChange={(e) => navigate(mesActual, Number(e.target.value), categoriaIdActual)}
        className="rounded-xl border px-3 py-2 text-sm outline-none cursor-pointer"
        style={selectStyle}
      >
        {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Categoría */}
      <select
        value={categoriaIdActual ?? ""}
        onChange={(e) => navigate(mesActual, anioActual, e.target.value ? Number(e.target.value) : undefined)}
        className="rounded-xl border px-3 py-2 text-sm outline-none cursor-pointer"
        style={selectStyle}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icono} {c.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
