// src/components/facturas/NuevaFacturaForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { facturaSchema, type FacturaInput } from "@/lib/validations/factura";
import { crearFactura } from "@/lib/actions/factura.actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/facturas/FileUpload";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type { CategoriaGasto, TipoDocumento } from "../../../generated/prisma";
import type { DatosFacturaOCR } from "@/lib/services/ocr";

interface Props {
  categorias:      CategoriaGasto[];
  tiposDocumento:  TipoDocumento[];
}

export function NuevaFacturaForm({ categorias, tiposDocumento }: Props) {
  const { data: session } = useSession();
  const [archivoUrl,   setArchivoUrl]   = useState<string>("");
  const [archivoTipo,  setArchivoTipo]  = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrUsado,     setOcrUsado]     = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FacturaInput>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      fecha:          "",
      proveedorTexto: "",
      monto:          "",
      moneda:         "HNL",
      tipoMovimiento: "GASTO",
      facturaFisica:  false,
      numeroFactura:  "",
      observaciones:  "",
    },
  });

  // Callback cuando la IA termina de analizar — auto-llena el formulario
  const handleOCRComplete = (datos: DatosFacturaOCR) => {
    let camposLlenados = 0;

    if (datos.proveedor) {
      setValue("proveedorTexto", datos.proveedor);
      camposLlenados++;
    }
    if (datos.fecha) {
      setValue("fecha", datos.fecha);
      camposLlenados++;
    }
    if (datos.monto) {
      setValue("monto", datos.monto);
      camposLlenados++;
    }
    if (datos.numeroFactura) {
      setValue("numeroFactura", datos.numeroFactura);
      camposLlenados++;
    }
    if (datos.observaciones) {
      setValue("observaciones", datos.observaciones);
      camposLlenados++;
    }

    // Auto-seleccionar categoría si la IA la sugirió
    if (datos.categoria) {
      const cat = categorias.find(
        (c) => c.nombre.toLowerCase() === datos.categoria!.toLowerCase()
      );
      if (cat) {
        setValue("categoriaId", String(cat.id));
        camposLlenados++;
      }
    }

    // Auto-seleccionar tipo de documento
    if (datos.tipoDocumento) {
      const tipo = tiposDocumento.find(
        (t) => t.nombre.toLowerCase() === datos.tipoDocumento!.toLowerCase()
      );
      if (tipo) {
        setValue("tipoDocumentoId", String(tipo.id));
        camposLlenados++;
      }
    }

    setOcrUsado(true);

    if (camposLlenados > 0) {
      toast.success(`IA detectó ${camposLlenados} campos automáticamente`, {
        description: "Revisa y corrige si es necesario antes de guardar",
      });
    } else {
      toast.warning("La IA no pudo extraer datos — completa el formulario manualmente");
    }
  };

  const onSubmit = async (data: FacturaInput) => {
    setIsSubmitting(true);
    try {
      await crearFactura(data, archivoUrl || undefined, archivoTipo || undefined);
    } catch (e: unknown) {
      const digest = (e as { digest?: string })?.digest ?? "";
      const msg    = e instanceof Error ? e.message : "";
      if (digest.includes("NEXT_REDIRECT") || msg.includes("NEXT_REDIRECT")) return;
      toast.error("Error al guardar la factura");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
      <Link
        href="/facturas"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft size={16} /> Volver a facturas
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Archivo + OCR */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold" style={{ color: "var(--navy)" }}>
              Archivo de la factura
            </h2>
            <span
              className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--cyan-muted)", color: "var(--cyan)" }}
            >
              <Sparkles size={10} /> IA
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
            Sube la imagen o PDF — la IA llenará los campos automáticamente
          </p>
          {session?.user?.id && (
            <FileUpload
              userId={session.user.id}
              onUploadComplete={(url, tipo) => {
                setArchivoUrl(url);
                setArchivoTipo(tipo);
              }}
              onUploadError={(err) => toast.error(err)}
              onOCRComplete={handleOCRComplete}
            />
          )}
        </div>

        {/* Banner si OCR fue usado */}
        {ocrUsado && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <Sparkles size={16} style={{ color: "#3b82f6" }} />
            <span style={{ color: "#1e40af" }}>
              Campos pre-llenados por IA — revisa y corrige antes de guardar
            </span>
          </div>
        )}

        {/* Datos principales */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
            Datos de la factura
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Proveedor *"
              type="text"
              placeholder="Nombre del proveedor o tienda"
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
              placeholder="Ej: 001-002-00123456"
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
              <label
                htmlFor="facturaFisica"
                className="text-sm font-medium cursor-pointer"
                style={{ color: "var(--charcoal)" }}
              >
                Es una factura física (documento impreso)
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
            placeholder="Notas adicionales sobre esta factura..."
            rows={3}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--charcoal)",
              fontFamily: "inherit",
            }}
            {...register("observaciones")}
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <Link href="/facturas" className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              Cancelar
            </Button>
          </Link>
          <div className="flex-1">
            <Button type="submit" loading={isSubmitting} className="w-full">
              Guardar factura
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
