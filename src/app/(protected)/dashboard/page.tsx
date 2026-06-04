// src/app/(protected)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

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

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();

  // Consultas en paralelo
  const [totalFacturas, facturasDelMes, ultimasFacturas, gastosMes, ingresosMes] =
    await Promise.all([
      // Total de facturas del usuario
      prisma.factura.count({ where: { userId } }),

      // Facturas del mes actual
      prisma.factura.count({ where: { userId, mes, anio } }),

      // Últimas 5 facturas
      prisma.factura.findMany({
        where: { userId },
        orderBy: { created_at: "desc" },
        take: 5,
        include: { categoria: true },
      }),

      // Total gastos del mes
      prisma.factura.aggregate({
        where: { userId, mes, anio, tipoMovimiento: "GASTO" },
        _sum: { monto: true },
      }),

      // Total ingresos del mes
      prisma.factura.aggregate({
        where: { userId, mes, anio, tipoMovimiento: "INGRESO" },
        _sum: { monto: true },
      }),
    ]);

  const totalGastos = Number(gastosMes._sum.monto ?? 0);
  const totalIngresos = Number(ingresosMes._sum.monto ?? 0);
  const nombreMes = now.toLocaleString("es-HN", { month: "long" });

  const stats = [
    {
      label: "Total facturas",
      value: totalFacturas.toString(),
      sub: "Todas las facturas registradas",
      icon: FileText,
      color: "var(--navy)",
      bg: "#eef2f7",
      delay: "fade-up-delay-1",
    },
    {
      label: `Facturas de ${nombreMes}`,
      value: facturasDelMes.toString(),
      sub: "Registradas este mes",
      icon: Clock,
      color: "var(--cyan)",
      bg: "var(--cyan-muted)",
      delay: "fade-up-delay-2",
    },
    {
      label: `Gastos de ${nombreMes}`,
      value: formatMoney(totalGastos),
      sub: "Total gastado este mes",
      icon: TrendingDown,
      color: "#ef4444",
      bg: "#fee2e2",
      delay: "fade-up-delay-3",
    },
    {
      label: `Ingresos de ${nombreMes}`,
      value: formatMoney(totalIngresos),
      sub: "Total ingresado este mes",
      icon: TrendingUp,
      color: "var(--success)",
      bg: "#d1fae5",
      delay: "fade-up-delay-4",
    },
  ];

  return (
    <>
      <Topbar
        title={`Hola, ${session.user.name?.split(" ")[0]} 👋`}
        subtitle={`Resumen de ${nombreMes} ${anio}`}
      />

      <div className="flex-1 p-8 flex flex-col gap-8">

        {/* ── Stats ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map(({ label, value, sub, icon: Icon, color, bg, delay }) => (
            <div key={label} className={`stat-card fade-up ${delay}`}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>
                {value}
              </p>
              <p className="text-sm font-medium mb-0.5" style={{ color: "var(--charcoal)" }}>
                {label}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {sub}
              </p>
            </div>
          ))}
        </section>

        {/* ── Últimas facturas ── */}
        <section className="card fade-up fade-up-delay-2">
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="font-semibold text-base" style={{ color: "var(--charcoal)" }}>
                Últimas facturas
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Las 5 más recientes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/facturas/nueva"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "var(--navy)" }}
              >
                <Plus size={15} />
                Nueva
              </Link>
              <Link
                href="/facturas"
                className="flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: "var(--cyan)" }}
              >
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {ultimasFacturas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--off-white)" }}
              >
                <FileText size={24} style={{ color: "var(--muted)" }} />
              </div>
              <p className="font-medium" style={{ color: "var(--charcoal)" }}>
                Sin facturas aún
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Sube tu primera factura para comenzar
              </p>
              <Link
                href="/facturas/nueva"
                className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--navy)" }}
              >
                Subir factura
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {ultimasFacturas.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Icono categoría */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{
                      background: f.categoria?.color
                        ? `${f.categoria.color}20`
                        : "var(--off-white)",
                    }}
                  >
                    {f.categoria?.icono ?? "📄"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--charcoal)" }}>
                      {f.proveedorTexto ?? f.numeroFactura ?? "Sin proveedor"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                      {f.categoria?.nombre ?? "Sin categoría"} ·{" "}
                      {f.fecha ? formatDate(f.fecha) : "Sin fecha"}
                    </p>
                  </div>

                  {/* Monto */}
                  <div className="text-right shrink-0">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: f.tipoMovimiento === "INGRESO"
                          ? "var(--success)"
                          : "var(--charcoal)",
                      }}
                    >
                      {f.tipoMovimiento === "INGRESO" ? "+" : "-"}
                      {formatMoney(Number(f.monto))}
                    </p>
                    <span className={ESTADO_BADGE[f.estado]}>
                      {ESTADO_LABEL[f.estado]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
