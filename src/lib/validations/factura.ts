// src/lib/validations/factura.ts
import { z } from "zod";

export const facturaSchema = z.object({
  fecha:           z.string().min(1, "La fecha es requerida"),
  proveedorTexto:  z.string().min(1, "El proveedor es requerido").max(200),
  monto:           z.string().min(1, "El monto es requerido")
                    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Monto inválido"),
  moneda:          z.string().min(1),
  categoriaId:     z.string().optional(),
  tipoDocumentoId: z.string().optional(),
  tipoMovimiento:  z.enum(["GASTO", "INGRESO"]),
  numeroFactura:   z.string().max(100).optional(),
  facturaFisica:   z.boolean(),
  observaciones:   z.string().max(1000).optional(),
});

export type FacturaInput = z.infer<typeof facturaSchema>;