// src/app/(protected)/facturas/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { FacturasTable } from "@/components/facturas/FacturasTable";
import { FacturasFiltros } from "@/components/facturas/FacturasFiltros";
import { Plus, TrendingDown, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ mes?: string; anio?: string; categoriaId?: string }>;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", minimumFractionDigits: 2 }).format(n);
}

export default async function FacturasPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const mes  = params.mes  ? Number(params.mes)  : now.getMonth() + 1;
  const anio = params.anio ? Number(params.anio) : now.getFullYear();
  const categoriaId = params.categoriaId ? Number(params.categoriaId) : undefined;

  const [facturas, categorias] = await Promise.all([
    prisma.factura.findMany({
      where: {
        userId: session.user.id,
        mes, anio,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: { categoria: true, tipoDocumento: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.categoriaGasto.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  const totalGastos   = facturas.filter(f => f.tipoMovimiento === "GASTO").reduce((s, f) => s + Number(f.monto), 0);
  const totalIngresos = facturas.filter(f => f.tipoMovimiento === "INGRESO").reduce((s, f) => s + Number(f.monto), 0);
  const balance       = totalIngresos - totalGastos;

  const facturasSerializadas = facturas.map((f) => ({
    ...f,
    monto:      Number(f.monto),
    fecha:      f.fecha?.toISOString() ?? null,
    created_at: f.created_at.toISOString(),
    updated_at: f.updated_at.toISOString(),
  }));

  return (
    <>
      <Topbar
        title="Facturas"
        subtitle={`${MESES[mes - 1]} ${anio} · ${facturas.length} registro${facturas.length !== 1 ? "s" : ""}`}
      />
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">

        {/* Filtros + botón nueva */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <FacturasFiltros
            mesActual={mes}
            anioActual={anio}
            categoriaIdActual={categoriaId}
            categorias={categorias}
          />
          <Link
            href="/facturas/nueva"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shrink-0 hover:opacity-90 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #006877 0%, #1A9FB4 100%)",
              boxShadow: "0 4px 15px rgba(26,159,180,0.3)",
            }}
          >
            <Plus size={16} /> Nueva Factura
          </Link>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total facturas",
              value: facturas.length.toString(),
              icon: FileText,
              iconColor: "var(--navy)",
              iconBg: "#EEF2F7",
              valueColor: "var(--charcoal)",
            },
            {
              label: "Total gastos",
              value: formatMoney(totalGastos),
              icon: TrendingDown,
              iconColor: "#EF4444",
              iconBg: "#FEE2E2",
              valueColor: "#EF4444",
            },
            {
              label: "Total ingresos",
              value: formatMoney(totalIngresos),
              icon: TrendingUp,
              iconColor: "#10B981",
              iconBg: "#D1FAE5",
              valueColor: "#10B981",
            },
          ].map(({ label, value, icon: Icon, iconColor, iconBg, valueColor }) => (
            <div key={label} className="card px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}>
                <Icon size={18} style={{ color: iconColor }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted)" }}>{label}</p>
                <p className="text-lg font-bold" style={{ color: valueColor, fontFamily: "DM Mono, monospace" }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Balance */}
        <div
          className="rounded-2xl px-6 py-4 flex items-center justify-between"
          style={{
            background: balance >= 0
              ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
              : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
          }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Balance del período
            </p>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "DM Mono, monospace" }}>
              {formatMoney(balance)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)" }}>
            {balance >= 0
              ? <TrendingUp size={22} color="white" />
              : <TrendingDown size={22} color="white" />}
          </div>
        </div>

        {/* Tabla */}
        <FacturasTable facturas={facturasSerializadas} />
      </div>
    </>
  );
}
