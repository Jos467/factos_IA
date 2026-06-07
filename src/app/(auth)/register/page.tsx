// src/app/(auth)/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/lib/actions/auth.actions";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthColors = ["#E2E8F0", "#EF4444", "#F59E0B", "#1A9FB4", "#10B981"];
  const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"];

  async function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      try {
        await registerUser(data);
        toast.success("Cuenta creada. Inicia sesión.");
        router.push("/login");
      } catch (e: any) {
        toast.error(e?.message ?? "Error al registrar");
      }
    });
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "DM Sans, sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #061A30 0%, #0B2D52 60%, #0e3a6a 100%)" }}
      >
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1A9FB4, transparent)" }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1A9FB4, transparent)" }} />

        <div className="w-full max-w-md">
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-10"
            style={{ width: 90, height: 90, background: "#fff", padding: 10 }}>
            <Image src="/assets/logofactosai.png" alt="FactosAI" width={70} height={70}
              className="object-contain w-full h-full" priority />
          </div>

          <h1 className="font-bold mb-4" style={{ fontSize: 42, letterSpacing: "-0.02em", lineHeight: "1.1", color: "#7EC8D8" }}>
            Comienza hoy<br />sin costo
          </h1>
          <p className="mb-12" style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, maxWidth: 360 }}>
            Crea tu cuenta en segundos y empieza a gestionar tus facturas de forma inteligente.
          </p>

          <div className="space-y-3">
            {[
              { icon: ShieldCheck, label: "Seguro y encriptado",   desc: "Tus datos protegidos con cifrado de nivel bancario" },
              { icon: Zap,         label: "Gestión inteligente",   desc: "Clasifica facturas automáticamente por categoría" },
              { icon: BarChart3,   label: "Reportes mensuales",    desc: "Genera y envía resúmenes a tu contadora en segundos" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(26,159,180,0.2)" }}>
                  <Icon size={20} style={{ color: "#1A9FB4" }} />
                </div>
                <div>
                  <p className="font-semibold text-white" style={{ fontSize: 15 }}>{label}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 left-14 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 FactosAI · Todos los derechos reservados
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 py-12"
        style={{ background: "#fff" }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10 self-start">
          <div className="rounded-xl overflow-hidden"
            style={{ width: 44, height: 44, background: "#fff", padding: 4, border: "1.5px solid var(--border)" }}>
            <Image src="/assets/logofactosai.png" alt="FactosAI" width={36} height={36} className="object-contain w-full h-full" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--navy)" }}>FactosAI</span>
        </div>

        <div className="w-full" style={{ maxWidth: 460 }}>
          <h2 className="font-bold mb-1" style={{ color: "var(--charcoal)", fontSize: 30, letterSpacing: "-0.01em" }}>
            Crear cuenta
          </h2>
          <p className="mb-8" style={{ color: "var(--muted)", fontSize: 16 }}>
            Completa los datos para comenzar
          </p>

          {/* Tabs */}
          <div className="flex gap-8 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
            <Link href="/login"
              className="pb-3 font-medium"
              style={{ color: "var(--muted)", fontSize: 16, borderBottom: "2.5px solid transparent" }}>
              Ingresar
            </Link>
            <button className="pb-3 font-bold"
              style={{ color: "var(--charcoal)", fontSize: 16, borderBottom: "2.5px solid var(--cyan)" }}>
              Registro
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: "var(--charcoal)", fontSize: 15 }}>
                Nombre completo
              </label>
              <input
                {...register("nombre")}
                type="text"
                placeholder="Carlos Rodríguez"
                className="w-full rounded-xl px-5 transition-all focus:outline-none"
                style={{
                  height: 54, fontSize: 16,
                  border: errors.nombre ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                  background: "var(--off-white)", color: "var(--charcoal)",
                }}
              />
              {errors.nombre && <p className="text-sm mt-1.5" style={{ color: "var(--danger)" }}>{errors.nombre.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: "var(--charcoal)", fontSize: 15 }}>
                Correo Electrónico
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="nombre@factos.ai"
                className="w-full rounded-xl px-5 transition-all focus:outline-none"
                style={{
                  height: 54, fontSize: 16,
                  border: errors.email ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                  background: "var(--off-white)", color: "var(--charcoal)",
                }}
              />
              {errors.email && <p className="text-sm mt-1.5" style={{ color: "var(--danger)" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: "var(--charcoal)", fontSize: 15 }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-5 pr-14 transition-all focus:outline-none"
                  style={{
                    height: 54, fontSize: 16,
                    border: errors.password ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                    background: "var(--off-white)", color: "var(--charcoal)",
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm mt-1.5" style={{ color: "var(--danger)" }}>{errors.password.message}</p>}

              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColors[strength] : "var(--border)" }} />
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                height: 56, fontSize: 17,
                background: "linear-gradient(135deg, #006877 0%, #1A9FB4 100%)",
                boxShadow: "0 4px 20px rgba(26,159,180,0.4)",
                marginTop: 8,
              }}
            >
              {isPending
                ? <Loader2 size={20} className="animate-spin" />
                : <><span>Crear mi cuenta</span><ArrowRight size={20} /></>
              }
            </button>

            <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
              Al continuar, aceptas nuestros{" "}
              <span style={{ color: "var(--cyan)", cursor: "pointer" }}>Términos de Servicio</span>{" "}
              y <span style={{ color: "var(--cyan)", cursor: "pointer" }}>Privacidad</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}