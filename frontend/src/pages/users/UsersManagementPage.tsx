import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { usersApi, CreateUserData } from '../../api/users'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, KeyIcon } from '@heroicons/react/24/outline'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export default function UsersManagementPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['agencyUsers'],
    queryFn: usersApi.getAgencyUsers,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserData>()

  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] })
      setShowModal(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] })
      setEditingUser(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] })
    },
  })

  const onSubmit = async (data: CreateUserData) => {
    await createMutation.mutateAsync(data)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const toggleUserStatus = async (user: any) => {
    await updateMutation.mutateAsync({
      id: user.id,
      data: { isActive: !user.isActive },
    })
  }

  const changeUserRole = async (user: any, newRole: string) => {
    await updateMutation.mutateAsync({
      id: user.id,
      data: { role: newRole },
    })
  }

  const roleLabels = {
    agency_admin: 'Administrador',
    agency_user: 'Usuario',
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra los usuarios de tu agencia
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <PlusIcon className="h-5 w-5 mr-2 inline" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Información de Roles */}
      <div className="card mb-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Roles disponibles:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Administrador:</strong> Puede gestionar vehículos, usuarios y configuración de la agencia.</li>
          <li><strong>Usuario:</strong> Puede gestionar vehículos (crear, editar, cambiar estado).</li>
        </ul>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : users && users.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeUserRole(user, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="agency_admin">Administrador</option>
                      <option value="agency_user">Usuario</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'agency_user' && (
                        <Link to={`/users/${user.id}/permissions`}>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Gestionar permisos"
                          >
                            <KeyIcon className="h-5 w-5" />
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No hay usuarios registrados</p>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nuevo Usuario</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  reset()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nombre *"
                {...register('firstName', { required: 'El nombre es requerido' })}
                error={errors.firstName?.message}
              />

              <Input
                label="Apellido *"
                {...register('lastName', { required: 'El apellido es requerido' })}
                error={errors.lastName?.message}
              />

              <Input
                label="Email *"
                type="email"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                error={errors.email?.message}
              />

              <Input
                label="Contraseña *"
                type="password"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })}
                error={errors.password?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  className="input"
                  {...register('role', { required: 'El rol es requerido' })}
                >
                  <option value="agency_user">Usuario</option>
                  <option value="agency_admin">Administrador</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false)
                    reset()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending}
                >
                  Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

