import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { balancesApi } from '../../../api/balances'
import Button from '../../../components/common/Button'
import { formatNumber } from '../../../utils/format'

export default function BalancesPage() {
  const [vehicleId, setVehicleId] = useState<string>('')

  const { data: balances, isLoading } = useQuery({
    queryKey: ['balances', vehicleId],
    queryFn: () => balancesApi.getBalances(vehicleId ? { vehicleId } : undefined),
  })

  const { data: report } = useQuery({
    queryKey: ['balancesReport'],
    queryFn: balancesApi.getBalancesReport,
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Balances</h1>
        <Link to="/management/balances/report">
          <Button variant="secondary">Ver Reporte</Button>
        </Link>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-gray-500">Costo Total</p>
            <p className="text-2xl font-bold">{formatNumber(report.summary.totalCost)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Ventas Totales</p>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(report.summary.totalSalePrice)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Ganancia Total</p>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(report.summary.totalProfit)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Margen Promedio</p>
            <p className="text-2xl font-bold">
              {report.summary.averageProfitMargin.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por ID de vehículo (opcional)"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="input"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Vehículo</th>
                <th className="px-4 py-3 text-right">Precio Compra</th>
                <th className="px-4 py-3 text-right">Inversión</th>
                <th className="px-4 py-3 text-right">Precio Venta</th>
                <th className="px-4 py-3 text-right">Ganancia</th>
                <th className="px-4 py-3 text-right">Margen</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {balances?.map((balance) => (
                <tr key={balance.id}>
                  <td className="px-4 py-3">
                    {balance.vehicle?.brand} {balance.vehicle?.model}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatNumber(balance.purchasePrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatNumber(balance.investment)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {balance.salePrice ? formatNumber(balance.salePrice) : '-'}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    (balance.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {balance.profit ? formatNumber(balance.profit) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {balance.profitMargin ? `${balance.profitMargin.toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/management/balances/vehicle/${balance.vehicleId}`}>
                      <Button size="sm">Editar</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

