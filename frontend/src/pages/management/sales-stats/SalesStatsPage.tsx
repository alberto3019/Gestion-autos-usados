import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { salesApi } from '../../../api/sales'
import Button from '../../../components/common/Button'
import Pagination from '../../../components/common/Pagination'
import { formatNumber } from '../../../utils/format'

export default function SalesStatsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page],
    queryFn: () => salesApi.getSales({ page, limit: 20 }),
  })

  const { data: ranking } = useQuery({
    queryKey: ['salesRanking'],
    queryFn: () => salesApi.getSalesRanking({ limit: 10 }),
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Ventas</h1>
        <Link to="/management/sales-stats/new">
          <Button>Registrar Venta</Button>
        </Link>
      </div>

      {ranking && ranking.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Ranking de Vendedores</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Vendedor</th>
                  <th className="px-4 py-2 text-right">Ventas</th>
                  <th className="px-4 py-2 text-right">Ingresos</th>
                  <th className="px-4 py-2 text-right">Comisiones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ranking.map((item: any, index: number) => (
                  <tr key={item.seller.id}>
                    <td className="px-4 py-2">
                      #{index + 1} {item.seller.firstName} {item.seller.lastName}
                    </td>
                    <td className="px-4 py-2 text-right">{item.sales}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(item.revenue)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(item.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Historial de Ventas</h2>
        {isLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Vendedor</th>
                    <th className="px-4 py-2 text-left">Vehículo</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                    <th className="px-4 py-2 text-right">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.data.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-2 text-sm">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {sale.seller?.firstName} {sale.seller?.lastName}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {sale.vehicle?.brand} {sale.vehicle?.model}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {formatNumber(sale.salePrice)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {sale.commission ? formatNumber(sale.commission) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(data.total / data.limit)}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

