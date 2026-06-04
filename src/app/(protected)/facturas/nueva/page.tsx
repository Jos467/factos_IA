// src/app/(protected)/facturas/nueva/page.tsx
import { prisma } from "@/lib/prisma";
import { NuevaFacturaForm } from "@/components/facturas/NuevaFacturaForm";
import { Topbar } from "@/components/layout/Topbar";

export default async function NuevaFacturaPage() {
  const [categorias, tiposDocumento] = await Promise.all([
    prisma.categoriaGasto.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
    prisma.tipoDocumento.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <>
      <Topbar title="Nueva Factura" subtitle="Registra los datos de tu factura" />
      <NuevaFacturaForm categorias={categorias} tiposDocumento={tiposDocumento} />
    </>
  );
}