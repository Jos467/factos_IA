// src/components/layout/Topbar.tsx
"use client";

import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { data: session } = useSession();
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  return (
    <header
      className="flex items-center justify-between px-8 py-4 bg-white border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Título de la página */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        {/* Búsqueda */}
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{
            background: "var(--off-white)",
            color: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={15} />
          <span className="hidden sm:inline">Buscar...</span>
        </button>

        {/* Notificaciones */}
        <button
          className="relative p-2 rounded-xl transition-colors hover:bg-gray-50"
          style={{ border: "1px solid var(--border)" }}
        >
          <Bell size={18} style={{ color: "var(--muted)" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--cyan)" }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
          style={{ background: "var(--navy)" }}
          title={session?.user?.name ?? "Usuario"}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
