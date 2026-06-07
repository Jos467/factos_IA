// src/components/dashboard/DashboardCharts.tsx
"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

type Props = {
  porCategoria: { nombre: string; icono: string; color: string; total: number }[];
  tendencia: { mes: string; gastos: number; ingresos: number }[];
};

const COLORS_FALLBACK = ["#1A9FB4","#0B2D52","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#14B8A6"];

function fmt(n: number) {
  if (n >= 1000) return `L ${(n / 1000).toFixed(1)}k`;
  return `L ${n.toFixed(0)}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl shadow-xl px-4 py-3" style={{ background: "#fff", border: "1px solid #E2E8F0", minWidth: 160 }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#94A3B8" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs font-medium" style={{ color: "#1E293B" }}>{p.name}</span>
          </div>
          <span className="text-xs font-bold" style={{ color: p.color, fontFamily: "DM Mono, monospace" }}>
            L {p.value.toLocaleString("es-HN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-2xl shadow-xl px-4 py-3" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
      <p className="text-xs font-bold" style={{ color: "#1E293B" }}>{d.name}</p>
      <p className="text-xs font-bold mt-1" style={{ color: d.payload.color || "#1A9FB4", fontFamily: "DM Mono, monospace" }}>
        L {d.value.toLocaleString("es-HN", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function DashboardCharts({ porCategoria, tendencia }: Props) {
  const hasTendencia = tendencia.some(t => t.gastos > 0 || t.ingresos > 0);
  const hasCategorias = porCategoria.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

      {/* ── Área chart — tendencia 6 meses ── */}
      <div className="xl:col-span-3 card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base" style={{ color: "var(--charcoal)" }}>Tendencia financiera</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Últimos 6 meses</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Gastos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Ingresos</span>
            </div>
          </div>
        </div>

        {hasTendencia ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tendencia} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#EF4444" strokeWidth={2.5}
                fill="url(#gradGastos)" dot={false} activeDot={{ r: 5, fill: "#EF4444", stroke: "#fff", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10B981" strokeWidth={2.5}
                fill="url(#gradIngresos)" dot={false} activeDot={{ r: 5, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-52 gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Sin datos suficientes aún</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Registra facturas para ver tu tendencia</p>
          </div>
        )}
      </div>

      {/* ── Pie chart — gastos por categoría ── */}
      <div className="xl:col-span-2 card p-6">
        <div className="mb-6">
          <h3 className="font-bold text-base" style={{ color: "var(--charcoal)" }}>Gastos por categoría</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Mes actual</p>
        </div>

        {hasCategorias ? (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={porCategoria}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="nombre"
                >
                  {porCategoria.map((cat, i) => (
                    <Cell key={cat.nombre} fill={cat.color || COLORS_FALLBACK[i % COLORS_FALLBACK.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda custom */}
            <div className="space-y-2 mt-2">
              {porCategoria.slice(0, 5).map((cat, i) => {
                const color = cat.color || COLORS_FALLBACK[i % COLORS_FALLBACK.length];
                const total = porCategoria.reduce((a, c) => a + c.total, 0);
                const pct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
                return (
                  <div key={cat.nombre} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs font-medium truncate" style={{ color: "var(--charcoal)", maxWidth: 100 }}>
                        {cat.icono} {cat.nombre}
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-52 gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Sin gastos este mes</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Registra facturas para ver la distribución</p>
          </div>
        )}
      </div>
    </div>
  );
}