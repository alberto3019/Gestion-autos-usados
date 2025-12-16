import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import Input from '../../components/common/Input'
import {
  BuildingOfficeIcon,
  TruckIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  HeartIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import dayjs from 'dayjs'
import ArgentinaMap from '../../components/charts/ArgentinaMap'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#A78BFA', '#F472B6', '#EAB308']

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showAgencies, setShowAgencies] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const [showUsers, setShowUsers] = useState(true)
  const [resetPasswordModal, setResetPasswordModal] = useState<{ open: boolean; agencyId: string | null; agencyName: string }>({
    open: false,
    agencyId: null,
    agencyName: '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  })

  const { data: advancedStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminAdvancedStats'],
    queryFn: adminApi.getAdvancedStats,
  })

  const { data: agenciesData, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['adminAgencies', page, statusFilter],
    queryFn: () => adminApi.getAgencies({ page, limit: 20, status: statusFilter || undefined }),
  })

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsersLastLogin'],
    queryFn: adminApi.getUsersWithLastLogin,
  })

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

  const resetPasswordMutation = useMutation({
    mutationFn: ({ agencyId, newPassword }: { agencyId: string; newPassword: string }) =>
      adminApi.resetAgencyPassword(agencyId, newPassword),
    onSuccess: () => {
      setResetPasswordModal({ open: false, agencyId: null, agencyName: '' })
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError(null)
      alert('Contraseña actualizada exitosamente para todos los usuarios de la agencia')
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || 'Error al cambiar la contraseña')
    },
  })

  const handleOpenResetPassword = (agencyId: string, agencyName: string) => {
    setResetPasswordModal({ open: true, agencyId, agencyName })
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
  }

  const handleResetPassword = () => {
    setPasswordError(null)
    
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }

    if (resetPasswordModal.agencyId) {
      resetPasswordMutation.mutate({
        agencyId: resetPasswordModal.agencyId,
        newPassword,
      })
    }
  }

  const totalPages = agenciesData ? Math.ceil(agenciesData.total / agenciesData.limit) : 1
  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  // Filtrar agencias por término de búsqueda
  const filteredAgencies = agenciesData?.data.filter((agency) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      agency.commercialName?.toLowerCase().includes(search) ||
      agency.businessName?.toLowerCase().includes(search) ||
      agency.email?.toLowerCase().includes(search) ||
      agency.taxId?.toLowerCase().includes(search) ||
      agency.addressCity?.toLowerCase().includes(search) ||
      agency.addressState?.toLowerCase().includes(search)
    )
  }) || []

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Panel de Administración
      </h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <BuildingOfficeIcon className="h-10 w-10 opacity-70" />
              <div className="text-right">
                <p className="text-sm font-medium opacity-80">Total Agencias</p>
                <p className="text-3xl font-bold">{stats.agencies.total}</p>
                <p className="text-xs opacity-70">{stats.agencies.active} activas</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
            <div className="flex items-center justify-between">
              <BuildingOfficeIcon className="h-10 w-10 opacity-70" />
              <div className="text-right">
                <p className="text-sm font-medium opacity-80">Pendientes</p>
                <p className="text-3xl font-bold">{stats.agencies.pending}</p>
                <p className="text-xs opacity-70">Por aprobar</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
            <div className="flex items-center justify-between">
              <TruckIcon className="h-10 w-10 opacity-70" />
              <div className="text-right">
                <p className="text-sm font-medium opacity-80">Vehículos</p>
                <p className="text-3xl font-bold">{stats.vehicles.total}</p>
                <p className="text-xs opacity-70">{stats.vehicles.available} disponibles</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <div className="flex items-center justify-between">
              <PhoneIcon className="h-10 w-10 opacity-70" />
              <div className="text-right">
                <p className="text-sm font-medium opacity-80">Clicks WhatsApp</p>
                <p className="text-3xl font-bold">{stats.whatsappClicks.lastMonth}</p>
                <p className="text-xs opacity-70">Último mes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas Detalladas - Colapsable */}
      <div className="card mb-8">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2" />
            Estadísticas Detalladas
          </h2>
          {showStats ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showStats && (
          <div className="mt-6">
            {isLoadingStats ? (
              <div className="text-center py-8 text-gray-500">Cargando estadísticas...</div>
            ) : advancedStats && advancedStats.overview ? (
              <>
                {/* Additional Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <UsersIcon className="h-8 w-8 text-indigo-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Usuarios</p>
                        <p className="text-2xl font-bold text-indigo-700">{advancedStats.overview.totalUsers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <HeartIcon className="h-8 w-8 text-red-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Favoritos</p>
                        <p className="text-2xl font-bold text-red-700">{advancedStats.overview.totalFavorites}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Valor Inventario</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(Number(advancedStats.overview.totalInventoryValue))}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <PhoneIcon className="h-8 w-8 text-orange-600" />
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Contactos</p>
                        <p className="text-2xl font-bold text-orange-700">{advancedStats.overview.totalWhatsappClicks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Left Column - Charts */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Vehicles by Brand */}
                    {advancedStats.distribution && advancedStats.distribution.vehiclesByBrand && advancedStats.distribution.vehiclesByBrand.length > 0 && (
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehículos por Marca (Top 10)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={advancedStats.distribution.vehiclesByBrand.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} style={{ fontSize: '10px' }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Vehicles by Status */}
                    {advancedStats.distribution && advancedStats.distribution.vehiclesByStatus && advancedStats.distribution.vehiclesByStatus.length > 0 && (
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehículos por Estado</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={advancedStats.distribution.vehiclesByStatus}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={(props: any) => {
                                const name = props.name || '';
                                const percent = props.percent || 0;
                                return `${name} ${(percent * 100).toFixed(0)}%`;
                              }}
                            >
                              {advancedStats.distribution.vehiclesByStatus.map((entry: { name: string; value: number }, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Map */}
                  {advancedStats.distribution && advancedStats.distribution.vehiclesByProvince && advancedStats.distribution.vehiclesByProvince.length > 0 && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehículos por Provincia</h3>
                      <ArgentinaMap data={advancedStats.distribution.vehiclesByProvince} />
                    </div>
                  )}

                  {/* Growth Charts */}
                  {advancedStats.growth && advancedStats.growth.vehicleGrowth && advancedStats.growth.vehicleGrowth.length > 0 && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg lg:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Crecimiento de Vehículos (Últimos 30 Días)</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={advancedStats.growth.vehicleGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(dateStr) => dayjs(dateStr).format('DD/MM')} />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#10B981" name="Nuevos Vehículos" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No hay estadísticas disponibles</div>
            )}
          </div>
        )}
      </div>

      {/* Gestión de Agencias - Colapsable */}
      <div className="card">
        <button
          onClick={() => setShowAgencies(!showAgencies)}
          className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors mb-4"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 mr-2" />
            Gestión de Agencias
          </h2>
          {showAgencies ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showAgencies && (
          <>
            <div className="flex gap-4 mb-4">
              {/* Barra de búsqueda */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, CUIT, ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Filtro de estado */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="active">Activas</option>
                <option value="blocked">Bloqueadas</option>
              </select>
            </div>

            {isLoadingAgencies ? (
              <p className="text-center py-8 text-gray-500">Cargando agencias...</p>
            ) : filteredAgencies.length > 0 ? (
              <>
                {searchTerm && (
                  <p className="text-sm text-gray-600 mb-3">
                    Mostrando {filteredAgencies.length} de {agenciesData?.data.length} agencias
                  </p>
                )}
                <div className="overflow-x-auto hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehículos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuarios
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAgencies.map((agency) => (
                        <tr key={agency.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {agency.commercialName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agency.addressCity}, {agency.addressState}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {agency.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              WhatsApp: {agency.whatsapp}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {agency.vehicleCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {agency.userCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={agency.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {agency.status === 'pending' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => approveMutation.mutate(agency.id)}
                                  isLoading={approveMutation.isPending}
                                >
                                  Aprobar
                                </Button>
                              )}
                              {agency.status === 'active' && (
                                <>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => blockMutation.mutate(agency.id)}
                                    isLoading={blockMutation.isPending}
                                  >
                                    Bloquear
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleOpenResetPassword(agency.id, agency.commercialName)}
                                  >
                                    <KeyIcon className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {agency.status === 'blocked' && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => approveMutation.mutate(agency.id)}
                                    isLoading={approveMutation.isPending}
                                  >
                                    Desbloquear
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleOpenResetPassword(agency.id, agency.commercialName)}
                                  >
                                    <KeyIcon className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Vista móvil */}
                <div className="md:hidden space-y-4">
                  {filteredAgencies.map((agency) => (
                    <div key={agency.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {agency.commercialName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {agency.addressCity}, {agency.addressState}
                          </p>
                        </div>
                        <StatusBadge status={agency.status} />
                      </div>
                      <div className="space-y-1 text-sm mb-3">
                        <p className="text-gray-600">{agency.email}</p>
                        <p className="text-gray-600">WhatsApp: {agency.whatsapp}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>🚗 {agency.vehicleCount} vehículos</span>
                          <span>👥 {agency.userCount} usuarios</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {agency.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => approveMutation.mutate(agency.id)}
                            isLoading={approveMutation.isPending}
                            className="flex-1"
                          >
                            Aprobar
                          </Button>
                        )}
                        {agency.status === 'active' && (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => blockMutation.mutate(agency.id)}
                              isLoading={blockMutation.isPending}
                              className="flex-1"
                            >
                              Bloquear
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenResetPassword(agency.id, agency.commercialName)}
                              className="flex-1"
                            >
                              <KeyIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {agency.status === 'blocked' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => approveMutation.mutate(agency.id)}
                              isLoading={approveMutation.isPending}
                              className="flex-1"
                            >
                              Desbloquear
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenResetPassword(agency.id, agency.commercialName)}
                              className="flex-1"
                            >
                              <KeyIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm 
                    ? `No se encontraron agencias que coincidan con "${searchTerm}"`
                    : 'No hay agencias para mostrar'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sección de Usuarios con Último Login */}
      <div className="card mb-8">
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <UsersIcon className="h-6 w-6 mr-2" />
            Último Inicio de Sesión de Usuarios
          </h2>
          {showUsers ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showUsers && (
          <div className="mt-6">
            {isLoadingUsers ? (
              <p className="text-center py-8 text-gray-500">Cargando usuarios...</p>
            ) : usersData && usersData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersData.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.agency?.commercialName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role === 'agency_admin' ? 'Admin' : 'Usuario'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.lastLogin ? (
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">
                                {dayjs(user.lastLogin).format('DD/MM/YYYY')}
                              </div>
                              <div className="text-gray-500">
                                {dayjs(user.lastLogin).format('HH:mm')} hs
                              </div>
                              <div className="text-xs text-gray-400">
                                {dayjs(user.lastLogin).fromNow()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Nunca</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No hay usuarios para mostrar</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para cambiar contraseña */}
      {resetPasswordModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cambiar Contraseña
              </h3>
              <button
                onClick={() => {
                  setResetPasswordModal({ open: false, agencyId: null, agencyName: '' })
                  setNewPassword('')
                  setConfirmPassword('')
                  setPasswordError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Cambiar contraseña para todos los usuarios de: <strong>{resetPasswordModal.agencyName}</strong>
            </p>
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}
            <div className="space-y-4">
              <Input
                label="Nueva Contraseña *"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <Input
                label="Confirmar Contraseña *"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setResetPasswordModal({ open: false, agencyId: null, agencyName: '' })
                  setNewPassword('')
                  setConfirmPassword('')
                  setPasswordError(null)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleResetPassword}
                isLoading={resetPasswordMutation.isPending}
                className="flex-1"
              >
                Cambiar Contraseña
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

