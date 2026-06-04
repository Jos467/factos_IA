// src/lib/services/ocr.ts
// Servicio de OCR con Gemini Vision
// Analiza imágenes y PDFs de facturas y extrae datos automáticamente

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DatosFacturaOCR {
  proveedor:      string | null;
  fecha:          string | null; // formato YYYY-MM-DD
  monto:          string | null; // número como string
  numeroFactura:  string | null;
  categoria:      string | null; // nombre sugerido
  tipoDocumento:  string | null; // FACTURA | RECIBO | TICKET | OTROS
  observaciones:  string | null;
  confianza:      "alta" | "media" | "baja";
}

const PROMPT = `Analiza esta imagen de factura/recibo/ticket y extrae los siguientes datos en formato JSON puro (sin markdown, sin backticks, solo el objeto JSON):

{
  "proveedor": "nombre del negocio o empresa emisora",
  "fecha": "fecha en formato YYYY-MM-DD",
  "monto": "monto total como número sin símbolo de moneda",
  "numeroFactura": "número o código de la factura si aparece",
  "categoria": "una de estas categorías según el tipo de gasto: Alimentación, Transporte, Servicios, Salud, Educación, Oficina, Entretenimiento, Viajes, Impuestos, Otros",
  "tipoDocumento": "FACTURA, RECIBO, TICKET u OTROS según corresponda",
  "observaciones": "cualquier dato relevante adicional que veas",
  "confianza": "alta si los datos son claros, media si hay dudas, baja si la imagen es ilegible"
}

Si no puedes identificar algún dato, usa null para ese campo.
Responde ÚNICAMENTE con el JSON, sin texto adicional.`;

export async function analizarFacturaConIA(
  base64Data: string,
  mimeType: "image/jpeg" | "image/png" | "application/pdf"
): Promise<DatosFacturaOCR> {
  try {
    console.log("=== Enviando a Gemini ===");
    console.log("MimeType:", mimeType);
    console.log("Base64 length:", base64Data.length);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      PROMPT,
    ]);

    const text = result.response.text().trim();
    console.log("=== GEMINI RAW RESPONSE ===");
    console.log(text);
    console.log("===========================");

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const datos = JSON.parse(clean) as DatosFacturaOCR;
    console.log("=== DATOS PARSEADOS ===", datos);
    return datos;

  } catch (error) {
    console.error("=== ERROR EN OCR ===", error);
    return {
      proveedor:     null,
      fecha:         null,
      monto:         null,
      numeroFactura: null,
      categoria:     null,
      tipoDocumento: null,
      observaciones: null,
      confianza:     "baja",
    };
  }
}