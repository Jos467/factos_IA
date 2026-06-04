// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const result = await registerUser(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
    toast.success("¡Cuenta creada! Redirigiendo...");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F6F9] px-4 py-10">
      {/* Fondo decorativo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #1A9FB4, #0B2D52)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #0B2D52, #1A9FB4)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
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
              <h1 className="text-2xl font-bold text-[#0B2D52]">Crea tu cuenta</h1>
              <p className="text-sm text-[#94A3B8] mt-1">
                Empieza a organizar tus facturas con IA
              </p>
            </div>
          </div>

          {/* Success state */}
          {success && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3 text-sm text-emerald-700">
              <CheckCircle2 size={18} className="shrink-0" />
              ¡Cuenta creada exitosamente! Redirigiendo al login...
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Nombre y Apellido en fila */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                type="text"
                placeholder="Carlos"
                autoComplete="given-name"
                error={errors.nombre?.message}
                {...register("nombre")}
              />
              <Input
                label="Apellido"
                type="text"
                placeholder="Rodríguez"
                autoComplete="family-name"
                error={errors.apellido?.message}
                {...register("apellido")}
              />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Teléfono (opcional)"
              type="tel"
              placeholder="+504 9999-9999"
              autoComplete="tel"
              error={errors.telefono?.message}
              hint="Para recibir notificaciones por WhatsApp"
              {...register("telefono")}
            />

            <div>
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrength password={passwordValue} />
            </div>

            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {/* Requisitos */}
            <ul className="grid grid-cols-2 gap-1 text-xs text-[#94A3B8]">
              {[
                { re: /.{8,}/, label: "8 caracteres mín." },
                { re: /[A-Z]/, label: "Una mayúscula" },
                { re: /[0-9]/, label: "Un número" },
                { re: /[^A-Za-z0-9]/, label: "Un símbolo" },
              ].map(({ re, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      re.test(passwordValue) ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                    }`}
                  />
                  {label}
                </li>
              ))}
            </ul>

            <Button type="submit" loading={isSubmitting} disabled={success} className="mt-2">
              Crear cuenta
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-[#94A3B8] mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0B2D52] hover:text-[#1A9FB4] transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-5">
          © {new Date().getFullYear()} FactosAI · Plataforma segura de gestión contable
        </p>
      </div>
    </main>
  );
}
