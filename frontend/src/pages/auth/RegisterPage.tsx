import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../api/auth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

interface RegisterForm {
  // Agency
  businessName: string
  commercialName: string
  taxId: string
  addressStreet: string
  addressCity: string
  addressState: string
  phone: string
  whatsapp: string
  agencyEmail: string
  instagramUrl: string
  websiteUrl: string
  // User
  firstName: string
  lastName: string
  userEmail: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)
    try {
      await authApi.register({
        agency: {
          businessName: data.businessName,
          commercialName: data.commercialName,
          taxId: data.taxId,
          addressStreet: data.addressStreet,
          addressCity: data.addressCity,
          addressState: data.addressState,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.agencyEmail,
          instagramUrl: data.instagramUrl,
          websiteUrl: data.websiteUrl,
        },
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.userEmail,
          password: data.password,
        },
      })
      setSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al registrar la agencia. Verifica los datos.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full card">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              ¡Registro Exitoso!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Tu agencia ha sido registrada y está pendiente de aprobación. Te
              notificaremos cuando puedas acceder a la plataforma.
            </p>
            <div className="mt-6">
              <Link to="/login">
                <Button variant="primary">Ir al Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Registrar Nueva Agencia
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Completa el formulario para unirte a la red
          </p>
        </div>

        <form className="card space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Datos de la Agencia */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Datos de la Agencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Razón Social *"
                {...register('businessName', {
                  required: 'La razón social es requerida',
                })}
                error={errors.businessName?.message}
              />
              <Input
                label="Nombre Comercial *"
                {...register('commercialName', {
                  required: 'El nombre comercial es requerido',
                })}
                error={errors.commercialName?.message}
              />
              <Input
                label="CUIT *"
                placeholder="XX-XXXXXXXX-X"
                {...register('taxId', {
                  required: 'El CUIT es requerido',
                  pattern: {
                    value: /^\d{2}-\d{8}-\d{1}$/,
                    message: 'Formato: XX-XXXXXXXX-X',
                  },
                })}
                error={errors.taxId?.message}
              />
              <Input
                label="Email de la Agencia *"
                type="email"
                {...register('agencyEmail', {
                  required: 'El email es requerido',
                })}
                error={errors.agencyEmail?.message}
              />
              <Input
                label="WhatsApp *"
                placeholder="+5491123456789"
                {...register('whatsapp', {
                  required: 'El WhatsApp es requerido',
                  pattern: {
                    value: /^\+\d{10,15}$/,
                    message: 'Formato: +5491123456789',
                  },
                })}
                error={errors.whatsapp?.message}
              />
              <Input
                label="Teléfono"
                {...register('phone')}
              />
              <Input
                label="Calle"
                {...register('addressStreet')}
              />
              <Input
                label="Ciudad"
                {...register('addressCity')}
              />
              <Input
                label="Provincia"
                {...register('addressState')}
              />
              <Input
                label="Instagram"
                placeholder="https://instagram.com/..."
                {...register('instagramUrl')}
              />
              <Input
                label="Sitio Web"
                placeholder="https://..."
                {...register('websiteUrl')}
              />
            </div>
          </div>

          {/* Datos del Administrador */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Datos del Administrador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                {...register('firstName', {
                  required: 'El nombre es requerido',
                })}
                error={errors.firstName?.message}
              />
              <Input
                label="Apellido *"
                {...register('lastName', {
                  required: 'El apellido es requerido',
                })}
                error={errors.lastName?.message}
              />
              <Input
                label="Email *"
                type="email"
                {...register('userEmail', {
                  required: 'El email es requerido',
                })}
                error={errors.userEmail?.message}
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
              <Input
                label="Confirmar Contraseña *"
                type="password"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (value) =>
                    value === password || 'Las contraseñas no coinciden',
                })}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Registrar Agencia
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

