// src/app/(protected)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import {
  FileText, TrendingUp, TrendingDown, Wallet,
  ArrowRight, Plus, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", minimumFractionDigits: 2 }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BORRADOR: { bg: "#FEF3C7", color: "#D97706", label: "Borrador" },
  COMPLETA: { bg: "#D1FAE5", color: "#059669", label: "Completa" },
  ENVIADA:  { bg: "#E0F5F8", color: "#0E7490", label: "Enviada"  },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();
  const nombreMes = now.toLocaleString("es-HN", { month: "long" });

  // Últimos 6 meses para tendencia
  const meses6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anio, mes - 1 - (5 - i), 1);
    return { mes: d.getMonth() + 1, anio: d.getFullYear(), label: d.toLocaleString("es-HN", { month: "short" }) };
  });

  const [totalFacturas, facturasDelMes, ultimasFacturas, gastosMes, ingresosMes, porCategoria, tendenciaRaw] =
    await Promise.all([
      prisma.factura.count({ where: { userId } }),
      prisma.factura.count({ where: { userId, mes, anio } }),
      prisma.factura.findMany({
        where: { userId },
        orderBy: { created_at: "desc" },
        take: 5,
        include: { categoria: true },
      }),
      prisma.factura.aggregate({
        where: { userId, mes, anio, tipoMovimiento: "GASTO" },
        _sum: { monto: true },
      }),
      prisma.factura.aggregate({
        where: { userId, mes, anio, tipoMovimiento: "INGRESO" },
        _sum: { monto: true },
      }),
      // Gastos por categoría del mes
      prisma.factura.groupBy({
        by: ["categoriaId"],
        where: { userId, mes, anio, tipoMovimiento: "GASTO" },
        _sum: { monto: true },
      }),
      // Tendencia 6 meses
      Promise.all(
        meses6.map(async (m) => ({
          ...m,
          gastos: Number((await prisma.factura.aggregate({
            where: { userId, mes: m.mes, anio: m.anio, tipoMovimiento: "GASTO" },
            _sum: { monto: true },
          }))._sum.monto ?? 0),
          ingresos: Number((await prisma.factura.aggregate({
            where: { userId, mes: m.mes, anio: m.anio, tipoMovimiento: "INGRESO" },
            _sum: { monto: true },
          }))._sum.monto ?? 0),
        }))
      ),
    ]);

  const totalGastos   = Number(gastosMes._sum.monto ?? 0);
  const totalIngresos = Number(ingresosMes._sum.monto ?? 0);
  const balance       = totalIngresos - totalGastos;

  // Enriquecer categorías
  const categoriasIds = porCategoria.map(c => c.categoriaId).filter(Boolean) as number[];
  const categoriasData = await prisma.categoriaGasto.findMany({ where: { id: { in: categoriasIds } } });
  const catMap = Object.fromEntries(categoriasData.map(c => [c.id, c]));

  const porCategoriaChart = porCategoria
    .map(c => ({
      nombre: c.categoriaId ? (catMap[c.categoriaId]?.nombre ?? "Sin categoría") : "Sin categoría",
      icono:  c.categoriaId ? (catMap[c.categoriaId]?.icono  ?? "📦") : "📦",
      color:  c.categoriaId ? (catMap[c.categoriaId]?.color  ?? "#94A3B8") : "#94A3B8",
      total:  Number(c._sum.monto ?? 0),
    }))
    .sort((a, b) => b.total - a.total);

  const tendencia = tendenciaRaw.map(t => ({
    mes: t.label,
    gastos: t.gastos,
    ingresos: t.ingresos,
  }));

  const stats = [
    {
      label: "Total Facturas",
      value: totalFacturas.toLocaleString(),
      sub: "Todas las registradas",
      icon: FileText,
      iconColor: "var(--navy)",
      iconBg: "#EEF2F7",
      trend: null,
    },
    {
      label: `Gastos — ${nombreMes}`,
      value: formatMoney(totalGastos),
      sub: "Egresos del mes",
      icon: TrendingDown,
      iconColor: "#EF4444",
      iconBg: "#FEE2E2",
      trend: { dir: "down", label: "vs mes anterior" },
    },
    {
      label: `Ingresos — ${nombreMes}`,
      value: formatMoney(totalIngresos),
      sub: "Entradas del mes",
      icon: TrendingUp,
      iconColor: "#10B981",
      iconBg: "#D1FAE5",
      trend: { dir: "up", label: "vs mes anterior" },
    },
    {
      label: "Balance neto",
      value: formatMoney(balance),
      sub: "Ingresos − Gastos",
      icon: Wallet,
      iconColor: balance >= 0 ? "#10B981" : "#EF4444",
      iconBg: balance >= 0 ? "#D1FAE5" : "#FEE2E2",
      trend: null,
    },
  ];

  return (
    <>
      <Topbar
        title={`Bienvenido, ${session.user.name?.split(" ")[0]} 👋`}
        subtitle={`Resumen financiero de ${nombreMes} ${anio}`}
      />

      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">

        {/* ── Stats grid ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, value, sub, icon: Icon, iconColor, iconBg, trend }) => (
            <div key={label} className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                {trend && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: trend.dir === "up" ? "#D1FAE5" : "#FEE2E2" }}>
                    {trend.dir === "up"
                      ? <ArrowUpRight size={12} style={{ color: "#10B981" }} />
                      : <ArrowDownRight size={12} style={{ color: "#EF4444" }} />}
                    <span className="text-xs font-bold" style={{ color: trend.dir === "up" ? "#10B981" : "#EF4444" }}>
                      Este mes
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--charcoal)", fontFamily: "DM Mono, monospace" }}>
                  {value}
                </p>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--charcoal)" }}>{label}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Charts ── */}
        <DashboardCharts porCategoria={porCategoriaChart} tendencia={tendencia} />

        {/* ── Últimas facturas ── */}
        <section className="card">
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="font-bold text-base" style={{ color: "var(--charcoal)" }}>Facturas recientes</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Las 5 más recientes</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/facturas/nueva"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--navy)" }}>
                <Plus size={15} /> Nueva
              </Link>
              <Link href="/facturas"
                className="flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: "var(--cyan)" }}>
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {ultimasFacturas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--off-white)" }}>
                <FileText size={24} style={{ color: "var(--muted)" }} />
              </div>
              <p className="font-semibold" style={{ color: "var(--charcoal)" }}>Sin facturas aún</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Sube tu primera factura para comenzar</p>
              <Link href="/facturas/nueva"
                className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--navy)" }}>
                Subir factura
              </Link>
            </div>
          ) : (
            <div>
              {ultimasFacturas.map((f, idx) => {
                const estado = ESTADO_STYLES[f.estado] ?? ESTADO_STYLES.BORRADOR;
                return (
                  <div key={f.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                    style={{ borderBottom: idx < ultimasFacturas.length - 1 ? "1px solid var(--border)" : "none" }}>
                    {/* Avatar categoría */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: f.categoria?.color ? `${f.categoria.color}20` : "var(--off-white)" }}>
                      {f.categoria?.icono ?? "📄"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--charcoal)" }}>
                        {f.proveedorTexto ?? f.numeroFactura ?? "Sin proveedor"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                        {f.categoria?.nombre ?? "Sin categoría"} · {f.fecha ? formatDate(f.fecha) : "Sin fecha"}
                      </p>
                    </div>

                    {/* Estado */}
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: estado.bg, color: estado.color }}>
                      {estado.label}
                    </span>

                    {/* Monto */}
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold" style={{
                        color: f.tipoMovimiento === "INGRESO" ? "#10B981" : "var(--charcoal)",
                        fontFamily: "DM Mono, monospace",
                      }}>
                        {f.tipoMovimiento === "INGRESO" ? "+" : "−"}{formatMoney(Number(f.monto))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}