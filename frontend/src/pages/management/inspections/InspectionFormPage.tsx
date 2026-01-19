import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { inspectionsApi } from '../../../api/inspections'
import { vehiclesApi } from '../../../api/vehicles'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import PeritajeMecanicoTab from './components/PeritajeMecanicoTab'
import ChecklistGeneralTab from './components/ChecklistGeneralTab'
import ControlTrenTab from './components/ControlTrenTab'
import SistemaFrenosTab from './components/SistemaFrenosTab'
import {
  InspectionData,
  createEmptyInspectionData,
  type PeritajeMecanico,
  type ChecklistGeneral,
  type ControlTren,
  type SistemaFrenos,
} from './utils/inspectionDataSchema'
import clsx from 'clsx'

type TabId = 'mecanico' | 'checklist' | 'tren' | 'frenos'

export default function InspectionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id
  const [activeTab, setActiveTab] = useState<TabId>('mecanico')

  const [formData, setFormData] = useState({
    vehicleId: '',
    inspectorName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    observations: '',
    status: 'pending',
    data: createEmptyInspectionData(),
  })

  // Load inspection data if editing
  const { data: inspectionData } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionsApi.getInspection(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (inspectionData) {
      // Try to parse the data structure, or create empty if invalid
      let parsedData: InspectionData
      try {
        if (
          inspectionData.data &&
          typeof inspectionData.data === 'object' &&
          ('mecanico' in inspectionData.data || 'checklist' in inspectionData.data)
        ) {
          parsedData = inspectionData.data as InspectionData
        } else {
          parsedData = createEmptyInspectionData()
        }
      } catch {
        parsedData = createEmptyInspectionData()
      }

      setFormData({
        vehicleId: inspectionData.vehicleId,
        inspectorName: inspectionData.inspectorName,
        inspectionDate: new Date(inspectionData.inspectionDate).toISOString().split('T')[0],
        observations: inspectionData.observations || '',
        status: inspectionData.status,
        data: parsedData,
      })
    }
  }, [inspectionData])

  // Load vehicles for selector
  const { data: vehicles } = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => vehiclesApi.getMyVehicles({ page: 1, limit: 1000 }),
  })

  const selectedVehicle = vehicles?.data.find((v) => v.id === formData.vehicleId)

  const createMutation = useMutation({
    mutationFn: inspectionsApi.createInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      navigate('/management/inspections')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => inspectionsApi.updateInspection(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      navigate('/management/inspections')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      data: formData.data,
    }
    if (isEditing) {
      updateMutation.mutate(submitData as any)
    } else {
      createMutation.mutate(submitData as any)
    }
  }

  const handleDataUpdate = (section: keyof InspectionData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: data,
      },
    }))
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'mecanico', label: 'PERITAJE MECÁNICO' },
    { id: 'checklist', label: 'Checklist General' },
    { id: 'tren', label: 'Control Tren' },
    { id: 'frenos', label: 'Sistema de Frenos' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Peritaje' : 'Nuevo Peritaje'}
        </h1>
        <Button variant="secondary" onClick={() => navigate('/management/inspections')}>
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehículo *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="input"
                required
              >
                <option value="">Seleccionar vehículo</option>
                {vehicles?.data.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
              </select>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Generales
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="input"
                rows={3}
                placeholder="Observaciones generales del peritaje..."
              />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="card mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    {
                      'border-primary-500 text-primary-600': activeTab === tab.id,
                      'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                        activeTab !== tab.id,
                    }
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'mecanico' && (
              <PeritajeMecanicoTab
                data={formData.data.mecanico}
                onChange={(data) => handleDataUpdate('mecanico', data)}
                vehicleData={
                  selectedVehicle
                    ? {
                        brand: selectedVehicle.brand,
                        model: selectedVehicle.model,
                        year: selectedVehicle.year,
                        color: selectedVehicle.color || undefined,
                        licensePlate: selectedVehicle.licensePlate || undefined,
                        kilometers: selectedVehicle.kilometers,
                      }
                    : undefined
                }
              />
            )}

            {activeTab === 'checklist' && (
              <ChecklistGeneralTab
                data={formData.data.checklist}
                onChange={(data) => handleDataUpdate('checklist', data)}
              />
            )}

            {activeTab === 'tren' && (
              <ControlTrenTab
                data={formData.data.tren}
                onChange={(data) => handleDataUpdate('tren', data)}
              />
            )}

            {activeTab === 'frenos' && (
              <SistemaFrenosTab
                data={formData.data.frenos}
                onChange={(data) => handleDataUpdate('frenos', data)}
              />
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/management/inspections')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEditing ? 'Actualizar' : 'Crear'} Peritaje
          </Button>
        </div>
      </form>
    </div>
  )
}
