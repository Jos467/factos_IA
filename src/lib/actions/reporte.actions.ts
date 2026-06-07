// src/lib/actions/reporte.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function obtenerReporteMensual(mes: number, anio: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const facturas = await prisma.factura.findMany({
    where: { userId: session.user.id, mes, anio },
    include: { categoria: true, tipoDocumento: true },
    orderBy: { fecha: "asc" },
  });

  const serialized = facturas.map((f) => ({
    id: f.id,
    proveedorTexto: f.proveedorTexto ?? "",
    fecha: f.fecha ? f.fecha.toISOString() : null,
    monto: Number(f.monto),
    moneda: f.moneda,
    tipoMovimiento: f.tipoMovimiento,
    numeroFactura: f.numeroFactura ?? null,
    facturaFisica: f.facturaFisica,
    observaciones: f.observaciones ?? null,
    archivoUrl: f.archivoUrl ?? null,
    estado: f.estado,
    categoria: f.categoria
      ? { nombre: f.categoria.nombre, icono: f.categoria.icono ?? "", color: f.categoria.color ?? "" }
      : null,
    tipoDocumento: f.tipoDocumento ? { nombre: f.tipoDocumento.nombre } : null,
  }));

  const totalGastos = serialized
    .filter((f) => f.tipoMovimiento === "GASTO")
    .reduce((acc, f) => acc + f.monto, 0);

  const totalIngresos = serialized
    .filter((f) => f.tipoMovimiento === "INGRESO")
    .reduce((acc, f) => acc + f.monto, 0);

  const porCategoria: Record<string, { nombre: string; icono: string; color: string; total: number; cantidad: number }> = {};
  for (const f of serialized) {
    if (f.tipoMovimiento !== "GASTO") continue;
    const key = f.categoria?.nombre ?? "Sin categoría";
    if (!porCategoria[key]) {
      porCategoria[key] = {
        nombre: key,
        icono: f.categoria?.icono ?? "📦",
        color: f.categoria?.color ?? "#94A3B8",
        total: 0,
        cantidad: 0,
      };
    }
    porCategoria[key].total += f.monto;
    porCategoria[key].cantidad += 1;
  }

  return {
    facturas: serialized,
    totalGastos,
    totalIngresos,
    balance: totalIngresos - totalGastos,
    porCategoria: Object.values(porCategoria).sort((a, b) => b.total - a.total),
    mes,
    anio,
  };
}

export async function registrarEnvioWhatsApp(
  mes: number,
  anio: number,
  destinatario: string,
  facturaIds: string[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  await prisma.envio.create({
    data: {
      userId: session.user.id,
      destinatario,
      medioEnvio: "WHATSAPP",
      estado: "ENVIADO",
      mes,
      anio,
      envioFacturas: {
        create: facturaIds.map((facturaId) => ({ facturaId })),
      },
    },
  });

  revalidatePath("/envios");
}

export async function obtenerHistorialEnvios() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const envios = await prisma.envio.findMany({
    where: { userId: session.user.id },
    include: {
      envioFacturas: { include: { factura: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return envios.map((e) => ({
    id: e.id,
    destinatario: e.destinatario,
    medioEnvio: e.medioEnvio,
    estado: e.estado,
    mes: e.mes,
    anio: e.anio,
    created_at: e.created_at.toISOString(),
    cantidadFacturas: e.envioFacturas.length,
    totalMonto: e.envioFacturas.reduce(
      (acc, ef) => acc + Number(ef.factura.monto),
      0
    ),
  }));
}