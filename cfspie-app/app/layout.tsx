import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Sistema de Votación",
  description: "Plataforma de votación por categorías con fases y resultados en tiempo real",
  keywords: ["votación", "ranking", "competencia", "resultados"],
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen w-full bg-[#080810] text-white flex flex-col items-center">
        <div className="w-full flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}