import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { cashflowApi } from '../../../api/cashflow'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Pagination from '../../../components/common/Pagination'
import { formatNumber } from '../../../utils/format'
import { translateCategory } from '../../../utils/categoryTranslations'

export default function CashflowPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['cashflow', page, typeFilter],
    queryFn: () => cashflowApi.getTransactions({ page, limit: 20, type: typeFilter }),
  })

  const deleteMutation = useMutation({
    mutationFn: cashflowApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashflow'] })
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cashflow</h1>
        <div className="flex gap-2">
          <Link to="/management/cashflow/report">
            <Button variant="secondary">Ver Reporte</Button>
          </Link>
          <Link to="/management/cashflow/new">
            <Button>Nueva Transacción</Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={typeFilter === undefined ? 'primary' : 'secondary'}
          onClick={() => setTypeFilter(undefined)}
        >
          Todos
        </Button>
        <Button
          variant={typeFilter === 'income' ? 'primary' : 'secondary'}
          onClick={() => setTypeFilter('income')}
        >
          Ingresos
        </Button>
        <Button
          variant={typeFilter === 'expense' ? 'primary' : 'secondary'}
          onClick={() => setTypeFilter('expense')}
        >
          Egresos
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{translateCategory(transaction.category)}</td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.vehicle ? (
                        <span className="font-medium">{transaction.vehicle.licensePlate}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.description || <span className="text-gray-400">-</span>}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatNumber(transaction.amount)} {transaction.currency}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('¿Eliminar esta transacción?')) {
                            deleteMutation.mutate(transaction.id)
                          }
                        }}
                      >
                        Eliminar
                      </Button>
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
  )
}

