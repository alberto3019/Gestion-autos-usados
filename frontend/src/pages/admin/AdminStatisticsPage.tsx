import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
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
} from 'recharts';
import {
  ChartBarIcon,
  TruckIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  HeartIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminStatisticsPage() {
  const { data: basicStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  const { data: advancedStats, isLoading, error } = useQuery({
    queryKey: ['adminAdvancedStats'],
    queryFn: adminApi.getAdvancedStats,
  });

  console.log('Advanced Stats:', advancedStats);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar estadísticas: {(error as any).message}</p>
      </div>
    );
  }

  // Preparar datos para gráficos
  const vehiclesByBrandData = advancedStats?.vehiclesByBrand || [];
  const vehiclesByStatusData = advancedStats?.vehiclesByStatus?.map((item: any) => ({
    name:
      item.status === 'available'
        ? 'Disponible'
        : item.status === 'reserved'
        ? 'Reservado'
        : item.status === 'sold'
        ? 'Vendido'
        : 'Pausado',
    value: item.count,
  })) || [];
  const vehiclesByFuelTypeData = advancedStats?.vehiclesByFuelType?.map((item: any) => ({
    name:
      item.fuelType === 'gasoline'
        ? 'Nafta'
        : item.fuelType === 'diesel'
        ? 'Diésel'
        : item.fuelType === 'hybrid'
        ? 'Híbrido'
        : item.fuelType === 'electric'
        ? 'Eléctrico'
        : 'Otro',
    value: item.count,
  })) || [];

  const vehiclesByStateData = advancedStats?.vehiclesByState?.map((item: any) => ({
    name: item.state,
    value: item.count,
  })) || [];

  console.log('Vehicles by Brand:', vehiclesByBrandData);
  console.log('Vehicles by Status:', vehiclesByStatusData);
  console.log('Vehicles by Fuel:', vehiclesByFuelTypeData);
  console.log('Vehicles by State:', vehiclesByStateData);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Estadísticas Completas de la Plataforma
        </h1>
        <Link
          to="/admin"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Agencias</p>
              <p className="text-3xl font-bold mt-1">
                {basicStats?.agencies.total || 0}
              </p>
              <p className="text-blue-100 text-xs mt-1">
                {basicStats?.agencies.active} activas
              </p>
            </div>
            <BuildingOfficeIcon className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Vehículos</p>
              <p className="text-3xl font-bold mt-1">
                {basicStats?.vehicles.total || 0}
              </p>
              <p className="text-green-100 text-xs mt-1">
                {basicStats?.vehicles.available} disponibles
              </p>
            </div>
            <TruckIcon className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold mt-1">
                {advancedStats?.users.total || 0}
              </p>
              <p className="text-purple-100 text-xs mt-1">En toda la red</p>
            </div>
            <UsersIcon className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Valor Inventario</p>
              <p className="text-2xl font-bold mt-1">
                ${(advancedStats?.inventoryValue || 0).toLocaleString()}
              </p>
              <p className="text-yellow-100 text-xs mt-1">
                Vehículos disponibles
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-yellow-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <HeartIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Favoritos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {advancedStats?.favorites.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <PhoneIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Contactos WhatsApp
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {basicStats?.whatsappClicks.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Nuevas Agencias (30d)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {advancedStats?.growth.agencies || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Nuevos Vehículos (30d)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {advancedStats?.growth.vehicles || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vehículos por Marca */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
            Top 10 Marcas
          </h3>
          {vehiclesByBrandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehiclesByBrandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos de vehículos por marca
            </div>
          )}
        </div>

        {/* Vehículos por Estado */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
            Vehículos por Estado
          </h3>
          {vehiclesByStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehiclesByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehiclesByStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos de vehículos por estado
            </div>
          )}
        </div>
      </div>

      {/* Segundo set de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vehículos por Tipo de Combustible */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
            Vehículos por Combustible
          </h3>
          {vehiclesByFuelTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehiclesByFuelTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehiclesByFuelTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos de vehículos por combustible
            </div>
          )}
        </div>

        {/* Top Agencias por Vehículos */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
            Top 10 Agencias (por vehículos)
          </h3>
          {advancedStats?.topAgenciesByVehicles && advancedStats.topAgenciesByVehicles.length > 0 ? (
            <div className="space-y-3">
              {advancedStats.topAgenciesByVehicles
                .slice(0, 10)
                .map((agency: any, index: number) => (
                  <div
                    key={agency.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="font-bold text-gray-400 mr-3">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {agency.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary-600">
                      {agency.vehicleCount} vehículos
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No hay datos de agencias
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Ubicación por Provincia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vehículos por Provincia */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
            Vehículos por Provincia
          </h3>
          {vehiclesByStateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehiclesByStateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehiclesByStateData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos de ubicación por provincia
            </div>
          )}
        </div>

        {/* Espacio vacío o futuro gráfico */}
        <div className="hidden lg:block"></div>
      </div>

      {/* Tablas de Top Vehículos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vehículos por Favoritos */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HeartIcon className="h-5 w-5 mr-2 text-red-600" />
            Top 10 Vehículos Más Favoriteados
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Agencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Favoritos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advancedStats?.topVehiclesByFavorites && advancedStats.topVehiclesByFavorites.length > 0 ? (
                  advancedStats.topVehiclesByFavorites
                    .slice(0, 10)
                    .map((vehicle: any) => (
                      <tr key={vehicle.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Link
                            to={`/vehicles/${vehicle.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {vehicle.brand} {vehicle.model} {vehicle.year}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {vehicle.agencyName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">
                          ❤️ {vehicle.favoriteCount}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No hay vehículos favoriteados aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vehículos por Contactos */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2 text-green-600" />
            Top 10 Vehículos Más Contactados
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Agencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contactos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advancedStats?.topVehiclesByContacts && advancedStats.topVehiclesByContacts.length > 0 ? (
                  advancedStats.topVehiclesByContacts
                    .slice(0, 10)
                    .map((vehicle: any) => (
                      <tr key={vehicle.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Link
                            to={`/vehicles/${vehicle.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {vehicle.brand} {vehicle.model} {vehicle.year}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {vehicle.agencyName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600">
                          📞 {vehicle.contactCount}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No hay vehículos contactados aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

