// src/app/(protected)/facturas/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { FacturasTable } from "@/components/facturas/FacturasTable";
import { FacturasFiltros } from "@/components/facturas/FacturasFiltros";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ mes?: string; anio?: string; categoriaId?: string }>;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

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
        mes,
        anio,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: { categoria: true, tipoDocumento: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.categoriaGasto.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  const totalGastos   = facturas.filter(f => f.tipoMovimiento === "GASTO")
    .reduce((s, f) => s + Number(f.monto), 0);
  const totalIngresos = facturas.filter(f => f.tipoMovimiento === "INGRESO")
    .reduce((s, f) => s + Number(f.monto), 0);

    // Serializar Decimal y Date para Client Components
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
        subtitle={`${MESES[mes - 1]} ${anio} - ${facturas.length} registros`}
      />
      <div className="flex-1 p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <FacturasFiltros
            mesActual={mes}
            anioActual={anio}
            categoriaIdActual={categoriaId}
            categorias={categorias}
          />
          <Link
            href="/facturas/nueva"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
            style={{ background: "var(--navy)" }}
          >
            <Plus size={16} /> Nueva factura
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total facturas", value: facturas.length.toString(), color: "var(--navy)" },
            { label: "Total gastos",   value: `L ${totalGastos.toFixed(2)}`,   color: "#ef4444" },
            { label: "Total ingresos", value: `L ${totalIngresos.toFixed(2)}`, color: "var(--success)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card px-5 py-4">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{label}</p>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <FacturasTable facturas={facturasSerializadas} />
      </div>
    </>
  );
}
