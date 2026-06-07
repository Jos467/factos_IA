// src/components/facturas/EditarFacturaForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { facturaSchema, type FacturaInput } from "@/lib/validations/factura";
import { actualizarFactura } from "@/lib/actions/factura.actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type {
  Factura,
  CategoriaGasto,
  TipoDocumento
} from "@prisma/client";

interface Props {
  factura: Factura;
  categorias: CategoriaGasto[];
  tiposDocumento: TipoDocumento[];
}

export function EditarFacturaForm({ factura, categorias, tiposDocumento }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacturaInput>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      fecha:           factura.fecha ? new Date(factura.fecha).toISOString().split("T")[0] : "",
      proveedorTexto:  factura.proveedorTexto ?? "",
      monto:           String(factura.monto),
      moneda:          factura.moneda,
      categoriaId:     factura.categoriaId ? String(factura.categoriaId) : "",
      tipoDocumentoId: factura.tipoDocumentoId ? String(factura.tipoDocumentoId) : "",
      tipoMovimiento:  factura.tipoMovimiento as "GASTO" | "INGRESO",
      numeroFactura:   factura.numeroFactura ?? "",
      facturaFisica:   factura.facturaFisica,
      observaciones:   factura.observaciones ?? "",
    },
  });

  const onSubmit = async (data: FacturaInput) => {
    setIsSubmitting(true);
    try {
      await actualizarFactura(factura.id, data);
      toast.success("Factura actualizada correctamente");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      if (!msg.includes("NEXT_REDIRECT")) {
        toast.error(msg);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      {/* Datos principales */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
          Datos de la factura
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Proveedor *"
            type="text"
            placeholder="Nombre del proveedor"
            error={errors.proveedorTexto?.message}
            {...register("proveedorTexto")}
          />
          <Input
            label="Fecha *"
            type="date"
            error={errors.fecha?.message}
            {...register("fecha")}
          />
          <Input
            label="Monto *"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.monto?.message}
            {...register("monto")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>
              Moneda
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--charcoal)" }}
              {...register("moneda")}
            >
              <option value="HNL">HNL — Lempira</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clasificación */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
          Clasificación
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>
              Categoría
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--charcoal)" }}
              {...register("categoriaId")}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icono} {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>
              Tipo de documento
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--charcoal)" }}
              {...register("tipoDocumentoId")}
            >
              <option value="">Sin tipo</option>
              {tiposDocumento.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>
              Tipo de movimiento
            </label>
            <select
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--charcoal)" }}
              {...register("tipoMovimiento")}
            >
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>

          <Input
            label="Número de factura"
            type="text"
            placeholder="001-002-00123456"
            error={errors.numeroFactura?.message}
            {...register("numeroFactura")}
          />

          <div className="flex items-center gap-3 col-span-full">
            <input
              type="checkbox"
              id="facturaFisica"
              className="w-4 h-4 rounded"
              style={{ accentColor: "var(--navy)" }}
              {...register("facturaFisica")}
            />
            <label htmlFor="facturaFisica" className="text-sm font-medium cursor-pointer"
                   style={{ color: "var(--charcoal)" }}>
              Es una factura física
            </label>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
          Observaciones
        </h2>
        <textarea
          rows={3}
          placeholder="Notas adicionales..."
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
          style={{ borderColor: "var(--border)", color: "var(--charcoal)", fontFamily: "inherit" }}
          {...register("observaciones")}
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Link href={`/facturas/${factura.id}`} className="flex-1">
          <Button type="button" variant="secondary" className="w-full">
            Cancelar
          </Button>
        </Link>
        <div className="flex-1">
          <Button type="submit" loading={isSubmitting} className="w-full">
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
}
