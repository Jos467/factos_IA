// src/components/facturas/FileUpload.tsx
// Versión corregida — envía URL pública al OCR en lugar del archivo en base64

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { validateUploadedFile } from "@/lib/security/file-upload";
import { cn } from "@/lib/utils";
import type { DatosFacturaOCR } from "@/lib/services/ocr";

interface FileUploadProps {
  userId:           string;
  onUploadComplete: (url: string, tipo: string) => void;
  onUploadError:    (error: string) => void;
  onOCRComplete?:   (datos: DatosFacturaOCR) => void;
}

type UploadState = "idle" | "uploading" | "analyzing" | "done" | "error";

export function FileUpload({
  userId,
  onUploadComplete,
  onUploadError,
  onOCRComplete,
}: FileUploadProps) {
  const [isDragging,   setIsDragging]   = useState(false);
  const [uploadState,  setUploadState]  = useState<UploadState>("idle");
  const [preview,      setPreview]      = useState<{ url: string; tipo: string; nombre: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // 1. Validar con Magic Numbers (A04)
    const validation = await validateUploadedFile(file);
    if (!validation.valid) {
      onUploadError(validation.error);
      return;
    }

    setUploadState("uploading");

    try {
      // 2. Subir a Supabase Storage
      const ext  = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error } = await supabaseClient.storage
        .from("facturas")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (error) throw new Error(error.message);

      const { data: urlData } = supabaseClient.storage
        .from("facturas")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      setPreview({ url: publicUrl, tipo: file.type, nombre: file.name });
      onUploadComplete(publicUrl, file.type);

      // 3. Enviar URL al OCR (el servidor descarga y analiza)
      if (onOCRComplete) {
        setUploadState("analyzing");

        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: publicUrl, mimeType: file.type }),
        });

        if (res.ok) {
          const { datos } = await res.json();
          onOCRComplete(datos);
        } else {
          const { error } = await res.json();
          console.error("OCR error:", error);
          onOCRComplete({
            proveedor: null, fecha: null, monto: null,
            numeroFactura: null, categoria: null, tipoDocumento: null,
            observaciones: null, confianza: "baja",
          });
        }
      }

      setUploadState("done");

    } catch (e) {
      console.error("Upload error:", e);
      setUploadState("error");
      onUploadError("Error al subir el archivo. Intenta de nuevo.");
    }
  }, [userId, onUploadComplete, onUploadError, onOCRComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    setPreview(null);
    setUploadState("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Estado: archivo subido
  if (preview) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className="relative flex items-center gap-4 p-4 rounded-xl border"
          style={{ borderColor: "var(--cyan)", background: "var(--cyan-muted)" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white">
            {preview.tipo.startsWith("image/") ? (
              <ImageIcon size={22} style={{ color: "var(--cyan)" }} />
            ) : (
              <FileText size={22} style={{ color: "var(--navy)" }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--charcoal)" }}>
              {preview.nombre}
            </p>
            <p className="text-xs" style={{ color: "var(--cyan)" }}>
              Archivo subido ✓
            </p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X size={16} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {/* Estado del análisis IA */}
        {uploadState === "analyzing" && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#fef3c7", border: "1px solid #fde68a" }}
          >
            <Loader2 size={16} className="animate-spin" style={{ color: "#d97706" }} />
            <span style={{ color: "#92400e" }}>
              Analizando factura con IA... esto puede tomar unos segundos
            </span>
          </div>
        )}

        {uploadState === "done" && onOCRComplete && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}
          >
            <Sparkles size={16} style={{ color: "var(--success)" }} />
            <span style={{ color: "#065f46" }}>
              IA completó los campos — revisa y confirma antes de guardar
            </span>
          </div>
        )}
      </div>
    );
  }

  // Estado: zona de drop
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
        isDragging
          ? "border-[#1A9FB4] bg-[#e0f5f8]"
          : "border-[#E2E8F0] hover:border-[#1A9FB4] hover:bg-[#f8fdfe] bg-white"
      )}
    >
      {uploadState === "uploading" ? (
        <>
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--cyan)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--cyan)" }}>
            Subiendo archivo...
          </p>
        </>
      ) : (
        <>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--off-white)" }}
          >
            <Upload size={24} style={{ color: "var(--navy)" }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--charcoal)" }}>
              Arrastra tu factura aquí
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              o haz clic para seleccionar
            </p>
            <div
              className="flex items-center justify-center gap-1.5 mt-2 text-xs font-medium"
              style={{ color: "var(--cyan)" }}
            >
              <Sparkles size={12} />
              La IA llenará los campos automáticamente
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              JPG, PNG o PDF · Máximo 5MB
            </p>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
