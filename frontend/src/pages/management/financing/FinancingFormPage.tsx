import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { financingApi } from '../../../api/financing'
import { vehiclesApi } from '../../../api/vehicles'
import { clientsApi } from '../../../api/clients'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function FinancingFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    vehicleId: '',
    clientId: '',
    financier: '',
    amount: '',
    currency: 'ARS' as 'ARS' | 'USD' | 'EUR',
    installments: 12,
    interestRate: '',
    status: 'pending',
    applicationDate: new Date().toISOString().split('T')[0],
    approvalDate: '',
    notes: '',
  })

  const { data: financingData } = useQuery({
    queryKey: ['financing', id],
    queryFn: () => financingApi.getFinancing(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (financingData) {
      setFormData({
        vehicleId: financingData.vehicleId,
        clientId: financingData.clientId || '',
        financier: financingData.financier,
        amount: financingData.amount.toString(),
        currency: (financingData as any).currency || 'ARS',
        installments: financingData.installments,
        interestRate: financingData.interestRate?.toString() || '',
        status: financingData.status,
        applicationDate: new Date(financingData.applicationDate).toISOString().split('T')[0],
        approvalDate: financingData.approvalDate ? new Date(financingData.approvalDate).toISOString().split('T')[0] : '',
        notes: financingData.notes || '',
      })
    }
  }, [financingData])

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getMyVehicles({ limit: 1000 }),
  })

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getClients({ page: 1, limit: 1000 }),
  })

  const createMutation = useMutation({
    mutationFn: financingApi.createFinancing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing'] })
      navigate('/management/financing')
    },
    onError: (error: any) => {
      console.error('Error creating financing:', error)
      alert(error?.response?.data?.message || 'Error al crear financiamiento')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => financingApi.updateFinancing(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing'] })
      navigate('/management/financing')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: any = {
      vehicleId: formData.vehicleId,
      financier: formData.financier,
      amount: formData.amount,
      installments: formData.installments,
      interestRate: formData.interestRate || undefined,
      status: formData.status,
      applicationDate: formData.applicationDate,
      approvalDate: formData.approvalDate || undefined,
      notes: formData.notes || undefined,
      clientId: formData.clientId || undefined,
    }

    if (isEditing) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Financiamiento' : 'Nuevo Financiamiento'}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <Link
                to="/management/clients/new"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Crear nuevo
              </Link>
            </div>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="input"
            >
              <option value="">Sin cliente</option>
              {clients?.data.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} {client.email ? `(${client.email})` : ''}
                </option>
              ))}
            </select>
            {formData.clientId && clients?.data.find(c => c.id === formData.clientId) && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                <p><strong>Email:</strong> {clients.data.find(c => c.id === formData.clientId)?.email || 'N/A'}</p>
                <p><strong>Teléfono:</strong> {clients.data.find(c => c.id === formData.clientId)?.phone || 'N/A'}</p>
                {clients.data.find(c => c.id === formData.clientId)?.alertEnabled && (
                  <p className="text-primary-600 mt-1">
                    ⚠️ Alertas habilitadas ({clients.data.find(c => c.id === formData.clientId)?.alertDays} días)
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financiera *
            </label>
            <Input
              value={formData.financier}
              onChange={(e) => setFormData({ ...formData, financier: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                className="input"
                required
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuotas *
              </label>
              <Input
                type="number"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pending' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.status === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Pendiente
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'approved' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.status === 'approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Aprobado
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'rejected' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.status === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Rechazado
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'completed' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.status === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                Completado
              </button>
            </div>
            <input type="hidden" value={formData.status} name="status" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEditing ? 'Actualizar' : 'Crear'} Financiamiento
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/management/financing')}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

