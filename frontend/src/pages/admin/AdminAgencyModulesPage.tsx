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
      alert('Módulo habilitado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error al habilitar módulo:', error)
      alert(`Error al habilitar módulo: ${error?.response?.data?.message || error.message || 'Error desconocido'}`)
    },
  })

  const disableMutation = useMutation({
    mutationFn: (module: ManagementModule) =>
      modulesApi.disableModule(agencyId!, module),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyModules', agencyId] })
      alert('Módulo deshabilitado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error al deshabilitar módulo:', error)
      alert(`Error al deshabilitar módulo: ${error?.response?.data?.message || error.message || 'Error desconocido'}`)
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
          const moduleData = modulesData?.modules.find(m => m.module === module)
          return (
            <div
              key={module}
              className={`card ${isEnabled ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{MODULE_NAMES[module]}</h3>
                    {isEnabled && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Habilitado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{module}</p>
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
                  isLoading={
                    (enableMutation.isPending && !isEnabled) ||
                    (disableMutation.isPending && isEnabled)
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

