import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { inspectionsApi } from '../../../api/inspections'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function InspectionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    vehicleId: '',
    inspectorName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    observations: '',
    status: 'pending',
    data: {},
  })

  const createMutation = useMutation({
    mutationFn: inspectionsApi.createInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      navigate('/management/inspections')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as any)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Peritaje' : 'Nuevo Peritaje'}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID del Vehículo *
            </label>
            <Input
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Inspector *
            </label>
            <Input
              value={formData.inspectorName}
              onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inspección *
            </label>
            <Input
              type="date"
              value={formData.inspectionDate}
              onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
            >
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="input"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {isEditing ? 'Actualizar' : 'Crear'} Peritaje
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/management/inspections')}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

