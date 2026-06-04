// src/app/(protected)/layout.tsx
// Layout compartido por todas las páginas protegidas

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen" style={{ background: "var(--off-white)" }}>
        {/* Sidebar fijo */}
        <Sidebar />

        {/* Contenido principal */}
        <main
          className="flex-1 flex flex-col min-h-screen overflow-x-hidden"
          style={{ marginLeft: "var(--sidebar-w)" }}
        >
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
