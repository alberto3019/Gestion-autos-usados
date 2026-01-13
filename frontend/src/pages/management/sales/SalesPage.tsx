import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { salesApi } from '../../../api/sales'
import { vehiclesApi } from '../../../api/vehicles'
import { usersApi } from '../../../api/users'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function SalesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    vehicleId: '',
    sellerId: '',
    clientId: '',
    salePrice: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const { data: vehicles } = useQuery({
    queryKey: ['vehiclesForSale'],
    queryFn: () => vehiclesApi.getMyVehicles({ limit: 1000 }),
  })

  const { data: users } = useQuery({
    queryKey: ['agencyUsers'],
    queryFn: usersApi.getAgencyUsers,
  })

  const createMutation = useMutation({
    mutationFn: salesApi.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] })
      navigate('/management/sales-stats')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as any)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar Venta</h1>

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
              {vehicles?.data
                .filter((v) => v.status !== 'sold')
                .map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.price}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendedor *
            </label>
            <select
              value={formData.sellerId}
              onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
              className="input"
              required
            >
              <option value="">Seleccionar vendedor</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Venta *
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Venta *
            </label>
            <Input
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              Registrar Venta
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/management/sales-stats')}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

