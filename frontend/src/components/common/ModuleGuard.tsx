import { ReactNode } from 'react'
import { useModuleStore } from '../../store/moduleStore'
import { useAuthStore } from '../../store/authStore'
import { ManagementModule } from '../../types'

interface Props {
  module: ManagementModule
  children: ReactNode
  fallback?: ReactNode
}

export default function ModuleGuard({ module, children, fallback }: Props) {
  const { user } = useAuthStore()
  const { hasModule } = useModuleStore()

  // Super admin NO tiene acceso a gestión
  if (user?.role === 'super_admin') {
    return <>{fallback || <div className="p-4 text-center text-gray-500">El panel de gestión no está disponible para super administradores.</div>}</>
  }

  // Agency admin has access if module is enabled for their agency
  // Agency users need specific permissions (checked at API level)
  // For now, we check if module is in enabled modules
  if (hasModule(module)) {
    return <>{children}</>
  }

  return <>{fallback || <div className="p-4 text-center text-gray-500">Este módulo no está disponible en tu plan actual.</div>}</>
}

