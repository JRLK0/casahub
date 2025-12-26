import { getKitchenAlerts } from "@/lib/kitchen-actions";
import Link from "next/link";

export default async function CocinaDashboard() {
  const result = await getKitchenAlerts();
  
  if ("error" in result) {
    return <div className="p-8 text-red-500">{result.error}</div>;
  }

  const { alerts } = result;
  const totalAlerts = alerts.expiringSoon.length + alerts.lowStock.length + alerts.openedLongAgo.length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cocina</h1>
          <p className="text-gray-500">Resumen y alertas del inventario</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/app/cocina/inventario"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Ver Inventario
          </Link>
          <Link
            href="/app/cocina/recetas"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Ver Recetas
          </Link>
        </div>
      </div>

      {totalAlerts === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800">Todo en orden</h2>
          <p className="text-green-600">No hay alertas pendientes en tu cocina.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Caducidad Próxima */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Caducan pronto</h2>
            </div>
            {alerts.expiringSoon.length > 0 ? (
              <ul className="space-y-3">
                {alerts.expiringSoon.map((p) => (
                  <li key={p.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <div>
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <p className="text-xs text-gray-500">{p.location.name}</p>
                    </div>
                    <span className="text-red-600 font-medium">
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '-'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay productos próximos a caducar.</p>
            )}
          </div>

          {/* Stock Bajo */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Stock bajo</h2>
            </div>
            {alerts.lowStock.length > 0 ? (
              <ul className="space-y-3">
                {alerts.lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <div>
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <p className="text-xs text-gray-500">{p.location.name}</p>
                    </div>
                    <span className="text-yellow-600 font-medium">
                      {p.quantity} {p.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Todo el stock está correcto.</p>
            )}
          </div>

          {/* Abiertos hace tiempo */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Abiertos hace tiempo</h2>
            </div>
            {alerts.openedLongAgo.length > 0 ? (
              <ul className="space-y-3">
                {alerts.openedLongAgo.map((p) => (
                  <li key={p.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <div>
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <p className="text-xs text-gray-500">{p.location.name}</p>
                    </div>
                    <span className="text-blue-600 font-medium">
                      {p.openedAt ? Math.floor((today.getTime() - new Date(p.openedAt).getTime()) / (1000 * 60 * 60 * 24)) : '-'} días
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay productos abiertos hace mucho.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

