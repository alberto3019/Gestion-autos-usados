import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import { favoritesApi } from '../../api/favorites'
import { whatsappApi } from '../../api/whatsapp'
import { HeartIcon as HeartOutline, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber } from '../../utils/format'

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Determinar de dónde viene el usuario
  const fromSearch = location.state?.from === 'search'
  const fromFavorites = location.state?.from === 'favorites'
  const searchFilters = location.state?.filters
  const searchQuickSearch = location.state?.quickSearch

  // Manejar tecla ESC para cerrar lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getVehicleById(id!),
  })

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (vehicle?.isFavorite) {
        await favoritesApi.removeFavorite(id!)
      } else {
        await favoritesApi.addFavorite(id!)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
    },
  })

  const handleWhatsAppClick = async () => {
    if (!vehicle) return
    await whatsappApi.logClick(vehicle.id)
    const message = `Hola, estoy interesado en ${vehicle.brand} ${vehicle.model} ${vehicle.year}`
    const url = `https://wa.me/${vehicle.agency?.whatsapp}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (isLoading) return <div className="text-center py-12">Cargando...</div>

  if (!vehicle) return <div className="card">Vehículo no encontrado</div>

  const handleGoBack = () => {
    if (fromSearch) {
      // Preservar los filtros de búsqueda al volver
      navigate('/search', {
        state: {
          filters: searchFilters,
          quickSearch: searchQuickSearch
        }
      })
    } else if (fromFavorites) {
      navigate('/favorites')
    } else if (vehicle.isOwn) {
      navigate('/vehicles')
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={handleGoBack}
        className="mb-4 text-primary-600 hover:text-primary-800 flex items-center gap-1"
      >
        ← Volver {fromSearch && '(a búsqueda)'}{fromFavorites && '(a favoritos)'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos Gallery */}
          <div className="card relative">
            {/* Main Photo */}
            <div className="relative">
              <img
                src={vehicle.photos[currentPhotoIndex]?.url || '/placeholder.jpg'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-96 object-cover rounded-lg"
              />
              
              {/* Expand Button - Floating */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                title="Ver imagen completa"
              >
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700" />
              </button>

              {/* Favorite Button - Floating */}
              {!vehicle.isOwn && (
                <button
                  onClick={() => favoriteMutation.mutate()}
                  className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                  title={vehicle.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {vehicle.isFavorite ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartOutline className="h-6 w-6 text-gray-600 hover:text-red-500" />
                  )}
                </button>
              )}

              {/* Navigation Arrows */}
              {vehicle.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => 
                      prev === 0 ? vehicle.photos.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => 
                      prev === vehicle.photos.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              {vehicle.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {vehicle.photos.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {vehicle.photos.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {vehicle.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentPhotoIndex
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="card">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {vehicle.brand} {vehicle.model}
            </h1>
            
            {vehicle.version && (
              <p className="text-sm text-gray-600 mb-4">
                {vehicle.version}
              </p>
            )}

            <p className="text-xl sm:text-2xl font-bold text-primary-600 mb-4">
              ${formatNumber(vehicle.price)} {vehicle.currency}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Año</p>
                <p className="font-semibold">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kilometraje</p>
                <p className="font-semibold">{formatNumber(vehicle.kilometers)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Combustible</p>
                <p className="font-semibold capitalize">{vehicle.fuelType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transmisión</p>
                <p className="font-semibold capitalize">{vehicle.transmission}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-semibold">{vehicle.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <StatusBadge status={vehicle.status} />
              </div>
            </div>

            {vehicle.publicNotes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">{vehicle.publicNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Agency Info */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Ubicación del Vehículo</h3>
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              <p className="text-gray-600 text-sm">
                📍 {vehicle.locationCity || 'No especificada'}, {vehicle.locationState || 'No especificada'}
              </p>
            </div>

            <h3 className="text-base sm:text-lg font-semibold mb-4">Agencia</h3>
            <div className="space-y-3 mb-6">
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {vehicle.agency?.commercialName}
              </p>
              <p className="text-sm text-gray-600">
                {vehicle.agency?.addressCity}, {vehicle.agency?.addressState}
              </p>
              {vehicle.agency?.email && (
                <p className="text-sm text-gray-600">{vehicle.agency.email}</p>
              )}
            </div>

            {!vehicle.isOwn && (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleWhatsAppClick}
              >
                <svg
                  className="w-5 h-5 mr-2 inline"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contactar por WhatsApp
              </Button>
            )}

            {vehicle.agency?.instagramUrl && (
              <a
                href={vehicle.agency.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-sm text-primary-600 hover:text-primary-800"
              >
                Ver en Instagram →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
            title="Cerrar (ESC)"
          >
            <XMarkIcon className="h-8 w-8 text-white" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
            {currentPhotoIndex + 1} / {vehicle.photos.length}
          </div>

          {/* Main Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={vehicle.photos[currentPhotoIndex]?.url || '/placeholder.jpg'}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Arrows */}
            {vehicle.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPhotoIndex((prev) => 
                      prev === 0 ? vehicle.photos.length - 1 : prev - 1
                    )
                  }}
                  className="absolute left-4 bg-white/10 hover:bg-white/20 rounded-full p-4 transition-all"
                >
                  <ChevronLeftIcon className="h-8 w-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPhotoIndex((prev) => 
                      prev === vehicle.photos.length - 1 ? 0 : prev + 1
                    )
                  }}
                  className="absolute right-4 bg-white/10 hover:bg-white/20 rounded-full p-4 transition-all"
                >
                  <ChevronRightIcon className="h-8 w-8 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {vehicle.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-4xl px-4">
              {vehicle.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPhotoIndex(index)
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentPhotoIndex
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

