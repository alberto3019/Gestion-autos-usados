import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { financingApi } from '../../../api/financing'
import { vehiclesApi } from '../../../api/vehicles'
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

  const createMutation = useMutation({
    mutationFn: financingApi.createFinancing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing'] })
      navigate('/management/financing')
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
    if (isEditing) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData as any)
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
                  {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
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
              <option value="completed">Completado</option>
            </select>
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

