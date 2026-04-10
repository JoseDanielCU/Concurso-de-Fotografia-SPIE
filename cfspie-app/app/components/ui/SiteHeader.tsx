"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera } from "lucide-react";

export default function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Camera size={14} className="text-white" />
          </div>
          SPIE Photo Contest
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-[#8b8ba8] hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Categorías
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 text-sm text-[#8b8ba8] hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}