import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { agenciesApi } from '../../api/agencies'
import { uploadApi } from '../../api/upload'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuthStore } from '../../store/authStore'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ProfileForm {
  commercialName: string
  whatsapp: string
  phone: string
  addressStreet: string
  addressCity: string
  addressState: string
  instagramUrl: string
  facebookUrl: string
  websiteUrl: string
  logoUrl?: string
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const { data: agency } = useQuery({
    queryKey: ['myAgency'],
    queryFn: agenciesApi.getMyAgency,
    enabled: user?.role !== 'super_admin',
    onSuccess: (data) => {
      if (data.logoUrl) {
        setLogoUrl(data.logoUrl)
      }
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileForm>({
    values: agency ? {
      commercialName: agency.commercialName,
      whatsapp: agency.whatsapp,
      phone: agency.phone || '',
      addressStreet: agency.addressStreet || '',
      addressCity: agency.addressCity || '',
      addressState: agency.addressState || '',
      instagramUrl: agency.instagramUrl || '',
      facebookUrl: agency.facebookUrl || '',
      websiteUrl: agency.websiteUrl || '',
      logoUrl: agency.logoUrl || '',
    } : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: agenciesApi.updateMyAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAgency'] })
      alert('Perfil actualizado exitosamente')
    },
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const result = await uploadApi.uploadImage(file)
      setLogoUrl(result.url)
      setValue('logoUrl', result.url)
    } catch (error: any) {
      console.error('Error al subir logo:', error)
      alert(`Error al subir logo: ${error.response?.data?.message || error.message}`)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoUrl(undefined)
    setValue('logoUrl', '')
  }

  const onSubmit = async (data: ProfileForm) => {
    await updateMutation.mutateAsync({
      ...data,
      logoUrl: logoUrl || undefined,
    })
  }

  if (user?.role === 'super_admin') {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
        <p className="text-gray-600">
          Usuario: {user.firstName} {user.lastName}
        </p>
        <p className="text-gray-600">Email: {user.email}</p>
        <p className="text-gray-600">Rol: Super Administrador</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Mi Perfil
      </h1>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Usuario</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nombre</p>
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Rol</p>
            <p className="font-medium capitalize">{user?.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        <h2 className="text-lg font-semibold">Datos de la Agencia</h2>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Logo de la Agencia
          </label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Logo de la agencia"
                  className="h-24 w-24 object-contain border-2 border-gray-200 rounded-lg p-2 bg-white"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <PhotoIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className={`inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingLogo ? 'Subiendo...' : logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                El logo se mostrará como fondo en el dashboard con opacidad
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre Comercial"
            {...register('commercialName', {
              required: 'El nombre comercial es requerido',
            })}
            error={errors.commercialName?.message}
          />

          <Input
            label="WhatsApp"
            {...register('whatsapp', {
              required: 'El WhatsApp es requerido',
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia
            </label>
            <select className="input" {...register('addressState')}>
              <option value="">Seleccionar provincia</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
              <option value="Catamarca">Catamarca</option>
              <option value="Chaco">Chaco</option>
              <option value="Chubut">Chubut</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Formosa">Formosa</option>
              <option value="Jujuy">Jujuy</option>
              <option value="La Pampa">La Pampa</option>
              <option value="La Rioja">La Rioja</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Misiones">Misiones</option>
              <option value="Neuquén">Neuquén</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Salta">Salta</option>
              <option value="San Juan">San Juan</option>
              <option value="San Luis">San Luis</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Santiago del Estero">Santiago del Estero</option>
              <option value="Tierra del Fuego">Tierra del Fuego</option>
              <option value="Tucumán">Tucumán</option>
            </select>
          </div>

          <Input
            label="Instagram"
            placeholder="https://instagram.com/..."
            {...register('instagramUrl')}
          />

          <Input
            label="Facebook"
            placeholder="https://facebook.com/..."
            {...register('facebookUrl')}
          />

          <Input
            label="Sitio Web"
            placeholder="https://..."
            {...register('websiteUrl')}
            className="md:col-span-2"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}

