import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { stockApi } from '../../../api/stock'
import Button from '../../../components/common/Button'
import Pagination from '../../../components/common/Pagination'

export default function StockPage() {
  const [statusFilter, setStatusFilter] = useState<'green' | 'yellow' | 'red' | undefined>()

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['stockVehicles', statusFilter],
    queryFn: () => stockApi.getVehiclesWithStockStatus({ status: statusFilter }),
  })

  const { data: stats } = useQuery({
    queryKey: ['stockStats'],
    queryFn: stockApi.getStockStatistics,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red':
        return 'bg-red-500'
      case 'yellow':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock con Semáforo</h1>
        <Link to="/management/stock/settings">
          <Button>Configurar Semáforo</Button>
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Verde</p>
            <p className="text-2xl font-bold text-green-600">{stats.green}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Amarillo</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.yellow}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Rojo</p>
            <p className="text-2xl font-bold text-red-600">{stats.red}</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <Button
          variant={statusFilter === undefined ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter(undefined)}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === 'green' ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter('green')}
        >
          Verde
        </Button>
        <Button
          variant={statusFilter === 'yellow' ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter('yellow')}
        >
          Amarillo
        </Button>
        <Button
          variant={statusFilter === 'red' ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter('red')}
        >
          Rojo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles?.map((item) => (
            <Link
              key={item.vehicleId}
              to={`/vehicles/${item.vehicleId}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">
                  {item.vehicle.brand} {item.vehicle.model}
                </h3>
                <div
                  className={`w-4 h-4 rounded-full ${getStatusColor(item.status)}`}
                  title={`${item.daysInStock} días en stock`}
                />
              </div>
              <p className="text-sm text-gray-500">
                {item.daysInStock} días en stock
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

