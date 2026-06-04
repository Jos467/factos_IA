import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "FactosAI",
  description: "Plataforma inteligente de gestión de facturas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}