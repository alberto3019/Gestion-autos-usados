import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { inspectionsApi } from '../../../api/inspections'
import Button from '../../../components/common/Button'

export default function InspectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionsApi.getInspection(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="text-center py-8">Cargando...</div>
  if (!inspection) return <div>Peritaje no encontrado</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detalle del Peritaje</h1>
        <Button variant="secondary" onClick={() => navigate('/management/inspections')}>
          Volver
        </Button>
      </div>

      <div className="card max-w-3xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Inspector</label>
            <p className="text-lg">{inspection.inspectorName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Fecha</label>
            <p className="text-lg">{new Date(inspection.inspectionDate).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <p className="text-lg">{inspection.status}</p>
          </div>

          {inspection.observations && (
            <div>
              <label className="text-sm font-medium text-gray-500">Observaciones</label>
              <p className="text-lg">{inspection.observations}</p>
            </div>
          )}

          {inspection.vehicle && (
            <div>
              <label className="text-sm font-medium text-gray-500">Vehículo</label>
              <p className="text-lg">
                {inspection.vehicle.brand} {inspection.vehicle.model} ({inspection.vehicle.year})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

