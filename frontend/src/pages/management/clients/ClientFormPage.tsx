import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { clientsApi } from '../../../api/clients'
import { vehiclesApi } from '../../../api/vehicles'
import { useAuthStore } from '../../../store/authStore'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',
    address: '',
    notes: '',
    currentVehicleId: '',
    desiredVehicleId: '',
    alertEnabled: false,
    alertDays: 30,
  })

  const [showCreateCurrentVehicle, setShowCreateCurrentVehicle] = useState(false)
  const [showCreateDesiredVehicle, setShowCreateDesiredVehicle] = useState(false)
  const [newCurrentVehicle, setNewCurrentVehicle] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
  })
  const [newDesiredVehicle, setNewDesiredVehicle] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
  })

  const { data: clientData } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getClient(id!),
    enabled: isEditing,
  })

  // Cargar vehículos para los selectores
  const { data: vehicles } = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => vehiclesApi.getMyVehicles({ page: 1, limit: 1000 }),
  })

  useEffect(() => {
    if (clientData) {
      setFormData({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email || '',
        phone: clientData.phone || '',
        documentType: clientData.documentType || '',
        documentNumber: clientData.documentNumber || '',
        address: clientData.address || '',
        notes: clientData.notes || '',
        currentVehicleId: clientData.currentVehicleId || '',
        desiredVehicleId: clientData.desiredVehicleId || '',
        alertEnabled: clientData.alertEnabled,
        alertDays: clientData.alertDays || 30,
      })
    }
  }, [clientData])

  const createMutation = useMutation({
    mutationFn: clientsApi.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      navigate('/management/clients')
    },
    onError: (error: any) => {
      console.error('Error creating client:', error)
      alert(error?.response?.data?.message || 'Error al crear cliente')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => clientsApi.updateClient(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      navigate('/management/clients')
    },
  })

  const { user } = useAuthStore()

  // Crear vehículo para currentVehicle
  const createCurrentVehicleMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const vehicle = await vehiclesApi.createVehicle({
        ...vehicleData,
        kilometers: 0,
        fuelType: 'gasoline',
        transmission: 'manual',
        price: 0,
        currency: 'ARS',
        condition: 'used',
        status: 'available',
      })
      setFormData({ ...formData, currentVehicleId: vehicle.id })
      setShowCreateCurrentVehicle(false)
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
      return vehicle
    },
  })

  // Crear vehículo para desiredVehicle
  const createDesiredVehicleMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const vehicle = await vehiclesApi.createVehicle({
        ...vehicleData,
        kilometers: 0,
        fuelType: 'gasoline',
        transmission: 'manual',
        price: 0,
        currency: 'ARS',
        condition: 'used',
        status: 'available',
      })
      setFormData({ ...formData, desiredVehicleId: vehicle.id })
      setShowCreateDesiredVehicle(false)
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
      return vehicle
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Si hay vehículos nuevos para crear, crearlos primero
      if (showCreateCurrentVehicle && newCurrentVehicle.brand && newCurrentVehicle.model) {
        await createCurrentVehicleMutation.mutateAsync(newCurrentVehicle)
      }
      if (showCreateDesiredVehicle && newDesiredVehicle.brand && newDesiredVehicle.model) {
        await createDesiredVehicleMutation.mutateAsync(newDesiredVehicle)
      }

      // Esperar un momento para que se actualicen los IDs
      await new Promise(resolve => setTimeout(resolve, 100))

      // Preparar datos para enviar
      const submitData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        documentType: formData.documentType || undefined,
        documentNumber: formData.documentNumber || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        currentVehicleId: formData.currentVehicleId || undefined,
        desiredVehicleId: formData.desiredVehicleId || undefined,
        alertEnabled: formData.alertEnabled,
        alertDays: formData.alertDays,
      }

      if (isEditing) {
        updateMutation.mutate(submitData)
      } else {
        createMutation.mutate(submitData)
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.alertEnabled}
                onChange={(e) => setFormData({ ...formData, alertEnabled: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Habilitar alertas</span>
            </label>
            {formData.alertEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días para alerta
                </label>
                <Input
                  type="number"
                  value={formData.alertDays}
                  onChange={(e) => setFormData({ ...formData, alertDays: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Vehículo Actual
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowCreateCurrentVehicle(!showCreateCurrentVehicle)
                  if (showCreateCurrentVehicle) {
                    setFormData({ ...formData, currentVehicleId: '' })
                  }
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showCreateCurrentVehicle ? 'Seleccionar existente' : 'Crear nuevo'}
              </button>
            </div>
            {showCreateCurrentVehicle ? (
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Marca"
                  value={newCurrentVehicle.brand}
                  onChange={(e) => setNewCurrentVehicle({ ...newCurrentVehicle, brand: e.target.value })}
                />
                <Input
                  placeholder="Modelo"
                  value={newCurrentVehicle.model}
                  onChange={(e) => setNewCurrentVehicle({ ...newCurrentVehicle, model: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Año"
                  value={newCurrentVehicle.year}
                  onChange={(e) => setNewCurrentVehicle({ ...newCurrentVehicle, year: parseInt(e.target.value) })}
                />
              </div>
            ) : (
              <select
                value={formData.currentVehicleId}
                onChange={(e) => setFormData({ ...formData, currentVehicleId: e.target.value })}
                className="input"
              >
                <option value="">Ninguno</option>
                {vehicles?.data.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Vehículo Deseado
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowCreateDesiredVehicle(!showCreateDesiredVehicle)
                  if (showCreateDesiredVehicle) {
                    setFormData({ ...formData, desiredVehicleId: '' })
                  }
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showCreateDesiredVehicle ? 'Seleccionar existente' : 'Crear nuevo'}
              </button>
            </div>
            {showCreateDesiredVehicle ? (
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Marca"
                  value={newDesiredVehicle.brand}
                  onChange={(e) => setNewDesiredVehicle({ ...newDesiredVehicle, brand: e.target.value })}
                />
                <Input
                  placeholder="Modelo"
                  value={newDesiredVehicle.model}
                  onChange={(e) => setNewDesiredVehicle({ ...newDesiredVehicle, model: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Año"
                  value={newDesiredVehicle.year}
                  onChange={(e) => setNewDesiredVehicle({ ...newDesiredVehicle, year: parseInt(e.target.value) })}
                />
              </div>
            ) : (
              <select
                value={formData.desiredVehicleId}
                onChange={(e) => setFormData({ ...formData, desiredVehicleId: e.target.value })}
                className="input"
              >
                <option value="">Ninguno</option>
                {vehicles?.data.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEditing ? 'Actualizar' : 'Crear'} Cliente
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/management/clients')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

