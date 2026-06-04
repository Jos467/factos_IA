// lib/actions/auth.actions.ts
// Server Actions seguras — Registro de usuario
// Nunca exponer passwordHash al cliente

"use server";

import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function registerUser(data: RegisterInput): Promise<ActionResult> {
  // 1. Validar con Zod en el servidor (nunca confiar solo en cliente)
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos. Verifica el formulario." };
  }

  const { nombre, apellido, email, password, telefono } = parsed.data;

  // 2. Verificar si el correo ya existe (A01: Broken Access Control)
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    // Mensaje genérico — no revelar si existe o no (A07)
    return {
      success: false,
      error: "No fue posible crear la cuenta. Verifica los datos e intenta de nuevo.",
    };
  }

  // 3. Hashear contraseña con bcrypt (salt rounds = 12)
  const passwordHash = await bcrypt.hash(password, 12);

  // 4. Crear usuario en DB
  await prisma.user.create({
    data: {
      name: `${nombre.trim()} ${apellido.trim()}`,
      email,
      passwordHash,
      telefono: telefono || null,
      estado: true,
    },
  });

  return { success: true, message: "Cuenta creada exitosamente." };
}