// src/app/(protected)/envios/page.tsx
import { Topbar } from "@/components/layout/Topbar";
import { obtenerHistorialEnvios } from "@/lib/actions/reporte.actions";
import { MessageCircle, Send, Calendar } from "lucide-react";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function fmt(n: number) {
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(n);
}

export default async function EnviosPage() {
  const envios = await obtenerHistorialEnvios();

  return (
    <>
      <Topbar title="Historial de Envíos" subtitle="Registro de reportes enviados a tu contadora" />
      <div className="flex-1 p-6 md:p-8">

        {envios.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#e0f5f8" }}
            >
              <Send size={28} style={{ color: "var(--cyan)" }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: "var(--charcoal)" }}>
              Sin envíos todavía
            </p>
            <p className="text-sm text-center max-w-sm" style={{ color: "var(--muted)" }}>
              Cuando envíes un reporte mensual por WhatsApp aparecerá aquí el historial.
            </p>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="font-semibold mb-5" style={{ color: "var(--charcoal)" }}>
              {envios.length} envío{envios.length !== 1 ? "s" : ""} registrado{envios.length !== 1 ? "s" : ""}
            </h2>
            <div className="space-y-3">
              {envios.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border transition-colors hover:bg-slate-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Ícono + info */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#dcfce7" }}
                    >
                      <MessageCircle size={18} style={{ color: "#25D366" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                        {e.destinatario}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={12} style={{ color: "var(--muted)" }} />
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {e.mes && e.anio ? `${MESES[e.mes - 1]} ${e.anio}` : "—"}
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>·</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {new Date(e.created_at).toLocaleDateString("es-HN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats + badge */}
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Facturas</p>
                      <p className="text-sm font-bold" style={{ color: "var(--charcoal)" }}>{e.cantidadFacturas}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Total</p>
                      <p className="text-sm font-bold" style={{ color: "var(--charcoal)" }}>{fmt(e.totalMonto)}</p>
                    </div>
                    <span className="badge badge-success">Enviado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}