import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { vehiclesApi } from '../../api/vehicles'
import { SearchFilters } from '../../types'
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { formatNumber } from '../../utils/format'

export default function SearchPage() {
  const location = useLocation()
  
  // Restaurar filtros desde el state si vienes de volver desde un vehículo
  const savedFilters = location.state?.filters as SearchFilters | undefined
  const savedQuickSearch = location.state?.quickSearch as string | undefined
  
  const [filters, setFilters] = useState<SearchFilters>(
    savedFilters || {
      page: 1,
      limit: 20,
    }
  )
  const [showFilters, setShowFilters] = useState(false)
  // Usar savedQuickSearch si existe, sino usar savedFilters?.search, sino string vacío
  const [quickSearch, setQuickSearch] = useState(
    savedQuickSearch || savedFilters?.search || ''
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['searchVehicles', filters],
    queryFn: () => vehiclesApi.searchVehicles(filters),
    retry: 1,
  })

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'page') {
      // Si estamos cambiando la página, solo actualizamos la página
      setFilters((prev) => ({ ...prev, page: value }))
    } else {
      // Si estamos cambiando otro filtro, reseteamos a la página 1
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
    }
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Busca en marca, modelo o versión según lo que escriba el usuario
    const searchTerm = quickSearch.trim()
    if (searchTerm) {
      setFilters({ 
        search: searchTerm,
        page: 1,
        limit: 20
      })
    } else {
      setFilters({ page: 1, limit: 20 })
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Buscar Vehículos en la Red
      </h1>

      {/* Barra de Búsqueda Principal */}
      <div className="mb-6">
        <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por marca o modelo..."
              className="input pl-10 w-full"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button type="submit" variant="primary" className="flex-1 sm:flex-none flex items-center justify-center">
              <MagnifyingGlassIcon className="h-5 w-5 sm:mr-2" />
              <span>Buscar</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none flex items-center justify-center"
            >
              <FunnelIcon className="h-5 w-5 sm:mr-2" />
              <span>{showFilters ? 'Ocultar' : 'Filtros'}</span>
            </Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar - Colapsable */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="card space-y-4 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Filtros Avanzados</h3>

            <Input
              label="Marca"
              placeholder="Ej: Toyota"
              value={filters.brand || ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />

            <Input
              label="Modelo"
              placeholder="Ej: Corolla"
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />

            <Input
              label="Color"
              placeholder="Ej: BLANCO"
              value={filters.color || ''}
              onChange={(e) => handleFilterChange('color', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Año Desde"
                type="number"
                placeholder="2018"
                value={filters.yearMin || ''}
                onChange={(e) =>
                  handleFilterChange('yearMin', parseInt(e.target.value) || undefined)
                }
              />
              <Input
                label="Año Hasta"
                type="number"
                placeholder="2024"
                value={filters.yearMax || ''}
                onChange={(e) =>
                  handleFilterChange('yearMax', parseInt(e.target.value) || undefined)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Precio Mín"
                type="number"
                placeholder="0"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  handleFilterChange('priceMin', parseInt(e.target.value) || undefined)
                }
              />
              <Input
                label="Precio Máx"
                type="number"
                placeholder="10000000"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  handleFilterChange('priceMax', parseInt(e.target.value) || undefined)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Combustible
              </label>
              <select
                className="input"
                value={filters.fuelType || ''}
                onChange={(e) => handleFilterChange('fuelType', e.target.value || undefined)}
              >
                <option value="">Todos</option>
                <option value="gasoline">Nafta</option>
                <option value="diesel">Diésel</option>
                <option value="hybrid">Híbrido</option>
                <option value="electric">Eléctrico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincia
              </label>
              <select
                className="input"
                value={filters.locationState || ''}
                onChange={(e) => handleFilterChange('locationState', e.target.value || undefined)}
              >
                <option value="">Todas las provincias</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                <option value="Catamarca">Catamarca</option>
                <option value="Chaco">Chaco</option>
                <option value="Chubut">Chubut</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Corrientes">Corrientes</option>
                <option value="Entre Ríos">Entre Ríos</option>
                <option value="Formosa">Formosa</option>
                <option value="Jujuy">Jujuy</option>
                <option value="La Pampa">La Pampa</option>
                <option value="La Rioja">La Rioja</option>
                <option value="Mendoza">Mendoza</option>
                <option value="Misiones">Misiones</option>
                <option value="Neuquén">Neuquén</option>
                <option value="Río Negro">Río Negro</option>
                <option value="Salta">Salta</option>
                <option value="San Juan">San Juan</option>
                <option value="San Luis">San Luis</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Santa Fe">Santa Fe</option>
                <option value="Santiago del Estero">Santiago del Estero</option>
                <option value="Tierra del Fuego">Tierra del Fuego</option>
                <option value="Tucumán">Tucumán</option>
              </select>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setFilters({ page: 1, limit: 20 })
                setQuickSearch('')
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
        )}

        {/* Results */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {isLoading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : error ? (
            <div className="card text-center py-12">
              <p className="text-red-500 mb-2">Error al cargar los vehículos</p>
              <p className="text-sm text-gray-500">{String(error)}</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setFilters({ page: 1, limit: 20 })
                  setQuickSearch('')
                }}
              >
                Reintentar
              </Button>
            </div>
          ) : data && data.data && data.data.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Mostrando {data.data.length} de {data.total} vehículos
              </p>

              <div className={`grid gap-4 mb-6 ${
                showFilters 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'
              }`}>
                {data.data.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    to={`/vehicles/${vehicle.id}`}
                    state={{ 
                      from: 'search',
                      filters: filters,
                      quickSearch: quickSearch
                    }}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={vehicle.photos[0]?.url || '/placeholder.jpg'}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-lg mb-1">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {vehicle.version}
                    </p>
                    <p className="text-xl font-bold text-primary-600 mb-2">
                      ${formatNumber(vehicle.price)} {vehicle.currency}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>{vehicle.year}</span>
                      <span>{formatNumber(vehicle.kilometers)} km</span>
                    </div>
                    <StatusBadge status={vehicle.status} />
                    <div className="mt-2 space-y-1">
                      {vehicle.locationCity && vehicle.locationState && (
                        <p className="text-xs text-gray-500">
                          📍 {vehicle.locationCity}, {vehicle.locationState}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 font-medium">
                        {vehicle.agency?.commercialName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={(page) => handleFilterChange('page', page)}
              />
            </>
          ) : data && data.total === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">
                No se encontraron vehículos con los filtros aplicados
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setFilters({ page: 1, limit: 20 })
                  setQuickSearch('')
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

