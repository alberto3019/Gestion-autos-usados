import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { vehiclesApi } from '../../api/vehicles'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import Button from '../../components/common/Button'
import Pagination from '../../components/common/Pagination'
import { formatNumber } from '../../utils/format'

export default function MyVehiclesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 20
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<string>('available')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['myVehicles', page, limit, searchTerm],
    queryFn: () => vehiclesApi.getMyVehicles({ page, limit, search: searchTerm }),
  })

  // Limpiar selección al cambiar de página o búsqueda
  useEffect(() => {
    setSelectedVehicles(new Set())
    setShowBulkActions(false)
  }, [page, searchTerm])

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const deleteMutation = useMutation({
    mutationFn: vehiclesApi.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      vehiclesApi.updateVehicleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
    },
  })

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ vehicleIds, status }: { vehicleIds: string[]; status: string }) =>
      vehiclesApi.bulkUpdateStatus(vehicleIds, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
      setSelectedVehicles(new Set())
      setShowBulkActions(false)
      alert(data.message || `${data.count} vehículo(s) actualizado(s) exitosamente`)
    },
    onError: (error: any) => {
      alert(
        `Error al cambiar estado: ${error.response?.data?.message || error.message}`
      )
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (vehicleIds: string[]) => vehiclesApi.bulkDelete(vehicleIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
      setSelectedVehicles(new Set())
      setShowBulkActions(false)
      alert(data.message || `${data.count} vehículo(s) eliminado(s) exitosamente`)
    },
    onError: (error: any) => {
      alert(
        `Error al eliminar: ${error.response?.data?.message || error.message}`
      )
    },
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => vehiclesApi.importVehicles(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
      setShowImportModal(false)
      setImportFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      alert(
        `Importación completada:\n${data.success} vehículos importados exitosamente\n${data.errors} errores\n\n${
          data.errorsDetails.length > 0
            ? 'Errores:\n' +
              data.errorsDetails
                .map((e) => `Fila ${e.row}: ${e.error}`)
                .join('\n')
            : ''
        }`
      )
    },
    onError: (error: any) => {
      alert(
        `Error al importar: ${error.response?.data?.message || error.message}`
      )
    },
  })

  const exportMutation = useMutation({
    mutationFn: () => vehiclesApi.exportVehicles(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vehiculos_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onError: (error: any) => {
      alert(
        `Error al exportar: ${error.response?.data?.message || error.message}`
      )
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este vehículo?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateStatusMutation.mutateAsync({ id, status: newStatus })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.xls')
      ) {
        alert('Por favor selecciona un archivo Excel (.xlsx o .xls)')
        return
      }
      setImportFile(file)
    }
  }

  const handleImport = () => {
    if (!importFile) {
      alert('Por favor selecciona un archivo')
      return
    }
    importMutation.mutate(importFile)
  }

  const handleExport = () => {
    exportMutation.mutate()
  }

  const handleSelectVehicle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles)
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId)
    } else {
      newSelected.add(vehicleId)
    }
    setSelectedVehicles(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = () => {
    if (data && selectedVehicles.size === data.data.length) {
      setSelectedVehicles(new Set())
      setShowBulkActions(false)
    } else if (data) {
      const allIds = new Set(data.data.map((v) => v.id))
      setSelectedVehicles(allIds)
      setShowBulkActions(true)
    }
  }

  const handleOpenStatusModal = () => {
    if (selectedVehicles.size === 0) {
      alert('Por favor selecciona al menos un vehículo')
      return
    }
    setShowStatusModal(true)
  }

  const handleBulkStatusChange = () => {
    bulkUpdateStatusMutation.mutate({
      vehicleIds: Array.from(selectedVehicles),
      status: bulkStatus,
    })
    setShowStatusModal(false)
  }

  const handleBulkDelete = () => {
    if (selectedVehicles.size === 0) {
      alert('Por favor selecciona al menos un vehículo')
      return
    }
    if (
      window.confirm(
        `¿Estás seguro de eliminar ${selectedVehicles.size} vehículo(s)? Esta acción no se puede deshacer.`
      )
    ) {
      bulkDeleteMutation.mutate(Array.from(selectedVehicles))
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1
  const allSelected = data && selectedVehicles.size === data.data.length && data.data.length > 0

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mis Vehículos</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="w-full sm:w-auto"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
            {exportMutation.isPending ? 'Exportando...' : 'Exportar Excel'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2 inline" />
            Importar Excel
          </Button>
          <Link to="/vehicles/new" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              <PlusIcon className="h-5 w-5 mr-2 inline" />
              Nuevo Vehículo
            </Button>
          </Link>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por marca, modelo o versión..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Barra de acciones masivas */}
      {showBulkActions && (
        <div className="card mb-4 bg-primary-50 border border-primary-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedVehicles.size} vehículo(s) seleccionado(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={handleOpenStatusModal}
                disabled={bulkUpdateStatusMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                Cambiar Estado
              </Button>
              <Button
                variant="danger"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {bulkDeleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedVehicles(new Set())
                  setShowBulkActions(false)
                }}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : data && data.data.length > 0 ? (
        <>
          {/* Vista de tabla para desktop */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Foto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Año / Km
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
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
                  {data.data.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className={
                        selectedVehicles.has(vehicle.id)
                          ? 'bg-primary-50'
                          : ''
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVehicles.has(vehicle.id)}
                          onChange={() => handleSelectVehicle(vehicle.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={vehicle.photos[0]?.url || '/placeholder.jpg'}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-16 w-24 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.version}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.year} / {formatNumber(vehicle.kilometers)} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${formatNumber(vehicle.price)} {vehicle.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={vehicle.status}
                          onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${
                            vehicle.status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : vehicle.status === 'reserved'
                              ? 'bg-yellow-100 text-yellow-800'
                              : vehicle.status === 'sold'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="available">Disponible</option>
                          <option value="reserved">Reservado</option>
                          <option value="sold">Vendido</option>
                          <option value="paused">Pausado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link to={`/vehicles/${vehicle.id}/edit`}>
                          <button className="text-primary-600 hover:text-primary-900">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de tarjetas para móvil */}
          <div className="md:hidden space-y-4">
            {data.data.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`card ${
                  selectedVehicles.has(vehicle.id) ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.has(vehicle.id)}
                    onChange={() => handleSelectVehicle(vehicle.id)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <img
                    src={vehicle.photos[0]?.url || '/placeholder.jpg'}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-24 w-32 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {vehicle.version}
                    </p>
                    <p className="text-lg font-bold text-primary-600 mt-1">
                      ${formatNumber(vehicle.price)} {vehicle.currency}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {vehicle.year} • {formatNumber(vehicle.kilometers)} km
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <select
                    value={vehicle.status}
                    onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primary-500 flex-1 ${
                      vehicle.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'reserved'
                        ? 'bg-yellow-100 text-yellow-800'
                        : vehicle.status === 'sold'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value="available">Disponible</option>
                    <option value="reserved">Reservado</option>
                    <option value="sold">Vendido</option>
                    <option value="paused">Pausado</option>
                  </select>

                  <div className="flex gap-2">
                    <Link to={`/vehicles/${vehicle.id}/edit`}>
                      <button className="p-2 text-primary-600 hover:text-primary-900 bg-primary-50 rounded-lg">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-red-600 hover:text-red-900 bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            No tienes vehículos cargados aún
          </p>
          <Link to="/vehicles/new">
            <Button variant="primary">Cargar Primer Vehículo</Button>
          </Link>
        </div>
      )}

      {/* Modal de Importación */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Importar Vehículos desde Excel
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo Excel (.xlsx o .xls)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {importFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Archivo seleccionado: {importFile.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Formato requerido:
                </p>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li><strong>Todos los campos son requeridos excepto Fotos:</strong></li>
                  <li>Marca, Modelo, Versión, Año, Kilómetros, Combustible, Transmisión, Color, Patente, Ocultar_Patente, Precio, Moneda, Condición, Estado, Ciudad, Provincia, Notas_Internas, Notas_Públicas</li>
                  <li>Fotos es opcional (separar múltiples URLs con ; o ,)</li>
                  <li>La primera fila debe contener los nombres de las columnas</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={!importFile || importMutation.isPending}
                  className="flex-1"
                >
                  {importMutation.isPending ? 'Importando...' : 'Importar'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cambio de Estado */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Cambiar Estado de Vehículos
              </h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona el nuevo estado para {selectedVehicles.size} vehículo(s) seleccionado(s):
              </p>

              <div className="space-y-2 mb-6">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="available"
                    checked={bulkStatus === 'available'}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    Disponible
                  </span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="reserved"
                    checked={bulkStatus === 'reserved'}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    Reservado
                  </span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="sold"
                    checked={bulkStatus === 'sold'}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                    Vendido
                  </span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="paused"
                    checked={bulkStatus === 'paused'}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    Pausado
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleBulkStatusChange}
                  disabled={bulkUpdateStatusMutation.isPending}
                  className="flex-1"
                >
                  {bulkUpdateStatusMutation.isPending ? 'Cambiando...' : 'Confirmar'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
