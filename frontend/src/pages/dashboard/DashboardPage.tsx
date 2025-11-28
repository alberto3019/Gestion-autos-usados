import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { vehiclesApi } from '../../api/vehicles'
import { agenciesApi } from '../../api/agencies'
import { usersApi } from '../../api/users'
import { useAuthStore } from '../../store/authStore'
import {
  TruckIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import SuperAdminDashboard from './SuperAdminDashboard'
import { formatNumber } from '../../utils/format'

export default function DashboardPage() {
  const { user } = useAuthStore()

  // Si es super admin, mostrar el dashboard de administración
  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard />
  }

  const [showVehicleStats, setShowVehicleStats] = useState(true)
  const [showUserStats, setShowUserStats] = useState(true)

  const { data: vehiclesData } = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => vehiclesApi.getMyVehicles({ limit: 1000 }),
  })

  const { data: agencyData } = useQuery({
    queryKey: ['myAgency'],
    queryFn: agenciesApi.getMyAgency,
    enabled: !!user && user.role !== 'super_admin',
  })

  const { data: usersData } = useQuery({
    queryKey: ['agencyUsers'],
    queryFn: usersApi.getAgencyUsers,
    enabled: user?.role === 'agency_admin',
  })

  const { data: exchangeRate } = useQuery({
    queryKey: ['exchangeRate'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/exchange-rate/usd');
      return response.json();
    },
    refetchInterval: 1000 * 60 * 60, // Refetch cada hora
  })

  const vehicles = vehiclesData?.data || []
  const users = usersData || []
  
  const total = vehicles.length
  const available = vehicles.filter((v) => v.status === 'available').length
  const reserved = vehicles.filter((v) => v.status === 'reserved').length
  const sold = vehicles.filter((v) => v.status === 'sold').length
  const paused = vehicles.filter((v) => v.status === 'paused').length

  const activeUsers = users.filter((u) => u.isActive).length
  const inactiveUsers = users.filter((u) => !u.isActive).length
  const adminUsers = users.filter((u) => u.role === 'agency_admin').length

  // Calcular valores por moneda
  const availableVehicles = vehicles.filter((v) => v.status === 'available');
  
  const inventoryARS = availableVehicles
    .filter((v) => v.currency === 'ARS')
    .reduce((sum, v) => sum + Number(v.price), 0);
  
  const inventoryUSD = availableVehicles
    .filter((v) => v.currency === 'USD')
    .reduce((sum, v) => sum + Number(v.price), 0);
  
  const inventoryEUR = availableVehicles
    .filter((v) => v.currency === 'EUR')
    .reduce((sum, v) => sum + Number(v.price), 0);

  // Convertir todo a ARS
  const usdRate = exchangeRate?.rate || 1000;
  const eurRate = usdRate * 1.1; // EUR aproximado
  
  const totalInventoryARS = inventoryARS + (inventoryUSD * usdRate) + (inventoryEUR * eurRate);

  return (
    <div className="relative min-h-screen">
      {/* Logo de fondo con opacidad */}
      {agencyData?.logoUrl && (
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${agencyData.logoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15,
          }}
        />
      )}
      
      {/* Contenido del dashboard */}
      <div className="relative z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {/* Banner de Agencia + Valor de Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Información de la Agencia */}
        {agencyData && (
          <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-12 w-12 mr-3 opacity-90 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold">{agencyData.commercialName}</h2>
                  <p className="text-primary-100 text-xs mt-1">
                    {agencyData.businessName}
                  </p>
                  <p className="text-primary-100 text-sm mt-1">
                    📍 {agencyData.addressCity}, {agencyData.addressState}
                  </p>
                  <p className="text-primary-100 text-xs">
                    🆔 CUIT: {agencyData.taxId}
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                className="px-3 py-1.5 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium text-sm flex-shrink-0"
              >
                Ver Perfil
              </Link>
            </div>
          </div>
        )}

        {/* Valor Total del Inventario */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-green-500 flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Valor Total Inventario
              </p>
              <p className="text-2xl font-bold text-green-700 mb-2">
                ${formatNumber(totalInventoryARS)} ARS
              </p>
              
              {/* Desglose por moneda compacto */}
              <div className="space-y-1">
                {inventoryARS > 0 && (
                  <p className="text-xs text-gray-600">
                    ARS: ${formatNumber(inventoryARS)}
                  </p>
                )}
                {inventoryUSD > 0 && (
                  <p className="text-xs text-blue-600">
                    USD: ${formatNumber(inventoryUSD)} (≈ ${formatNumber(inventoryUSD * usdRate)} ARS)
                  </p>
                )}
                {inventoryEUR > 0 && (
                  <p className="text-xs text-purple-600">
                    EUR: €{formatNumber(inventoryEUR)}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {available} disponibles • USD: ${formatNumber(usdRate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Colapsables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Estadísticas de Vehículos */}
        <div className="card">
          <button
            onClick={() => setShowVehicleStats(!showVehicleStats)}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              🚗 Estadísticas de Vehículos
            </h3>
            {showVehicleStats ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showVehicleStats && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Total</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{total}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Disponibles</span>
                </div>
                <span className="text-lg font-bold text-green-600">{available}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Reservados</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{reserved}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Vendidos</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{sold}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Pausados</span>
                </div>
                <span className="text-lg font-bold text-red-600">{paused}</span>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas de Usuarios */}
        {user?.role === 'agency_admin' && (
          <div className="card">
            <button
              onClick={() => setShowUserStats(!showUserStats)}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                👥 Estadísticas de Usuarios
              </h3>
              {showUserStats ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {showUserStats && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Total</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{users.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Activos</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{activeUsers}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Inactivos</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{inactiveUsers}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Administradores</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{adminUsers}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de Usuarios */}
      {user?.role === 'agency_admin' && users.length > 0 && (
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Usuarios de la Agencia
            </h3>
            <Link
              to="/users"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Ver Todos →
            </Link>
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 5).map((agencyUser) => (
                  <tr key={agencyUser.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {agencyUser.firstName} {agencyUser.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agencyUser.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          agencyUser.role === 'agency_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {agencyUser.role === 'agency_admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          agencyUser.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {agencyUser.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Vista móvil */}
          <div className="md:hidden space-y-3">
            {users.slice(0, 5).map((agencyUser) => (
              <div key={agencyUser.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {agencyUser.firstName} {agencyUser.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{agencyUser.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      agencyUser.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {agencyUser.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    agencyUser.role === 'agency_admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {agencyUser.role === 'agency_admin' ? 'Admin' : 'Usuario'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehículos Recientes */}
      {vehicles.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🚗 Vehículos Recientes
            </h3>
            <Link
              to="/vehicles"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Ver Todos →
            </Link>
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.slice(0, 5).map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        {vehicle.brand} {vehicle.model}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {vehicle.version}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(vehicle.kilometers)} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${formatNumber(vehicle.price)} {vehicle.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          vehicle.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : vehicle.status === 'reserved'
                            ? 'bg-yellow-100 text-yellow-800'
                            : vehicle.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.status === 'available'
                          ? 'Disponible'
                          : vehicle.status === 'reserved'
                          ? 'Reservado'
                          : vehicle.status === 'sold'
                          ? 'Vendido'
                          : 'Pausado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Vista móvil */}
          <div className="md:hidden space-y-3">
            {vehicles.slice(0, 5).map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehicles/${vehicle.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary-600 truncate">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {vehicle.version}
                    </p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      vehicle.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'reserved'
                        ? 'bg-yellow-100 text-yellow-800'
                        : vehicle.status === 'sold'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.status === 'available'
                      ? 'Disponible'
                      : vehicle.status === 'reserved'
                      ? 'Reservado'
                      : vehicle.status === 'sold'
                      ? 'Vendido'
                      : 'Pausado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{vehicle.year} • {formatNumber(vehicle.kilometers)} km</span>
                  <span className="font-medium text-gray-900">
                    ${formatNumber(vehicle.price)} {vehicle.currency}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
