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

  // Super admin has access to everything
  if (user?.role === 'super_admin') {
    return <>{children}</>
  }

  // Agency admin has access if module is enabled for their agency
  // Agency users need specific permissions (checked at API level)
  // For now, we check if module is in enabled modules
  if (hasModule(module)) {
    return <>{children}</>
  }

  return <>{fallback || null}</>
}

