import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { balancesApi } from '../../../api/balances'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function VehicleBalanceFormPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    purchasePrice: '',
    purchasePriceCurrency: 'ARS' as 'ARS' | 'USD' | 'EUR',
    investment: '',
    investmentCurrency: 'ARS' as 'ARS' | 'USD' | 'EUR',
    salePrice: '',
    salePriceCurrency: 'ARS' as 'ARS' | 'USD' | 'EUR',
  })

  const { data: balance, isLoading } = useQuery({
    queryKey: ['vehicleBalance', vehicleId],
    queryFn: () => balancesApi.getVehicleBalance(vehicleId!),
    enabled: !!vehicleId,
  })

  useEffect(() => {
    if (balance) {
      setFormData({
        purchasePrice: balance.purchasePrice?.toString() || '',
        purchasePriceCurrency: 'ARS',
        investment: balance.investment?.toString() || '',
        investmentCurrency: 'ARS',
        salePrice: balance.salePrice?.toString() || '',
        salePriceCurrency: 'ARS',
      })
    }
  }, [balance])

  const updateMutation = useMutation({
    mutationFn: (data: any) => balancesApi.updateVehicleBalance(vehicleId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] })
      queryClient.invalidateQueries({ queryKey: ['vehicleBalance', vehicleId] })
      navigate('/management/balances')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      purchasePrice: formData.purchasePrice || undefined,
      purchasePriceCurrency: formData.purchasePriceCurrency,
      investment: formData.investment || undefined,
      investmentCurrency: formData.investmentCurrency,
      salePrice: formData.salePrice || null,
      salePriceCurrency: formData.salePriceCurrency,
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Editar Balance - {balance?.vehicle?.brand} {balance?.vehicle?.model}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Compra
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
              />
              <select
                value={formData.purchasePriceCurrency}
                onChange={(e) => setFormData({ ...formData, purchasePriceCurrency: e.target.value as any })}
                className="input"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inversión
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                value={formData.investment}
                onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                placeholder="0.00"
              />
              <select
                value={formData.investmentCurrency}
                onChange={(e) => setFormData({ ...formData, investmentCurrency: e.target.value as any })}
                className="input"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Venta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                placeholder="0.00"
              />
              <select
                value={formData.salePriceCurrency}
                onChange={(e) => setFormData({ ...formData, salePriceCurrency: e.target.value as any })}
                className="input"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {balance && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Ganancia:</span>
                <span className={balance.profit && balance.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {balance.profit ? `$${balance.profit.toLocaleString('es-AR')} ARS` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Margen de Ganancia:</span>
                <span>
                  {balance.profitMargin ? `${balance.profitMargin.toFixed(2)}%` : '-'}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              Actualizar Balance
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/management/balances')}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

