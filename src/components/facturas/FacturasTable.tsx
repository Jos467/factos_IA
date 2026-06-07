// src/components/facturas/FacturasTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { eliminarFactura } from "@/lib/actions/factura.actions";
import { FileText, Eye, Pencil, Trash2, Plus } from "lucide-react";
import type { Factura, CategoriaGasto, TipoDocumento } from "../../../generated/prisma";

type FacturaConRelaciones = Omit<Factura, "monto" | "fecha" | "created_at" | "updated_at"> & {
  monto:         number;
  fecha:         string | null;
  created_at:    string;
  updated_at:    string;
  categoria:     CategoriaGasto | null;
  tipoDocumento: TipoDocumento | null;
};

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BORRADOR: { bg: "#FEF3C7", color: "#D97706", label: "Borrador" },
  COMPLETA: { bg: "#D1FAE5", color: "#059669", label: "Completa" },
  ENVIADA:  { bg: "#E0F5F8", color: "#0E7490", label: "Enviada"  },
};

function formatMoney(amount: number, moneda = "HNL") {
  return new Intl.NumberFormat("es-HN", {
    style: "currency", currency: moneda, minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string | Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(date));
}

export function FacturasTable({ facturas }: { facturas: FacturaConRelaciones[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      await eliminarFactura(id);
      toast.success("Factura eliminada");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      if (!msg.includes("NEXT_REDIRECT")) toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  if (facturas.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--off-white)" }}>
          <FileText size={28} style={{ color: "var(--muted)" }} />
        </div>
        <p className="font-bold text-lg" style={{ color: "var(--charcoal)" }}>
          No hay facturas en este período
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Cambia los filtros o registra una nueva factura
        </p>
        <Link href="/facturas/nueva"
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "var(--navy)" }}>
          <Plus size={15} /> Nueva factura
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header — solo desktop */}
      <div
        className="hidden md:grid gap-4 px-6 py-3.5 text-xs font-bold uppercase tracking-widest"
        style={{
          gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr auto",
          background: "var(--off-white)",
          color: "var(--muted)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span>Proveedor</span>
        <span>Fecha</span>
        <span>Monto</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      {/* Filas */}
      <div>
        {facturas.map((f, idx) => {
          const estado = ESTADO_STYLES[f.estado] ?? ESTADO_STYLES.BORRADOR;
          const isLast = idx === facturas.length - 1;

          return (
            <div
              key={f.id}
              className="group flex flex-col md:grid gap-4 items-start md:items-center px-6 py-4 transition-colors hover:bg-slate-50"
              style={{
                gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr auto",
                borderBottom: isLast ? "none" : "1px solid var(--border)",
              }}
            >
              {/* Proveedor */}
              <div className="flex items-center gap-3 min-w-0 w-full">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
                  style={{ background: f.categoria?.color ? `${f.categoria.color}18` : "var(--off-white)" }}
                >
                  {f.categoria?.icono ?? "📄"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--charcoal)" }}>
                    {f.proveedorTexto ?? "Sin proveedor"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                    {f.numeroFactura ? `#${f.numeroFactura} · ` : ""}{f.categoria?.nombre ?? "Sin categoría"}
                  </p>
                </div>
              </div>

              {/* Fecha */}
              <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "DM Mono, monospace" }}>
                {formatDate(f.fecha)}
              </p>

              {/* Monto */}
              <p className="text-sm font-bold" style={{
                color: f.tipoMovimiento === "INGRESO" ? "#10B981" : "var(--charcoal)",
                fontFamily: "DM Mono, monospace",
              }}>
                {f.tipoMovimiento === "INGRESO" ? "+" : "−"}{formatMoney(f.monto, f.moneda)}
              </p>

              {/* Estado */}
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold w-fit"
                style={{ background: estado.bg, color: estado.color }}
              >
                {estado.label}
              </span>

              {/* Acciones */}
              <div className="flex items-center gap-1">
                <Link href={`/facturas/${f.id}`}
                  className="p-2 rounded-lg transition-colors hover:bg-slate-100"
                  title="Ver detalle">
                  <Eye size={16} style={{ color: "var(--muted)" }} />
                </Link>
                <Link href={`/facturas/${f.id}/editar`}
                  className="p-2 rounded-lg transition-colors hover:bg-cyan-50"
                  title="Editar">
                  <Pencil size={16} style={{ color: "var(--cyan)" }} />
                </Link>
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={deletingId === f.id}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 size={16} style={{ color: deletingId === f.id ? "var(--muted)" : "#EF4444" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}