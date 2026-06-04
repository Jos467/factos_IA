// components/ui/Input.tsx
// Componente de input reutilizable con el design system de FactosAI

"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: "#1E293B" }}
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200",
              "placeholder:text-[#94A3B8]",
              "bg-white text-[#1E293B]",
              error
                ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-[#E2E8F0] focus:border-[#1A9FB4] focus:ring-2 focus:ring-[#1A9FB4]/10",
              isPassword && "pr-12",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1A9FB4] transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#94A3B8]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
