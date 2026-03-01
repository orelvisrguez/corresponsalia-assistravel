"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Filter,
  Globe,
  Activity,
} from "lucide-react";
import Link from "next/link";

type DashboardFilter = "semanal" | "quincenal" | "mensual" | "trimestral" | "semestral" | "anual";

interface DashboardData {
  totalCases: number;
  totalCorresponsales: number;
  corresponsalesActivos: number;
  financial: {
    totalFee: number;
    totalCostoUsd: number;
    totalMontoAgregado: number;
  };
  period: {
    filter: string;
    start: string;
    end: string;
    casesCount: number;
    casesGrowth: number;
    fee: number;
    costoUsd: number;
    montoAgregado: number;
  };
  casesByStatus: { estadoInterno: string; count: number }[];
  statusInRange: { [key: string]: number };
  casesByEstadoCaso: { estadoCaso: string; count: number }[];
  estadoCasoInRange: { [key: string]: number };
  casesByCountry: { pais: string; count: number }[];
  casesByMonth: { month: string; count: number; fee: number }[];
  topCorresponsales: { id: number; nombre: string; pais: string; casos: number; fee: number }[];
  recentCases: {
    id: number;
    nroCasoAssistravel: string;
    corresponsal: string;
    pais: string;
    estadoInterno: string;
    estadoCaso: string;
    fee: number;
    createdAt: Date | null;
  }[];
  generatedAt: string;
}

const FILTER_OPTIONS: { value: DashboardFilter; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const COLORS = {
  status: {
    Abierto: "#22c55e",
    Cerrado: "#6b7280",
    Pausado: "#eab308",
    Cancelado: "#ef4444",
  },
  estadoCaso: {
    "No Fee": "#64748b",
    "On Going": "#3b82f6",
    Refacturado: "#a855f7",
    "Para refacturar": "#f97316",
    Cobrado: "#10b981",
  },
  charts: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"],
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

export default function Dashboard() {
  const [filter, setFilter] = useState<DashboardFilter>("mensual");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard?filter=${filter}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statusData = data
    ? Object.entries(data.statusInRange).map(([name, value]) => ({
        name,
        value,
        color: COLORS.status[name as keyof typeof COLORS.status] || "#6b7280",
      }))
    : [];

  const estadoCasoData = data
    ? Object.entries(data.estadoCasoInRange).map(([name, value]) => ({
        name,
        value,
        color: COLORS.estadoCaso[name as keyof typeof COLORS.estadoCaso] || "#6b7280",
      }))
    : [];

  const countryData = data?.casesByCountry.map((c, i) => ({
    name: c.pais,
    value: c.count,
    color: COLORS.charts[i % COLORS.charts.length],
  })) || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Estadísticas y análisis de casos y corresponsales
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <Filter className="w-4 h-4 text-slate-500 ml-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as DashboardFilter)}
              className="bg-transparent border-0 text-sm text-slate-700 focus:ring-0 cursor-pointer pr-4"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity className="w-4 h-4" />
          <span>
            Última actualización: {lastUpdated.toLocaleTimeString("es-AR")}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              (data?.period.casesGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {(data?.period.casesGrowth || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(data?.period.casesGrowth || 0)}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Casos Totales</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatNumber(data?.totalCases || 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formatNumber(data?.period.casesCount || 0)} en el período
            </p>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Casos Abiertos</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatNumber(data?.statusInRange.Abierto || 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {data?.totalCases ? Math.round((data.statusInRange.Abierto / data.totalCases) * 100) : 0}% del total
            </p>
          </div>
        </div>

        {/* Corresponsales */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Corresponsales</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatNumber(data?.corresponsalesActivos || 0)} / {formatNumber(data?.totalCorresponsales || 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">Activos / Total</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Fee Total</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(data?.financial.totalFee || 0)}
            </p>
            <p className="text-sm text-emerald-600 mt-1">
              {formatCurrency(data?.period.fee || 0)} en el período
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">Fee en Período</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data?.period.fee || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">Costo USD en Período</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data?.period.costoUsd || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">Monto Agregado en Período</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data?.period.montoAgregado || 0)}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cases Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Casos por Mes
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.casesByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Casos"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="fee"
                  name="Fee"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Estados Internos
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado Caso Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Estado del Caso
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estadoCasoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {estadoCasoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Countries Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            <Globe className="w-5 h-5 inline-block mr-2" />
            Casos por País
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" name="Casos" radius={[0, 4, 4, 0]}>
                  {countryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS.charts[index % COLORS.charts.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Corresponsales & Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Corresponsales */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            <Users className="w-5 h-5 inline-block mr-2" />
            Top Corresponsales
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-sm font-medium text-slate-500 pb-3">
                    Corresponsal
                  </th>
                  <th className="text-center text-sm font-medium text-slate-500 pb-3">
                    Casos
                  </th>
                  <th className="text-right text-sm font-medium text-slate-500 pb-3">
                    Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.topCorresponsales.map((c, index) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{c.nombre}</p>
                          <p className="text-xs text-slate-500">{c.pais}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        {c.casos}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-700 font-medium">
                      {formatCurrency(c.fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            <Calendar className="w-5 h-5 inline-block mr-2" />
            Casos Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-sm font-medium text-slate-500 pb-3">
                    Caso
                  </th>
                  <th className="text-left text-sm font-medium text-slate-500 pb-3">
                    Estado
                  </th>
                  <th className="text-right text-sm font-medium text-slate-500 pb-3">
                    Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.recentCases.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-3">
                      <Link
                        href={`/casos/${c.id}`}
                        className="font-medium text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        {c.nroCasoAssistravel}
                      </Link>
                      <p className="text-xs text-slate-500">{c.corresponsal}</p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium border ${
                          c.estadoInterno === "Abierto"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : c.estadoInterno === "Cerrado"
                            ? "bg-gray-100 text-gray-800 border-gray-200"
                            : c.estadoInterno === "Pausado"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {c.estadoInterno}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-700 font-medium">
                      {formatCurrency(c.fee || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
