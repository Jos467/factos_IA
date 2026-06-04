// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#0B2D52]">404</h1>
        <p className="text-[#94A3B8] mt-3 mb-6">Página no encontrada</p>
        <Link
          href="/login"
          className="bg-[#0B2D52] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#0d3563] transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}