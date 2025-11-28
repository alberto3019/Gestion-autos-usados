import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  })

  const { data: agenciesData, isLoading: isLoadingAgencies, error: agenciesError } = useQuery({
    queryKey: ['adminAgencies', page, statusFilter],
    queryFn: () => adminApi.getAgencies({ page, limit: 20, status: statusFilter || undefined }),
  })

  // Debug log
  console.log('Agencies Data:', agenciesData)
  console.log('Is Loading:', isLoadingAgencies)
  console.log('Error:', agenciesError)

  const approveMutation = useMutation({
    mutationFn: adminApi.approveAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAgencies'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminApi.blockAgency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAgencies'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })

  const totalPages = agenciesData ? Math.ceil(agenciesData.total / agenciesData.limit) : 1

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Panel de Administración
      </h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Agencias
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.agencies.total}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {stats.agencies.active} activas
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Pendientes
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.agencies.pending}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Vehículos Publicados
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.vehicles.total}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {stats.vehicles.available} disponibles
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Clicks WhatsApp (Mes)
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.whatsappClicks.lastMonth}
            </p>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/admin/statistics"
          className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        >
          <div className="flex items-center">
            <div className="p-4 rounded-lg bg-blue-500">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Estadísticas Completas
              </h3>
              <p className="text-sm text-gray-600">
                Gráficos, rankings y análisis detallados de la plataforma
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/activities"
          className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        >
          <div className="flex items-center">
            <div className="p-4 rounded-lg bg-purple-500">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Registro de Actividades
              </h3>
              <p className="text-sm text-gray-600">
                Historial completo de todas las acciones en la plataforma
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Agencies Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Agencias</h2>
          <select
            className="input w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activas</option>
            <option value="blocked">Bloqueadas</option>
          </select>
        </div>

        {isLoadingAgencies ? (
          <p className="text-center py-8 text-gray-500">Cargando agencias...</p>
        ) : agenciesError ? (
          <p className="text-center py-8 text-red-600">
            Error al cargar agencias: {(agenciesError as any)?.message || 'Error desconocido'}
          </p>
        ) : agenciesData && agenciesData.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Agencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      CUIT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehículos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agenciesData.data.map((agency) => (
                    <tr key={agency.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {agency.commercialName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agency.addressCity}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {agency.taxId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {agency.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {agency.vehicleCount}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={agency.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        {agency.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => approveMutation.mutate(agency.id)}
                          >
                            Aprobar
                          </Button>
                        )}
                        {agency.status === 'active' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (
                                window.confirm(
                                  '¿Estás seguro de bloquear esta agencia?'
                                )
                              ) {
                                blockMutation.mutate(agency.id)
                              }
                            }}
                          >
                            Bloquear
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <p className="text-center py-8 text-gray-500">
            No hay agencias para mostrar
          </p>
        )}
      </div>
    </div>
  )
}

