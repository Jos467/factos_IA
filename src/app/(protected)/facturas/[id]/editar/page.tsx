// src/app/(protected)/facturas/[id]/editar/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { obtenerFacturaPorId } from "@/lib/actions/factura.actions";
import { EditarFacturaForm } from "@/components/facturas/EditarFacturaForm";
import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ id: string }> }

export default async function EditarFacturaPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const [factura, categorias, tiposDocumento] = await Promise.all([
    obtenerFacturaPorId(id),
    prisma.categoriaGasto.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
    prisma.tipoDocumento.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  if (!factura) notFound();

  return (
    <>
      <Topbar title="Editar Factura" subtitle={factura.proveedorTexto ?? ""} />
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <Link
          href={`/facturas/${id}`}
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={16} /> Volver al detalle
        </Link>
        <EditarFacturaForm
          factura={factura}
          categorias={categorias}
          tiposDocumento={tiposDocumento}
        />
      </div>
    </>
  );
}
