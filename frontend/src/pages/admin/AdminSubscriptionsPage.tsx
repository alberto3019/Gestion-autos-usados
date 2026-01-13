import { useState } from 'react'
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

  const { data: modulesData } = useQuery({
    queryKey: ['agencyModules', agencyId],
    queryFn: () => adminApi.getAgencyModules(agencyId!),
    enabled: !!agencyId,
  })

  const updateMutation = useMutation({
    mutationFn: (plan: 'basic' | 'premium' | 'enterprise') =>
      adminApi.updateAgencySubscription(agencyId!, { plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyModules', agencyId] })
      alert('Plan actualizado exitosamente')
      navigate('/admin')
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
        {modulesData?.subscription && (
          <p className="text-gray-700">
            Plan: <span className="font-semibold">{modulesData.subscription.plan}</span>
          </p>
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
          <Button
            onClick={() => updateMutation.mutate(selectedPlan)}
            disabled={updateMutation.isPending}
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

