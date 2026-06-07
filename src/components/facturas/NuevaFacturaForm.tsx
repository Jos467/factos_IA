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
import type { CategoriaGasto, TipoDocumento } from "@prisma/client";
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
    <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
      <Link
        href="/facturas"
        className="inline-flex items-center gap-2 text-sm mb-8 font-medium text-slate-400 hover:text-navy transition-all hover:-translate-x-1"
      >
        <ArrowLeft size={18} /> Volver a facturas
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">

        {/* Archivo + OCR */}
        <div className="card p-8 rounded-3xl shadow-premium border border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-navy">
              Archivo de la factura
            </h2>
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-cyan-muted text-cyan uppercase tracking-wider"
            >
              <Sparkles size={10} /> IA
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Sube la imagen o PDF para que nuestra IA detecte los datos automáticamente.
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
            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm"
          >
            <Sparkles size={20} className="text-blue-500" />
            <span className="text-blue-800 font-medium text-sm">
              Campos pre-llenados por IA — revisa y corrige antes de guardar
            </span>
          </div>
        )}

        {/* Datos principales */}
        <div className="card p-8 rounded-3xl shadow-premium border border-slate-100 bg-white">
          <h2 className="text-xl font-bold mb-8 text-navy">
            Datos de la factura
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <Input
              label="Proveedor *"
              type="text"
              placeholder="Nombre del proveedor o tienda"
              error={errors.proveedorTexto?.message}
              className="h-12"
              {...register("proveedorTexto")}
            />
            <Input
              label="Fecha *"
              type="date"
              error={errors.fecha?.message}
              className="h-12"
              {...register("fecha")}
            />
            <Input
              label="Monto *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.monto?.message}
              className="h-12"
              {...register("monto")}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Moneda</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-navy/5 focus:border-navy transition-all appearance-none bg-slate-50/50"
                {...register("moneda")}
              >
                <option value="HNL">HNL — Lempira</option>
                <option value="USD">USD — Dólar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="card p-8 rounded-3xl shadow-premium border border-slate-100 bg-white">
          <h2 className="text-xl font-bold mb-8 text-navy">
            Clasificación
          </h2>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Categoría</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-navy/5 focus:border-navy transition-all appearance-none bg-slate-50/50"
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Tipo de documento</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-navy/5 focus:border-navy transition-all appearance-none bg-slate-50/50"
                {...register("tipoDocumentoId")}
              >
                <option value="">Sin tipo</option>
                {tiposDocumento.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Tipo de movimiento</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-navy/5 focus:border-navy transition-all appearance-none bg-slate-50/50"
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
              className="h-12"
              {...register("numeroFactura")}
            />

            <div className="flex items-center gap-4 col-span-full bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
              <input
                type="checkbox"
                id="facturaFisica"
                className="w-5 h-5 rounded-lg border-slate-300 text-navy focus:ring-navy transition-all cursor-pointer accent-navy"
                {...register("facturaFisica")}
              />
              <label
                htmlFor="facturaFisica"
                className="text-sm font-bold cursor-pointer text-slate-700"
              >
                Es una factura física (documento impreso)
              </label>
            </div>
          </div>

        {/* Observaciones */}
        <div className="card p-8 rounded-3xl shadow-premium border border-slate-100 bg-white">
          <h2 className="text-xl font-bold mb-6 text-navy">
            Observaciones
          </h2>
          <textarea
            placeholder="Notas adicionales sobre esta factura..."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none resize-none focus:ring-2 focus:ring-navy/5 focus:border-navy transition-all bg-slate-50/50 text-charcoal font-sans"
            {...register("observaciones")}
          />
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-12">
          <Link href="/facturas" className="flex-1">
            <Button type="button" variant="secondary" className="w-full h-16 text-base font-bold rounded-2xl shadow-sm hover:bg-slate-100 transition-all active:scale-[0.98]">
              Cancelar
            </Button>
          </Link>
          <div className="flex-1">
            <Button type="submit" loading={isSubmitting} className="w-full h-16 text-base font-bold rounded-2xl shadow-button bg-navy hover:bg-navy-light text-white transition-all active:scale-[0.98]">
              Guardar factura
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
