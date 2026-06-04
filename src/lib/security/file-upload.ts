// lib/security/file-upload.ts
// A04: Insecure File Upload — Validación por Magic Numbers (no solo extensión)

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Magic Numbers por tipo de archivo
const MAGIC_NUMBERS: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

export type FileValidationResult =
  | { valid: true; mimeType: string }
  | { valid: false; error: string };

export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  // 1. Verificar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "El archivo supera el límite de 5MB." };
  }

  // 2. Verificar MIME declarado
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { valid: false, error: "Tipo de archivo no permitido. Solo JPEG, PNG o PDF." };
  }

  // 3. Verificar Magic Numbers (primeros bytes reales del archivo)
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = Array.from(new Uint8Array(buffer));
  const magicSignatures = MAGIC_NUMBERS[file.type];

  const matchesMagic = magicSignatures?.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );

  if (!matchesMagic) {
    return { valid: false, error: "El archivo no corresponde al tipo declarado." };
  }

  return { valid: true, mimeType: file.type };
}