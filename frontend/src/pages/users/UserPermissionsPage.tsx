import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { permissionsApi } from '../../api/permissions'
import { subscriptionsApi } from '../../api/subscriptions'
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

export default function UserPermissionsPage() {
  const { userId } = useParams()
  const queryClient = useQueryClient()

  const { data: permissions } = useQuery({
    queryKey: ['userPermissions', userId],
    queryFn: () => permissionsApi.getUserPermissions(userId!),
    enabled: !!userId,
  })

  const { data: enabledModules } = useQuery({
    queryKey: ['enabledModules'],
    queryFn: () => subscriptionsApi.getMyEnabledModules(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ module, data }: { module: ManagementModule; data: any }) =>
      permissionsApi.updatePermission(userId!, module, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions', userId] })
    },
  })

  if (!userId) return <div>Usuario no especificado</div>

  const enabledModuleList = enabledModules?.modules || []
  const permissionMap = new Map(permissions?.map(p => [p.module, p]) || [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Permisos de Usuario</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enabledModuleList.map((module) => {
          const permission = permissionMap.get(module)
          return (
            <div key={module} className="card">
              <h3 className="font-semibold mb-4">{MODULE_NAMES[module]}</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permission?.canView || false}
                    onChange={(e) => updateMutation.mutate({
                      module,
                      data: { canView: e.target.checked }
                    })}
                  />
                  <span>Ver</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permission?.canEdit || false}
                    onChange={(e) => updateMutation.mutate({
                      module,
                      data: { canEdit: e.target.checked }
                    })}
                  />
                  <span>Editar</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permission?.canDelete || false}
                    onChange={(e) => updateMutation.mutate({
                      module,
                      data: { canDelete: e.target.checked }
                    })}
                  />
                  <span>Eliminar</span>
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

