// src/lib/actions/factura.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { facturaSchema, type FacturaInput } from "@/lib/validations/factura";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearFactura(
  data: FacturaInput,
  archivoUrl?: string,
  archivoTipo?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const parsed = facturaSchema.safeParse(data);
  if (!parsed.success) throw new Error("Datos inválidos");

  const { fecha, proveedorTexto, monto, moneda, categoriaId,
          tipoDocumentoId, tipoMovimiento, numeroFactura,
          facturaFisica, observaciones } = parsed.data;

  const fechaDate = new Date(fecha);
  const mes  = fechaDate.getMonth() + 1;
  const anio = fechaDate.getFullYear();

  await prisma.factura.create({
    data: {
      userId:          session.user.id,
      fecha:           fechaDate,
      proveedorTexto:  proveedorTexto.trim(),
      monto:           Number(monto),
      moneda,
      categoriaId:     categoriaId    ? Number(categoriaId)    : null,
      tipoDocumentoId: tipoDocumentoId ? Number(tipoDocumentoId) : null,
      tipoMovimiento,
      numeroFactura:   numeroFactura  || null,
      facturaFisica,
      observaciones:   observaciones || null,
      archivoUrl:      archivoUrl    || null,
      archivoTipo:     archivoTipo   || null,
      mes,
      anio,
      estado: "BORRADOR",
      datosConfirmados: false,
    },
  });

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function actualizarFactura(id: string, data: FacturaInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const factura = await prisma.factura.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!factura || factura.userId !== session.user.id)
    throw new Error("No autorizado");

  const parsed = facturaSchema.safeParse(data);
  if (!parsed.success) throw new Error("Datos inválidos");

  const { fecha, proveedorTexto, monto, moneda, categoriaId,
          tipoDocumentoId, tipoMovimiento, numeroFactura,
          facturaFisica, observaciones } = parsed.data;

  const fechaDate = new Date(fecha);

  await prisma.factura.update({
    where: { id },
    data: {
      fecha:           fechaDate,
      proveedorTexto:  proveedorTexto.trim(),
      monto:           Number(monto),
      moneda,
      categoriaId:     categoriaId    ? Number(categoriaId)    : null,
      tipoDocumentoId: tipoDocumentoId ? Number(tipoDocumentoId) : null,
      tipoMovimiento,
      numeroFactura:   numeroFactura  || null,
      facturaFisica,
      observaciones:   observaciones || null,
      mes:             fechaDate.getMonth() + 1,
      anio:            fechaDate.getFullYear(),
      datosConfirmados: true,
      estado: "COMPLETA",
    },
  });

  revalidatePath("/facturas");
  revalidatePath(`/facturas/${id}`);
  redirect("/facturas");
}

export async function eliminarFactura(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const factura = await prisma.factura.findUnique({
    where: { id },
    select: { userId: true, archivoUrl: true },
  });
  if (!factura || factura.userId !== session.user.id)
    throw new Error("No autorizado");

  if (factura.archivoUrl) {
    const path = factura.archivoUrl.split("/facturas/")[1];
    await getSupabaseAdmin().storage.from("facturas").remove([path]);
  }

  await prisma.factura.delete({ where: { id } });

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function obtenerFacturas(mes?: number, anio?: number, categoriaId?: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  return prisma.factura.findMany({
    where: {
      userId: session.user.id,
      ...(mes        ? { mes }        : {}),
      ...(anio       ? { anio }       : {}),
      ...(categoriaId ? { categoriaId } : {}),
    },
    include: { categoria: true, tipoDocumento: true },
    orderBy: { created_at: "desc" },
  });
}

export async function obtenerFacturaPorId(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { categoria: true, tipoDocumento: true },
  });

  if (!factura || factura.userId !== session.user.id) return null;
  return factura;
}
