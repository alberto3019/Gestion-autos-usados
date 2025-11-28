import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { activityLogsApi } from '../../api/activity-logs';
import Pagination from '../../components/common/Pagination';
import {
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const activityTypeLabels: Record<string, string> = {
  agency_registered: '🏢 Agencia Registrada',
  agency_approved: '✅ Agencia Aprobada',
  agency_blocked: '🚫 Agencia Bloqueada',
  agency_updated: '✏️ Agencia Actualizada',
  user_created: '👤 Usuario Creado',
  user_updated: '✏️ Usuario Actualizado',
  user_deleted: '❌ Usuario Eliminado',
  user_login: '🔑 Inicio de Sesión',
  user_logout: '🔓 Cierre de Sesión',
  vehicle_created: '🚗 Vehículo Creado',
  vehicle_updated: '✏️ Vehículo Actualizado',
  vehicle_deleted: '❌ Vehículo Eliminado',
  vehicle_status_changed: '🔄 Estado Cambiado',
  favorite_added: '❤️ Favorito Agregado',
  favorite_removed: '💔 Favorito Removido',
  whatsapp_contact: '📞 Contacto WhatsApp',
  search_performed: '🔍 Búsqueda Realizada',
};

export default function AdminActivitiesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['activityLogs', page, filters],
    queryFn: () =>
      activityLogsApi.getAll({
        page,
        limit: 50,
        ...filters,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['activityStats'],
    queryFn: activityLogsApi.getStats,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      dateFrom: '',
      dateTo: '',
    });
    setPage(1);
  };

  const totalPages = logsData ? logsData.totalPages : 1;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
          Registro de Actividades
        </h1>
        <Link
          to="/admin"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Estadísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-sm font-medium text-gray-600">
              Total Actividades
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              {stats.totalActivities}
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Hoy</p>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.todayActivities}
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Últimos 7 días</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.weekActivities}
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">
              Actividad más frecuente
            </p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              {stats.activitiesByType?.[0]?.type
                ? activityTypeLabels[stats.activitiesByType[0].type] ||
                  stats.activitiesByType[0].type
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {stats.activitiesByType?.[0]?._count || 0} veces
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-700 font-medium mb-4"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Actividad
              </label>
              <select
                className="input"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Todos</option>
                {Object.entries(activityTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                className="input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                className="input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        )}

        {(filters.type || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={handleClearFilters}
            className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Lista de Actividades */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando actividades...</p>
          </div>
        ) : logsData && logsData.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsData.data.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString('es-AR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                          {activityTypeLabels[log.type] || log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No se encontraron actividades con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

