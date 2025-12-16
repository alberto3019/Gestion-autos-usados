import { NavLink } from 'react-router-dom'
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
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    onClose()
  }

  // Navegación base para todos
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  ]

  let navigation = [...baseNavigation]

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
                onClick={onClose}
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
