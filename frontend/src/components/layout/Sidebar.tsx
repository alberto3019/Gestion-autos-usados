import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  HeartIcon,
  UserCircleIcon,
  UsersIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useModuleStore } from '../../store/moduleStore'
import { useQuery } from '@tanstack/react-query'
import { subscriptionsApi } from '../../api/subscriptions'
import { ManagementModule } from '../../types'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { setEnabledModules, hasModule } = useModuleStore()
  const location = useLocation()
  const [isManagementOpen, setIsManagementOpen] = useState(false)

  // Cargar módulos habilitados
  useQuery({
    queryKey: ['enabledModules'],
    queryFn: async () => {
      const data = await subscriptionsApi.getMyEnabledModules()
      setEnabledModules(data.modules)
      return data
    },
    enabled: !!user && user.role !== 'super_admin',
  })

  // Cerrar el desplegable cuando se está en Dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setIsManagementOpen(false)
    }
  }, [location.pathname])

  // Abrir el desplegable si estamos en una ruta de gestión
  useEffect(() => {
    if (location.pathname.startsWith('/management/')) {
      setIsManagementOpen(true)
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    onClose()
  }

  // Navegación base para todos
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  ]

  let navigation = [...baseNavigation]

  // Módulos de gestión (compartidos)
  const managementModules = [
    { name: 'Stock', href: '/management/stock', module: 'stock' as ManagementModule, icon: TruckIcon },
    { name: 'Peritajes', href: '/management/inspections', module: 'vehicle_inspection' as ManagementModule, icon: ClipboardDocumentCheckIcon },
    { name: 'Clientes', href: '/management/clients', module: 'clients' as ManagementModule, icon: UsersIcon },
    { name: 'Cashflow', href: '/management/cashflow', module: 'cashflow' as ManagementModule, icon: CurrencyDollarIcon },
    { name: 'Estadísticas', href: '/management/sales-stats', module: 'statistics' as ManagementModule, icon: ChartBarIcon },
    { name: 'Financiamiento', href: '/management/financing', module: 'financing_tracking' as ManagementModule, icon: CreditCardIcon },
    { name: 'Balances', href: '/management/balances', module: 'balances' as ManagementModule, icon: CalculatorIcon },
    { name: 'Facturación', href: '/management/invoicing', module: 'invoicing_afip' as ManagementModule, icon: DocumentTextIcon },
    { name: 'Métricas', href: '/management/metrics', module: 'metrics' as ManagementModule, icon: ChartBarIcon },
  ]

  // Filtrar módulos habilitados (super_admin ve todos)
  const enabledManagementModules = managementModules.filter(item => 
    user?.role === 'super_admin' || hasModule(item.module)
  )

  // Navegación específica para super_admin
  if (user?.role === 'super_admin') {
    navigation = [
      ...baseNavigation,
      { name: 'Buscar Vehículos', href: '/search', icon: MagnifyingGlassIcon },
      { name: 'Favoritos', href: '/favorites', icon: HeartIcon },
      { name: 'Mi Perfil', href: '/profile', icon: UserCircleIcon },
      { name: 'Actividades', href: '/admin/activities', icon: ClockIcon },
    ]
  } else {
    // Navegación para agencias
    navigation = [
      ...baseNavigation,
      { name: 'Mis Vehículos', href: '/vehicles', icon: TruckIcon },
      { name: 'Buscar Vehículos', href: '/search', icon: MagnifyingGlassIcon },
      { name: 'Favoritos', href: '/favorites', icon: HeartIcon },
      { name: 'Mi Perfil', href: '/profile', icon: UserCircleIcon },
    ]

    // Gestión de usuarios solo para agency_admin
    if (user?.role === 'agency_admin') {
      navigation.push({
        name: 'Usuarios',
        href: '/users',
        icon: UsersIcon,
      })
    }
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary-600">
            AutoStock360
          </h1>
          {/* Botón cerrar solo en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            // Para "Mis Vehículos", usar `end` para que solo se active en la ruta exacta
            // Esto evita que se active cuando estás en /vehicles/:id
            const isVehiclesRoute = item.href === '/vehicles'
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={isVehiclesRoute}
                onClick={() => {
                  onClose()
                  // Cerrar el desplegable de Gestión cuando se hace clic en Dashboard
                  if (item.href === '/dashboard') {
                    setIsManagementOpen(false)
                  }
                }}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    {
                      'bg-primary-100 text-primary-900': isActive,
                      'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                    }
                  )
                }
              >
                <item.icon
                  className="mr-3 h-6 w-6 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            )
          })}

          {/* Menú desplegable de Gestión */}
          {enabledManagementModules.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setIsManagementOpen(!isManagementOpen)}
                className={clsx(
                  'w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  {
                    'bg-primary-100 text-primary-900': isManagementOpen || location.pathname.startsWith('/management/'),
                    'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isManagementOpen && !location.pathname.startsWith('/management/'),
                  }
                )}
              >
                <div className="flex items-center">
                  <HomeIcon
                    className="mr-3 h-6 w-6 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Gestión
                </div>
                {isManagementOpen ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>

              {/* Submenú de Gestión */}
              {isManagementOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {enabledManagementModules.map((item) => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={clsx(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          {
                            'bg-primary-100 text-primary-900': isActive,
                            'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                          }
                        )}
                      >
                        <item.icon
                          className="mr-3 h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Cerrar Sesión - Al final */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon
              className="mr-3 h-6 w-6 flex-shrink-0"
              aria-hidden="true"
            />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  )
}
