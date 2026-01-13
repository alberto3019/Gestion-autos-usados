import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { inspectionsApi } from '../../../api/inspections'
import Button from '../../../components/common/Button'

export default function InspectionsPage() {
  const queryClient = useQueryClient()
  const [vehicleId, setVehicleId] = useState<string>('')

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['inspections', vehicleId],
    queryFn: () => inspectionsApi.getInspections({ vehicleId: vehicleId || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: inspectionsApi.deleteInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Peritajes</h1>
        <Link to="/management/inspections/new">
          <Button>Nuevo Peritaje</Button>
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por ID de vehículo (opcional)"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="input"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspections?.map((inspection) => (
            <div key={inspection.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{inspection.inspectorName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(inspection.inspectionDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  inspection.status === 'approved' ? 'bg-green-100 text-green-800' :
                  inspection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {inspection.status}
                </span>
              </div>
              {inspection.vehicle && (
                <p className="text-sm text-gray-600 mb-2">
                  {inspection.vehicle.brand} {inspection.vehicle.model}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Link to={`/management/inspections/${inspection.id}`}>
                  <Button size="sm">Ver Detalle</Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm('¿Eliminar este peritaje?')) {
                      deleteMutation.mutate(inspection.id)
                    }
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

