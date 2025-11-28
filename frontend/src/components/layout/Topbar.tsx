import { Menu } from '@headlessui/react'
import { UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import NotificationsDropdown from '../common/NotificationsDropdown'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Continuar con el logout local incluso si hay error en el servidor
    }
    // Siempre ejecutar logout local y navegar
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Botón hamburguesa solo en móvil */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            {user?.agency?.logoUrl && (
              <img
                src={user.agency.logoUrl}
                alt={`Logo ${user.agency.commercialName}`}
                className="h-8 w-8 object-contain flex-shrink-0 bg-white rounded p-0.5"
              />
            )}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                {user?.agency?.commercialName || 'Panel de Administración'}
              </h2>
              {user?.agency && (
                <p className="text-xs md:text-sm text-gray-500">
                  {user.agency.addressCity}{user.agency.addressState ? `, ${user.agency.addressState}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              <UserCircleIcon className="h-8 w-8" />
              <span className="hidden md:inline">
                {user?.firstName} {user?.lastName}
              </span>
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      Mi Perfil
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleLogout()
                      }}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  )
}
