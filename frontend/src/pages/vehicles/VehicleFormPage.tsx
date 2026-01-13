import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import { agenciesApi } from '../../api/agencies'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import ImageUpload from '../../components/common/ImageUpload'

interface VehicleForm {
  brand: string
  model: string
  version: string
  year: number
  kilometers: number
  fuelType: string
  transmission: string
  color: string
  licensePlate: string
  price: number
  currency: string
  condition: string
  status: string
  locationCity: string
  locationState: string
  publicNotes: string
  photos: string[]
}

export default function VehicleFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  // Cargar datos de la agencia para pre-llenar ubicación
  const { data: agency } = useQuery({
    queryKey: ['myAgency'],
    queryFn: agenciesApi.getMyAgency,
    enabled: !id, // Solo cargar si es un vehículo nuevo
  })

  // Cargar datos del vehículo si estamos editando
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getVehicleById(id!),
    enabled: !!id,
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<VehicleForm>({
    defaultValues: {
      currency: 'ARS',
      condition: 'used',
      status: 'available',
      fuelType: 'gasoline',
      transmission: 'manual',
      locationCity: '',
      locationState: '',
    },
  })

  // Cargar datos del vehículo si estamos editando
  useEffect(() => {
    if (vehicle) {
      reset({
        brand: vehicle.brand,
        model: vehicle.model,
        version: vehicle.version || '',
        year: vehicle.year,
        kilometers: vehicle.kilometers,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        color: vehicle.color || '',
        licensePlate: vehicle.licensePlate || '',
        price: vehicle.price,
        currency: vehicle.currency,
        condition: vehicle.condition,
        status: vehicle.status,
        locationCity: vehicle.locationCity || '',
        locationState: vehicle.locationState || '',
        publicNotes: vehicle.publicNotes || '',
        photos: [],
      })
      
      // Cargar las URLs de las fotos
      if (vehicle.photos && vehicle.photos.length > 0) {
        setPhotoUrls(vehicle.photos.map(p => p.url))
      }
    }
  }, [vehicle, reset])

  // Pre-llenar ubicación con datos de la agencia para vehículos nuevos
  useEffect(() => {
    if (agency && !id && !vehicle) {
      setValue('locationCity', agency.addressCity || '')
      setValue('locationState', agency.addressState || '')
    }
  }, [agency, id, vehicle, setValue])

  const createMutation = useMutation({
    mutationFn: vehiclesApi.createVehicle,
    onSuccess: () => {
      console.log('✅ Vehículo creado exitosamente');
      navigate('/vehicles');
    },
    onError: (error: any) => {
      console.error('❌ Error al crear:', error);
      alert(`Error al crear el vehículo: ${error.response?.data?.message || error.message}`);
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => vehiclesApi.updateVehicle(id!, data),
    onSuccess: () => {
      console.log('✅ Vehículo actualizado exitosamente');
      navigate('/vehicles');
    },
    onError: (error: any) => {
      console.error('❌ Error al actualizar:', error);
      alert(`Error al actualizar el vehículo: ${error.response?.data?.message || error.message}`);
    },
  })

  const onSubmit = async (data: VehicleForm) => {
    console.log('📝 Datos del formulario:', data);
    console.log('📸 URLs de fotos:', photoUrls);
    
    try {
      if (id) {
        // Editar vehículo existente
        const validPhotos = photoUrls.filter((url) => url.trim() !== '');
        const updateData = { ...data, photos: validPhotos };
        console.log('🔄 Actualizando con:', updateData);
        await updateMutation.mutateAsync(updateData);
      } else {
        // Crear nuevo vehículo
        const validPhotos = photoUrls.filter((url) => url.trim() !== '');
        await createMutation.mutateAsync({ ...data, photos: validPhotos });
      }
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
    }
  }

  if (id && isLoading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {id ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Marca *"
            {...register('brand', { required: 'La marca es requerida' })}
            error={errors.brand?.message}
          />
          <Input
            label="Modelo *"
            {...register('model', { required: 'El modelo es requerido' })}
            error={errors.model?.message}
          />
          <Input
            label="Versión"
            {...register('version')}
          />
          <Input
            label="Año *"
            type="number"
            {...register('year', { required: 'El año es requerido' })}
            error={errors.year?.message}
          />
          <Input
            label="Kilometraje *"
            type="number"
            {...register('kilometers', { required: 'El kilometraje es requerido' })}
            error={errors.kilometers?.message}
          />
          <Input
            label="Color"
            {...register('color')}
          />
          <Input
            label="Patente"
            {...register('licensePlate')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Combustible *
            </label>
            <select className="input" {...register('fuelType')}>
              <option value="gasoline">Nafta</option>
              <option value="diesel">Diésel</option>
              <option value="hybrid">Híbrido</option>
              <option value="electric">Eléctrico</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmisión *
            </label>
            <select className="input" {...register('transmission')}>
              <option value="manual">Manual</option>
              <option value="automatic">Automática</option>
              <option value="cvt">CVT</option>
              <option value="other">Otra</option>
            </select>
          </div>

          <Input
            label="Precio *"
            type="number"
            {...register('price', { required: 'El precio es requerido' })}
            error={errors.price?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda
            </label>
            <select className="input" {...register('currency')}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <Input
            label="Ciudad"
            {...register('locationCity')}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia
            </label>
            <select className="input" {...register('locationState')}>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios Públicos
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Ej: Acepta permuta, financiación disponible..."
            {...register('publicNotes')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos del Vehículo
          </label>
          <ImageUpload
            images={photoUrls}
            onChange={setPhotoUrls}
            maxImages={10}
            disabled={id ? updateMutation.isPending : createMutation.isPending}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/vehicles')}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={id ? updateMutation.isPending : createMutation.isPending}
            className="w-full sm:w-auto"
          >
            {id ? 'Actualizar' : 'Crear'} Vehículo
          </Button>
        </div>
      </form>
    </div>
  )
}

