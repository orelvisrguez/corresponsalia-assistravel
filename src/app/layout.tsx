import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import UserMenu from "@/components/UserMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistravel - Gestión de Casos",
  description: "Sistema de gestión de casos médicos y corresponsales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 antialiased">
        {user && (
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">Assistravel</h1>
                    <p className="text-xs text-gray-500 leading-tight">Gestión de Casos</p>
                  </div>
                </div>
                <nav className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="hidden sm:inline">Casos</span>
                  </Link>
                  <Link
                    href="/casos/nuevo"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Nuevo Caso</span>
                  </Link>
                  {user.role === "Administrador" && (
                    <Link
                      href="/admin/corresponsales"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="hidden sm:inline">Corresponsales</span>
                    </Link>
                  )}
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <UserMenu user={user} />
                </nav>
              </div>
            </div>
          </header>
        )}
        <main className={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 ${user ? "py-6" : ""}`}>
          {children}
        </main>
        {user && (
          <footer className="border-t border-gray-200 bg-white mt-auto">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Assistravel · Sistema de Gestión de Casos
              </p>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}
