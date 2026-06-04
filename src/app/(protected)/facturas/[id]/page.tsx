// src/app/(protected)/facturas/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { obtenerFacturaPorId } from "@/lib/actions/factura.actions";
import { Topbar } from "@/components/layout/Topbar";
import { ArrowLeft, Pencil, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency", currency: "HNL", minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(new Date(d));
}

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR: "badge badge-warning",
  COMPLETA: "badge badge-success",
  ENVIADA:  "badge badge-info",
};

interface Props { params: Promise<{ id: string }> }

export default async function DetalleFacturaPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const factura = await obtenerFacturaPorId(id);
  if (!factura) notFound();

  return (
    <>
      <Topbar title="Detalle de Factura" subtitle={factura.proveedorTexto ?? ""} />
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full">

        <div className="flex items-center justify-between mb-6">
          <Link
            href="/facturas"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft size={16} /> Volver
          </Link>
          <Link
            href={`/facturas/${id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--navy)" }}
          >
            <Pencil size={15} /> Editar
          </Link>
        </div>

        <div className="flex flex-col gap-5">

          {/* Header card */}
          <div className="card p-6 flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{
                background: factura.categoria?.color
                  ? `${factura.categoria.color}20`
                  : "var(--off-white)",
              }}
            >
              {factura.categoria?.icono ?? "📄"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
                {factura.proveedorTexto ?? "Sin proveedor"}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                {factura.categoria?.nombre ?? "Sin categoría"} ·{" "}
                {factura.fecha ? formatDate(factura.fecha) : "Sin fecha"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-2xl font-bold"
                style={{ color: factura.tipoMovimiento === "INGRESO" ? "var(--success)" : "var(--charcoal)" }}
              >
                {factura.tipoMovimiento === "INGRESO" ? "+" : "-"}
                {formatMoney(Number(factura.monto))}
              </p>
              <span className={ESTADO_BADGE[factura.estado]}>{factura.estado}</span>
            </div>
          </div>

          {/* Detalles */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
              Información detallada
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Número de factura", value: factura.numeroFactura ?? "—" },
                { label: "Moneda",            value: factura.moneda },
                { label: "Tipo",              value: factura.tipoMovimiento },
                { label: "Tipo de documento", value: factura.tipoDocumento?.nombre ?? "—" },
                { label: "Factura física",    value: factura.facturaFisica ? "Sí" : "No" },
                { label: "Datos confirmados", value: factura.datosConfirmados ? "Sí" : "Pendiente" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "var(--muted)" }}>
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold" style={{ color: "var(--charcoal)" }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Observaciones */}
          {factura.observaciones && (
            <div className="card p-6">
              <h3 className="font-semibold mb-3" style={{ color: "var(--navy)" }}>
                Observaciones
              </h3>
              <p className="text-sm" style={{ color: "var(--charcoal)" }}>
                {factura.observaciones}
              </p>
            </div>
          )}

          {/* Archivo adjunto */}
          {factura.archivoUrl && (
            <div className="card p-6">
              <h3 className="font-semibold mb-3" style={{ color: "var(--navy)" }}>
                Archivo adjunto
              </h3>
              {factura.archivoTipo?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={factura.archivoUrl}
                  alt="Factura"
                  className="rounded-xl max-h-96 object-contain border"
                  style={{ borderColor: "var(--border)" }}
                />
              ) : (
                <a
                  href={factura.archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: "var(--off-white)",
                    color: "var(--navy)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <FileText size={18} />
                  Ver PDF de la factura
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
