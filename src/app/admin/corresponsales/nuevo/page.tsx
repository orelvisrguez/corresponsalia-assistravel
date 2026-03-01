import CorresponsalForm from "@/components/CorresponsalForm";

export default function NuevaCorresponsalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Nuevo Corresponsal
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <CorresponsalForm />
      </div>
    </div>
  );
}
