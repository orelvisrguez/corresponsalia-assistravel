import Link from "next/link";
import CasoForm from "@/components/CasoForm";

export default function NuevoCasoPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Caso</h2>
          <p className="text-sm text-gray-500 mt-0.5">Completa los datos para registrar un nuevo caso</p>
        </div>
      </div>

      <CasoForm mode="create" />
    </div>
  );
}
