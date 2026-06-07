// src/app/(auth)/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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

  async function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Credenciales incorrectas");
      } else {
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "DM Sans, sans-serif", background: "var(--off-white)" }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #061A30 0%, #0B2D52 60%, #0e3a6a 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1A9FB4, transparent)" }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1A9FB4, transparent)" }} />

        <div className="w-full max-w-md">
          {/* Logo */}
          <div
            className="rounded-2xl overflow-hidden shadow-2xl mb-10"
            style={{ width: 90, height: 90, background: "#fff", padding: 10 }}
          >
            <Image
              src="/assets/logofactosai.png"
              alt="FactosAI"
              width={70}
              height={70}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <h1 className="font-bold mb-4" style={{ fontSize: 42, letterSpacing: "-0.02em", lineHeight: "1.1", color: "#7EC8D8" }}>
            Inteligencia<br />para tus finanzas
          </h1>
          <p className="mb-12" style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, maxWidth: 360 }}>
            Gestiona, clasifica y envía tus facturas a tu contadora con la precisión de FactosAI.
          </p>

          {/* Feature cards */}
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, label: "Seguro y encriptado",   desc: "Tus datos protegidos con cifrado de nivel bancario" },
              { icon: Zap,         label: "Gestión inteligente",   desc: "Clasifica facturas automáticamente por categoría" },
              { icon: BarChart3,   label: "Reportes mensuales",    desc: "Genera y envía resúmenes a tu contadora en segundos" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
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
          <div className="rounded-xl overflow-hidden" style={{ width: 44, height: 44, background: "#fff", padding: 4, border: "1.5px solid var(--border)" }}>
            <Image src="/assets/logofactosai.png" alt="FactosAI" width={36} height={36} className="object-contain w-full h-full" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--navy)" }}>FactosAI</span>
        </div>

        <div className="w-full" style={{ maxWidth: 460 }}>
          <h2 className="font-bold mb-1" style={{ color: "var(--charcoal)", fontSize: 30, letterSpacing: "-0.01em" }}>
            Bienvenido de nuevo
          </h2>
          <p className="mb-8" style={{ color: "var(--muted)", fontSize: 16 }}>
            Ingresa tus credenciales para continuar
          </p>

          {/* Tabs */}
          <div className="flex gap-8 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
            <button
              className="pb-3 font-bold"
              style={{ color: "var(--charcoal)", fontSize: 16, borderBottom: "2.5px solid var(--cyan)" }}
            >
              Ingresar
            </button>
            <Link
              href="/register"
              className="pb-3 font-medium"
              style={{ color: "var(--muted)", fontSize: 16, borderBottom: "2.5px solid transparent" }}
            >
              Registro
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  height: 54,
                  fontSize: 16,
                  border: errors.email ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                  background: "var(--off-white)",
                  color: "var(--charcoal)",
                }}
              />
              {errors.email && <p className="text-sm mt-1.5" style={{ color: "var(--danger)" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold" style={{ color: "var(--charcoal)", fontSize: 15 }}>Contraseña</label>
                <span className="text-sm font-medium" style={{ color: "var(--cyan)", cursor: "pointer" }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-5 pr-14 transition-all focus:outline-none"
                  style={{
                    height: 54,
                    fontSize: 16,
                    border: errors.password ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                    background: "var(--off-white)",
                    color: "var(--charcoal)",
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

            {/* Remember */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded" style={{ accentColor: "var(--cyan)" }} />
              <span style={{ color: "var(--charcoal)", fontSize: 15 }}>Recordar mi sesión</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                height: 56,
                fontSize: 17,
                background: "linear-gradient(135deg, #006877 0%, #1A9FB4 100%)",
                boxShadow: "0 4px 20px rgba(26,159,180,0.4)",
              }}
            >
              {isPending
                ? <Loader2 size={20} className="animate-spin" />
                : <><span>Acceder al Tablero</span><ArrowRight size={20} /></>
              }
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>O continúa con</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Google",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                },
                {
                  label: "GitHub",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                },
              ].map(({ label, icon }) => (
                <button key={label} type="button"
                  className="flex items-center justify-center gap-2 rounded-xl font-semibold border transition-all hover:bg-gray-50"
                  style={{ height: 52, fontSize: 15, border: "1.5px solid var(--border)", color: "var(--charcoal)", background: "#fff" }}>
                  {icon} {label}
                </button>
              ))}
            </div>

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