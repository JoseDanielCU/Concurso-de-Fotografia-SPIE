import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatPhase(phase: number): string {
  switch (phase) {
    case 1:
      return "Fase 1 — Votación Pública";
    case 2:
      return "Fase 2 — Selección Final";
    case 3:
      return "Resultados Finales";
    default:
      return "Desconocida";
  }
}