import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export default function AdminSubscriptionsPage() {
  const navigate = useNavigate()
  const { agencyId } = useParams()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'enterprise'>('basic')
  const [billingDay, setBillingDay] = useState<number>(5)
  const [paymentMethod, setPaymentMethod] = useState<string>('')

  const { data: modulesData, isLoading } = useQuery({
    queryKey: ['agencyModules', agencyId],
    queryFn: () => adminApi.getAgencyModules(agencyId!),
    enabled: !!agencyId,
  })

  // Inicializar los valores con los datos actuales
  useEffect(() => {
    if (modulesData?.subscription?.plan) {
      setSelectedPlan(modulesData.subscription.plan as 'basic' | 'premium' | 'enterprise')
    }
    if (modulesData?.subscription?.billingDay) {
      setBillingDay(modulesData.subscription.billingDay)
    }
    if (modulesData?.subscription?.paymentMethod) {
      setPaymentMethod(modulesData.subscription.paymentMethod)
    }
  }, [modulesData?.subscription])

  const updateMutation = useMutation({
    mutationFn: (data: { plan: 'basic' | 'premium' | 'enterprise'; billingDay?: number; paymentMethod?: string }) =>
      adminApi.updateAgencySubscription(agencyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyModules', agencyId] })
      queryClient.invalidateQueries({ queryKey: ['adminAgencies'] })
      alert('Plan actualizado exitosamente')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      console.error('Error al actualizar plan:', error)
      alert(`Error al actualizar plan: ${error?.response?.data?.message || error.message || 'Error desconocido'}`)
    },
  })

  if (!agencyId) {
    return <div>No se especificó agencia</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestión de Suscripción
      </h1>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Plan Actual</h2>
        {isLoading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : modulesData?.subscription ? (
          <div>
            <p className="text-gray-700 mb-2">
              Plan: <span className="font-semibold capitalize">{modulesData.subscription.plan}</span>
            </p>
            <p className="text-sm text-gray-500">
              Estado: {modulesData.subscription.isActive ? (
                <span className="text-green-600 font-medium">Activo</span>
              ) : (
                <span className="text-red-600 font-medium">Inactivo</span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No hay plan asignado</p>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Cambiar Plan</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as any)}
              className="input"
            >
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día de Vencimiento (1-31)
            </label>
            <Input
              type="number"
              min="1"
              max="31"
              value={billingDay}
              onChange={(e) => setBillingDay(parseInt(e.target.value) || 5)}
              placeholder="5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Día del mes en que vence el pago mensual (por defecto: 5)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <Input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Ej: Transferencia, Tarjeta, Mercado Pago"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate({ 
              plan: selectedPlan, 
              billingDay,
              paymentMethod: paymentMethod || undefined 
            })}
            disabled={updateMutation.isPending || isLoading}
            isLoading={updateMutation.isPending}
          >
            Actualizar Plan
          </Button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Módulos Habilitados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modulesData?.modules
            .filter((m: any) => m.isEnabled)
            .map((module: any) => (
              <div key={module.id} className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium">{module.module}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

