import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { modulesApi } from '../../api/modules'
import Button from '../../components/common/Button'
import { ManagementModule } from '../../types'

const MODULE_NAMES: Record<ManagementModule, string> = {
  stock: 'Stock',
  vehicle_inspection: 'Peritaje',
  clients: 'Clientes',
  cashflow: 'Cashflow',
  statistics: 'Estadísticas',
  financing_tracking: 'Financiamiento',
  balances: 'Balances',
  invoicing_afip: 'Facturación AFIP',
  metrics: 'Métricas',
  sales_platforms: 'Plataformas de Venta',
}

export default function AdminAgencyModulesPage() {
  const { agencyId } = useParams()
  const queryClient = useQueryClient()

  const { data: modulesData } = useQuery({
    queryKey: ['agencyModules', agencyId],
    queryFn: () => modulesApi.getAgencyModules(agencyId!),
    enabled: !!agencyId,
  })

  const enableMutation = useMutation({
    mutationFn: (module: ManagementModule) =>
      modulesApi.enableModule(agencyId!, module),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyModules', agencyId] })
    },
  })

  const disableMutation = useMutation({
    mutationFn: (module: ManagementModule) =>
      modulesApi.disableModule(agencyId!, module),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyModules', agencyId] })
    },
  })

  if (!agencyId) {
    return <div>No se especificó agencia</div>
  }

  const allModules = Object.keys(MODULE_NAMES) as ManagementModule[]
  const enabledModules = modulesData?.modules
    .filter((m) => m.isEnabled)
    .map((m) => m.module) || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestión de Módulos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allModules.map((module) => {
          const isEnabled = enabledModules.includes(module)
          return (
            <div
              key={module}
              className={`card ${isEnabled ? 'border-green-500' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{MODULE_NAMES[module]}</h3>
                  <p className="text-sm text-gray-500">{module}</p>
                </div>
                <Button
                  onClick={() =>
                    isEnabled
                      ? disableMutation.mutate(module)
                      : enableMutation.mutate(module)
                  }
                  variant={isEnabled ? 'danger' : 'primary'}
                  disabled={
                    enableMutation.isPending || disableMutation.isPending
                  }
                >
                  {isEnabled ? 'Deshabilitar' : 'Habilitar'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

