import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { cashflowApi } from '../../../api/cashflow'
import { vehiclesApi } from '../../../api/vehicles'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function CashflowFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: 'other',
    amount: '',
    currency: 'ARS' as 'ARS' | 'USD' | 'EUR',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
  })

  // Cargar vehículos para el selector
  const { data: vehicles } = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => vehiclesApi.getMyVehicles({ page: 1, limit: 1000 }),
  })

  // Determinar si se necesita seleccionar un vehículo
  const needsVehicle = 
    formData.category === 'vehicle_purchase' ||
    formData.category === 'vehicle_sale' ||
    formData.category === 'service' ||
    formData.category === 'maintenance' ||
    formData.category === 'other'

  const createMutation = useMutation({
    mutationFn: cashflowApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashflow'] })
      navigate('/management/cashflow')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as any)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Transacción</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="input"
              required
            >
              <option value="income">Ingreso</option>
              <option value="expense">Egreso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="vehicle_purchase">Compra de Vehículo</option>
              <option value="vehicle_sale">Venta de Vehículo</option>
              <option value="service">Servicio</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="payroll">Nómina</option>
              <option value="marketing">Marketing</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda *</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          {needsVehicle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehículo {formData.category === 'vehicle_purchase' ? '*' : '(opcional)'}
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="input"
                required={formData.category === 'vehicle_purchase'}
              >
                <option value="">Seleccionar vehículo</option>
                {vehicles?.data.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.price} {vehicle.currency}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              Crear Transacción
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/management/cashflow')}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

