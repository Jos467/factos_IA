// src/components/facturas/FacturasTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { eliminarFactura } from "@/lib/actions/factura.actions";
import { FileText, Eye, Pencil, Trash2 } from "lucide-react";
import type { Factura, CategoriaGasto, TipoDocumento } from "../../../generated/prisma";

type FacturaConRelaciones = Omit<Factura, "monto" | "fecha" | "created_at" | "updated_at"> & {
  monto:         number;
  fecha:         string | null;
  created_at:    string;
  updated_at:    string;
  categoria:     CategoriaGasto | null;
  tipoDocumento: TipoDocumento | null;
};

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR: "badge badge-warning",
  COMPLETA: "badge badge-success",
  ENVIADA:  "badge badge-info",
};

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  COMPLETA: "Completa",
  ENVIADA:  "Enviada",
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency", currency: "HNL", minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string | Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(date));
}

interface Props {
  facturas: FacturaConRelaciones[];
}

export function FacturasTable({ facturas }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta factura? Esta acción no se puede deshacer.")) return;
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
      <div className="card flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ background: "var(--off-white)" }}>
          <FileText size={28} style={{ color: "var(--muted)" }} />
        </div>
        <p className="font-semibold" style={{ color: "var(--charcoal)" }}>
          No hay facturas en este período
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Cambia los filtros o registra una nueva factura
        </p>
        <Link
          href="/facturas/nueva"
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--navy)" }}
        >
          Nueva factura
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header tabla */}
      <div
        className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
        style={{ background: "var(--off-white)", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}
      >
        <span>Proveedor</span>
        <span>Fecha</span>
        <span>Monto</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      {/* Filas */}
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {facturas.map((f) => (
          <div
            key={f.id}
            className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            {/* Proveedor + categoría */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                style={{
                  background: f.categoria?.color ? `${f.categoria.color}20` : "var(--off-white)",
                }}
              >
                {f.categoria?.icono ?? "📄"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--charcoal)" }}>
                  {f.proveedorTexto ?? "Sin proveedor"}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                  {f.categoria?.nombre ?? "Sin categoría"}
                </p>
              </div>
            </div>

            {/* Fecha */}
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {formatDate(f.fecha)}
            </p>

            {/* Monto */}
            <p
              className="text-sm font-bold"
              style={{ color: f.tipoMovimiento === "INGRESO" ? "var(--success)" : "var(--charcoal)" }}
            >
              {f.tipoMovimiento === "INGRESO" ? "+" : "-"}
              {formatMoney(Number(f.monto))}
            </p>

            {/* Estado */}
            <span className={ESTADO_BADGE[f.estado]}>
              {ESTADO_LABEL[f.estado]}
            </span>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              <Link
                href={`/facturas/${f.id}`}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                title="Ver detalle"
              >
                <Eye size={16} style={{ color: "var(--muted)" }} />
              </Link>
              <Link
                href={`/facturas/${f.id}/editar`}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                title="Editar"
              >
                <Pencil size={16} style={{ color: "var(--cyan)" }} />
              </Link>
              <button
                onClick={() => handleDelete(f.id)}
                disabled={deletingId === f.id}
                className="p-2 rounded-lg transition-colors hover:bg-red-50"
                title="Eliminar"
              >
                <Trash2
                  size={16}
                  style={{ color: deletingId === f.id ? "var(--muted)" : "#ef4444" }}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
