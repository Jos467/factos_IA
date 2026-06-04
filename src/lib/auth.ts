// lib/auth.ts
// NextAuth v5 (Auth.js) — Configuración principal
// Adaptado al schema Prisma existente de FactosAI

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // JWT para compatibilidad con Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,   // A07: Authentication Failures
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      },
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validar con Zod antes de tocar la DB (A03: Injection)
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Buscar usuario en DB
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            estado: true,
            // passwordHash se selecciona solo aquí, nunca se expone al cliente
            passwordHash: true,
          },
        });

        if (!user || !user.estado || !user.passwordHash) return null;

        // Comparar hash — nunca comparar texto plano
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Retornar objeto sin passwordHash
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Primera vez: agregar id del usuario al token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponer solo el id al cliente — nunca el hash ni datos sensibles
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});