// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Tag,
  BarChart3,
  Send,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Inicio",      icon: LayoutDashboard },
  { href: "/facturas",     label: "Facturas",    icon: FileText },

  { href: "/reportes",     label: "Reportes",    icon: BarChart3 },
  { href: "/envios",     label: "Envíos",      icon: Send },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-40"
      style={{
        width: "var(--sidebar-w)",
        background: "linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <Image
          src="/assets/logofactosai.png"
          alt="FactosAI"
          width={110}
          height={36}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
           style={{ color: "rgba(255,255,255,0.3)" }}>
          Menú principal
        </p>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-link w-full text-left"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
