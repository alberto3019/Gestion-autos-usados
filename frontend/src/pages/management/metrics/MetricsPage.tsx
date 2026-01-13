import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { metricsApi } from '../../../api/metrics'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import { formatNumber } from '../../../utils/format'

export default function MetricsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [sellerId, setSellerId] = useState('')

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics', startDate, endDate, vehicleId, sellerId],
    queryFn: () => metricsApi.getMetrics({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      vehicleId: vehicleId || undefined,
      sellerId: sellerId || undefined,
    }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Métricas</h1>

      <div className="card mb-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Fecha inicio" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="Fecha fin" />
          <Input value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} placeholder="ID Vehículo" />
          <Input value={sellerId} onChange={(e) => setSellerId(e.target.value)} placeholder="ID Vendedor" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-2">Vehículos</h3>
            <p className="text-2xl font-bold">{metrics.vehicles.total}</p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Ventas</h3>
            <p className="text-2xl font-bold">{metrics.sales.total}</p>
            <p className="text-sm text-gray-500">Ingresos: {formatNumber(metrics.sales.revenue)}</p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Cashflow Neto</h3>
            <p className={`text-2xl font-bold ${metrics.cashflow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatNumber(metrics.cashflow.net)}
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Clientes</h3>
            <p className="text-2xl font-bold">{metrics.clients.total}</p>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Ganancia Total</h3>
            <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.balances.totalProfit)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

