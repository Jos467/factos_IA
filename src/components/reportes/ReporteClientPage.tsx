// src/components/reportes/ReporteClientPage.tsx
"use client";

import { useState, useTransition } from "react";
import { obtenerReporteMensual, registrarEnvioWhatsApp } from "@/lib/actions/reporte.actions";
import {
  FileText, Download, MessageCircle, TrendingUp,
  TrendingDown, Wallet, ChevronLeft, ChevronRight,
  Loader2, Send,
} from "lucide-react";
import { toast } from "sonner";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

type Factura = {
  id: string;
  proveedorTexto: string;
  fecha: string | null;
  monto: number;
  moneda: string;
  tipoMovimiento: string;
  numeroFactura: string | null;
  facturaFisica: boolean;
  observaciones: string | null;
  archivoUrl: string | null;
  estado: string;
  categoria: { nombre: string; icono: string; color: string } | null;
  tipoDocumento: { nombre: string } | null;
};

type Reporte = {
  facturas: Factura[];
  totalGastos: number;
  totalIngresos: number;
  balance: number;
  porCategoria: { nombre: string; icono: string; color: string; total: number; cantidad: number }[];
  mes: number;
  anio: number;
};

function fmt(n: number, moneda = "HNL") {
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: moneda }).format(n);
}

export default function ReporteClientPage() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [telefono, setTelefono] = useState("");
  const [isPending, startTransition] = useTransition();
  const [enviando, setEnviando] = useState(false);

  const anios = Array.from({ length: 5 }, (_, i) => hoy.getFullYear() - i);

  function prevMes() {
    if (mes === 1) { setMes(12); setAnio(a => a - 1); }
    else setMes(m => m - 1);
    setReporte(null);
  }
  function nextMes() {
    if (mes === 12) { setMes(1); setAnio(a => a + 1); }
    else setMes(m => m + 1);
    setReporte(null);
  }

  function generarReporte() {
    startTransition(async () => {
      try {
        const data = await obtenerReporteMensual(mes, anio);
        setReporte(data);
        if (data.facturas.length === 0) toast.info("No hay facturas en ese período");
      } catch {
        toast.error("Error al generar el reporte");
      }
    });
  }

  async function descargarPDF() {
    if (!reporte) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    const mesNombre = MESES[reporte.mes - 1];

    doc.setFillColor(11, 45, 82);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FactosAI", 14, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Reporte mensual — ${mesNombre} ${reporte.anio}`, 14, 26);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-HN")}`, 196, 26, { align: "right" });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen del período", 14, 48);
    autoTable(doc, {
      startY: 52,
      head: [],
      body: [
        ["Total Gastos", fmt(reporte.totalGastos)],
        ["Total Ingresos", fmt(reporte.totalIngresos)],
        ["Balance", fmt(reporte.balance)],
        ["Facturas", String(reporte.facturas.length)],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 }, 1: { cellWidth: 60 } },
      theme: "plain",
      margin: { left: 14 },
    });

    if (reporte.porCategoria.length > 0) {
      const y1 = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.text("Gastos por categoría", 14, y1);
      autoTable(doc, {
        startY: y1 + 4,
        head: [["Categoría", "Facturas", "Total"]],
        body: reporte.porCategoria.map(c => [`${c.icono} ${c.nombre}`, String(c.cantidad), fmt(c.total)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [11, 45, 82], textColor: 255 },
        theme: "striped",
        margin: { left: 14, right: 14 },
      });
    }

    const y2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.text("Detalle de facturas", 14, y2);
    autoTable(doc, {
      startY: y2 + 4,
      head: [["Fecha", "Proveedor", "Categoría", "Tipo", "Monto"]],
      body: reporte.facturas.map(f => [
        f.fecha ? new Date(f.fecha).toLocaleDateString("es-HN") : "—",
        f.proveedorTexto,
        f.categoria ? `${f.categoria.icono} ${f.categoria.nombre}` : "—",
        f.tipoMovimiento,
        fmt(f.monto, f.moneda),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 159, 180], textColor: 255 },
      theme: "striped",
      margin: { left: 14, right: 14 },
    });

    doc.save(`reporte-${mesNombre.toLowerCase()}-${reporte.anio}.pdf`);
    toast.success("PDF descargado correctamente");
  }

  async function enviarWhatsApp() {
    if (!reporte || reporte.facturas.length === 0) return;
    if (!telefono.trim()) { toast.error("Ingresa el número de WhatsApp"); return; }
    setEnviando(true);
    try {
      const mesNombre = MESES[reporte.mes - 1];
      await registrarEnvioWhatsApp(reporte.mes, reporte.anio, telefono.trim(), reporte.facturas.map(f => f.id));
      const texto = encodeURIComponent(
        `Hola! Te comparto el resumen de facturas de *${mesNombre} ${reporte.anio}*:\n\n` +
        `💸 Gastos: ${fmt(reporte.totalGastos)}\n` +
        `💰 Ingresos: ${fmt(reporte.totalIngresos)}\n` +
        `📊 Balance: ${fmt(reporte.balance)}\n` +
        `🧾 Total facturas: ${reporte.facturas.length}\n\n` +
        `_Enviado desde FactosAI_`
      );
      window.open(`https://wa.me/${telefono.replace(/\D/g, "")}?text=${texto}`, "_blank");
      toast.success("Envío registrado. Abriendo WhatsApp...");
    } catch {
      toast.error("Error al registrar el envío");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">

      {/* ── Selector de período estilo Stitch ── */}
      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
          Reporte Mensual
        </p>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Visualización detallada de su rendimiento financiero
        </p>

        {/* Navegador de mes */}
        <div className="flex items-center justify-between p-4 rounded-2xl mb-5"
          style={{ border: "1.5px solid var(--border)", background: "var(--off-white)" }}>
          <button onClick={prevMes}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white"
            style={{ border: "1px solid var(--border)" }}>
            <ChevronLeft size={18} style={{ color: "var(--charcoal)" }} />
          </button>
          <div className="text-center">
            <p className="font-bold text-base" style={{ color: "var(--charcoal)" }}>
              {MESES[mes - 1]} {anio}
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--muted)" }}>
              Período actual
            </p>
          </div>
          <button onClick={nextMes}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white"
            style={{ border: "1px solid var(--border)" }}>
            <ChevronRight size={18} style={{ color: "var(--charcoal)" }} />
          </button>
        </div>

        <button
          onClick={generarReporte}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #006877 0%, #1A9FB4 100%)",
            boxShadow: "0 4px 15px rgba(26,159,180,0.3)",
            fontSize: 15,
          }}
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
          {isPending ? "Generando..." : "Generar reporte"}
        </button>
      </div>

      {/* ── Resultados ── */}
      {reporte && reporte.facturas.length > 0 && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Ingresos Totales",
                value: fmt(reporte.totalIngresos),
                icon: TrendingUp,
                iconColor: "#10B981",
                iconBg: "#D1FAE5",
                valueColor: "#10B981",
                border: "#10B981",
              },
              {
                label: "Gastos Totales",
                value: fmt(reporte.totalGastos),
                icon: TrendingDown,
                iconColor: "#EF4444",
                iconBg: "#FEE2E2",
                valueColor: "#EF4444",
                border: "#EF4444",
              },
              {
                label: "Facturas Emitidas",
                value: String(reporte.facturas.length),
                icon: FileText,
                iconColor: "var(--navy)",
                iconBg: "#EEF2F7",
                valueColor: "var(--charcoal)",
                border: "var(--navy)",
              },
              {
                label: "Balance Neto",
                value: fmt(reporte.balance),
                icon: Wallet,
                iconColor: reporte.balance >= 0 ? "#10B981" : "#EF4444",
                iconBg: reporte.balance >= 0 ? "#D1FAE5" : "#FEE2E2",
                valueColor: reporte.balance >= 0 ? "#10B981" : "#EF4444",
                border: reporte.balance >= 0 ? "#10B981" : "#EF4444",
              },
            ].map(({ label, value, icon: Icon, iconColor, iconBg, valueColor, border }) => (
              <div key={label} className="card p-5"
                style={{ borderLeft: `3px solid ${border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: iconBg }}>
                  <Icon size={18} style={{ color: iconColor }} />
                </div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{label}</p>
                <p className="font-bold" style={{ color: valueColor, fontSize: 18, fontFamily: "DM Mono, monospace" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Distribución por categoría */}
          {reporte.porCategoria.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-5" style={{ color: "var(--charcoal)" }}>
                Distribución de Gastos
              </h3>
              <div className="space-y-4">
                {reporte.porCategoria.map((cat) => {
                  const pct = reporte.totalGastos > 0 ? (cat.total / reporte.totalGastos) * 100 : 0;
                  return (
                    <div key={cat.nombre}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icono}</span>
                          <span className="text-sm font-bold" style={{ color: "var(--charcoal)" }}>
                            {cat.nombre}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "var(--off-white)", color: "var(--muted)" }}>
                            {cat.cantidad} factura{cat.cantidad !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold" style={{ color: "var(--charcoal)", fontFamily: "DM Mono, monospace" }}>
                            {fmt(cat.total)}
                          </span>
                          <span className="text-xs ml-2 font-semibold" style={{ color: "var(--muted)" }}>
                            ({Math.round(pct)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full rounded-full h-2.5" style={{ background: "var(--border)" }}>
                        <div
                          className="h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: cat.color || "var(--cyan)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabla detalle */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: "var(--charcoal)" }}>
                  Detalle de Facturación
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {MESES[reporte.mes - 1]} {reporte.anio} · {reporte.facturas.length} registros
                </p>
              </div>
            </div>

            {/* Header tabla */}
            <div className="hidden md:grid px-6 py-3 text-xs font-bold uppercase tracking-widest"
              style={{
                gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr",
                background: "var(--off-white)",
                color: "var(--muted)",
                borderBottom: "1px solid var(--border)",
              }}>
              <span>ID Factura</span>
              <span>Proveedor</span>
              <span>Fecha</span>
              <span>Tipo</span>
              <span className="text-right">Monto</span>
            </div>

            <div>
              {reporte.facturas.map((f, idx) => (
                <div key={f.id}
                  className="hidden md:grid px-6 py-3.5 items-center hover:bg-slate-50 transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr",
                    borderBottom: idx < reporte.facturas.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                  <span className="text-xs font-bold" style={{ color: "var(--muted)", fontFamily: "DM Mono, monospace" }}>
                    {f.numeroFactura ? `#${f.numeroFactura}` : `—`}
                  </span>
                  <div className="flex items-center gap-2">
                    {f.categoria && (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${f.categoria.color}18` }}>
                        {f.categoria.icono}
                      </div>
                    )}
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--charcoal)" }}>
                      {f.proveedorTexto}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: "var(--muted)", fontFamily: "DM Mono, monospace" }}>
                    {f.fecha ? new Date(f.fecha).toLocaleDateString("es-HN") : "—"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold w-fit"
                    style={{
                      background: f.tipoMovimiento === "GASTO" ? "#FEE2E2" : "#D1FAE5",
                      color: f.tipoMovimiento === "GASTO" ? "#EF4444" : "#10B981",
                    }}>
                    {f.tipoMovimiento === "GASTO" ? "Gasto" : "Ingreso"}
                  </span>
                  <span className="text-sm font-bold text-right" style={{
                    color: f.tipoMovimiento === "GASTO" ? "#EF4444" : "#10B981",
                    fontFamily: "DM Mono, monospace",
                  }}>
                    {fmt(f.monto, f.moneda)}
                  </span>
                </div>
              ))}

              {/* Mobile cards */}
              {reporte.facturas.map((f, idx) => (
                <div key={`m-${f.id}`}
                  className="md:hidden px-5 py-4"
                  style={{ borderBottom: idx < reporte.facturas.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold" style={{ color: "var(--charcoal)" }}>{f.proveedorTexto}</span>
                    <span className="text-sm font-bold" style={{
                      color: f.tipoMovimiento === "GASTO" ? "#EF4444" : "#10B981",
                      fontFamily: "DM Mono, monospace",
                    }}>{fmt(f.monto, f.moneda)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {f.fecha ? new Date(f.fecha).toLocaleDateString("es-HN") : "—"}
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: f.tipoMovimiento === "GASTO" ? "#FEE2E2" : "#D1FAE5",
                        color: f.tipoMovimiento === "GASTO" ? "#EF4444" : "#10B981",
                      }}>
                      {f.tipoMovimiento}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones compartir */}
          <div className="card p-6">
            <h3 className="font-bold text-base mb-1" style={{ color: "var(--charcoal)" }}>
              Compartir reporte
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
              Descarga el PDF o envía el resumen directo por WhatsApp a tu contadora
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              {/* PDF */}
              <button
                onClick={descargarPDF}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0B2D52 0%, #1e4a7a 100%)",
                  boxShadow: "0 4px 15px rgba(11,45,82,0.25)",
                  fontSize: 14,
                }}
              >
                <Download size={17} />
                Descargar PDF
              </button>

              {/* WhatsApp */}
              <div className="flex flex-1 gap-2">
                <input
                  type="tel"
                  placeholder="Número WhatsApp (ej: 50498765432)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="flex-1 rounded-xl px-4 focus:outline-none text-sm"
                  style={{
                    height: 50,
                    border: "1.5px solid var(--border)",
                    background: "var(--off-white)",
                    color: "var(--charcoal)",
                  }}
                />
                <button
                  onClick={enviarWhatsApp}
                  disabled={enviando}
                  className="flex items-center gap-2 px-5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    height: 50,
                    background: "#25D366",
                    boxShadow: "0 4px 15px rgba(37,211,102,0.3)",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {enviando ? "Enviando..." : "WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {reporte && reporte.facturas.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--off-white)" }}>
            <FileText size={28} style={{ color: "var(--muted)" }} />
          </div>
          <p className="font-bold text-lg" style={{ color: "var(--charcoal)" }}>
            Sin facturas en este período
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No se encontraron facturas para {MESES[mes - 1]} {anio}
          </p>
        </div>
      )}
    </div>
  );
}