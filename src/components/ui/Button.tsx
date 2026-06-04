// components/ui/Button.tsx
"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, variant = "primary", className, disabled, ...props }, ref) => {
    const variants = {
      primary:
        "bg-[#0B2D52] hover:bg-[#0d3563] text-white shadow-md hover:shadow-lg active:scale-[0.98]",
      secondary:
        "bg-[#F4F6F9] hover:bg-[#E2E8F0] text-[#1E293B] border border-[#E2E8F0]",
      ghost:
        "bg-transparent hover:bg-[#F4F6F9] text-[#1A9FB4]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3",
          "text-sm font-semibold transition-all duration-200",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
