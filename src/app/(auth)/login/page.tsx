// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Correo o contraseña incorrectos.",
  default: "Ocurrió un error. Intenta de nuevo.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.default);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F6F9] px-4">
      {/* Fondo decorativo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #1A9FB4, #0B2D52)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #0B2D52, #1A9FB4)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#0B2D52]/8 border border-[#E2E8F0] px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Image
              src="/assets/logofactosai.png"
              alt="FactosAI"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#0B2D52]">Bienvenido de nuevo</h1>
              <p className="text-sm text-[#94A3B8] mt-1">Inicia sesión en tu cuenta</p>
            </div>
          </div>

          {/* Error global */}
          {serverError && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                href="/forgot-password"
                className="text-xs text-[#1A9FB4] hover:text-[#0B2D52] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" loading={isSubmitting} className="mt-2">
              Iniciar sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">o</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-[#94A3B8]">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#0B2D52] hover:text-[#1A9FB4] transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#94A3B8] mt-5">
          © {new Date().getFullYear()} FactosAI · Plataforma segura de gestión contable
        </p>
      </div>
    </main>
  );
}
