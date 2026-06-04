// src/app/api/ocr/route.ts
// Recibe la URL pública del archivo ya subido en Supabase Storage
// Lo descarga en el servidor y lo envía a Gemini en base64

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analizarFacturaConIA } from "@/lib/services/ocr";

export async function POST(req: NextRequest) {
  // Verificar sesión
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url, mimeType } = body as { url: string; mimeType: string };

    if (!url || !mimeType) {
      return NextResponse.json({ error: "URL y mimeType son requeridos" }, { status: 400 });
      console.log("=== OCR REQUEST ===");
console.log("URL:", url);
console.log("MimeType:", mimeType);

const fileResponse = await fetch(url);
console.log("Fetch status:", fileResponse.status);
console.log("Fetch ok:", fileResponse.ok);
    }

    // Validar tipo
    const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];
    if (!tiposPermitidos.includes(mimeType)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    // Descargar el archivo desde Supabase Storage en el servidor
    const fileResponse = await fetch(url);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "No se pudo descargar el archivo" }, { status: 400 });
    }

    // Convertir a base64
    const arrayBuffer = await fileResponse.arrayBuffer();
    const base64Data  = Buffer.from(arrayBuffer).toString("base64");

    // Validar tamaño (5MB)
    if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 400 });
    }

    // Analizar con Gemini
    const datos = await analizarFacturaConIA(
      base64Data,
      mimeType as "image/jpeg" | "image/png" | "application/pdf"
    );

    return NextResponse.json({ success: true, datos });

  } catch (error) {
    console.error("Error en OCR route:", error);
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}

