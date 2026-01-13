import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { financingApi } from '../../../api/financing'
import Button from '../../../components/common/Button'
import Pagination from '../../../components/common/Pagination'
import { formatNumber } from '../../../utils/format'

export default function FinancingPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['financing', page, statusFilter],
    queryFn: () => financingApi.getFinancings({ page, limit: 20, status: statusFilter || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: financingApi.deleteFinancing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing'] })
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financiamientos</h1>
        <Link to="/management/financing/new">
          <Button>Nuevo Financiamiento</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={statusFilter === '' ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter('')}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter('pending')}
        >
          Pendientes
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'primary' : 'secondary'}
          onClick={() => setStatusFilter('approved')}
        >
          Aprobados
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {data?.data.map((financing) => (
              <div key={financing.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {financing.client ? `${financing.client.firstName} ${financing.client.lastName}` : 'Sin cliente'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {financing.financier}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatNumber(financing.amount)} - {financing.installments} cuotas
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    financing.status === 'approved' ? 'bg-green-100 text-green-800' :
                    financing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    financing.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {financing.status}
                  </span>
                </div>
                {financing.vehicle && (
                  <p className="text-sm text-gray-600 mb-4">
                    {financing.vehicle.brand} {financing.vehicle.model}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link to={`/management/financing/${financing.id}/edit`}>
                    <Button size="sm">Editar</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm('¿Eliminar este financiamiento?')) {
                        deleteMutation.mutate(financing.id)
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
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
  )
}

