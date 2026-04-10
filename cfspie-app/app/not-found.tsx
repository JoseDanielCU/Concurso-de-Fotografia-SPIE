import Link from "next/link";
import { Camera } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-[#12121a] border border-[#1e1e2e] items-center justify-center mb-6">
          <Camera size={28} className="text-[#3a3a50]" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-[#8b8ba8] mb-8">Página no encontrada</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}