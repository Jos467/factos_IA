// lib/validations/auth.ts
// Schemas de validación con Zod — Usados en cliente Y servidor

import { z } from "zod";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Correo electrónico inválido")
    .max(150, "Correo demasiado largo")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .max(100, "Contraseña demasiado larga"),
});

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "Nombre demasiado largo")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras")
      .trim(),
    apellido: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "Apellido demasiado largo")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras")
      .trim(),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Correo electrónico inválido")
      .max(150, "Correo demasiado largo")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(100, "Contraseña demasiado larga")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un símbolo especial"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    telefono: z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,20}$/, "Número de teléfono inválido")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;