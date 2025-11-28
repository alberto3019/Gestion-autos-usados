import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { favoritesApi } from '../../api/favorites'
import { TrashIcon } from '@heroicons/react/24/outline'
import StatusBadge from '../../components/common/StatusBadge'
import { formatNumber } from '../../utils/format'

export default function FavoritesPage() {
  const queryClient = useQueryClient()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getFavorites,
  })

  const removeMutation = useMutation({
    mutationFn: favoritesApi.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Mis Favoritos
      </h1>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="card relative">
              <button
                onClick={() => removeMutation.mutate(fav.id)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-red-50 text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <Link to={`/vehicles/${fav.vehicle.id}`} state={{ from: 'favorites' }}>
                <img
                  src={fav.vehicle.photos[0]?.url || '/placeholder.jpg'}
                  alt={`${fav.vehicle.brand} ${fav.vehicle.model}`}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-lg mb-1">
                  {fav.vehicle.brand} {fav.vehicle.model}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {fav.vehicle.version}
                </p>
                <p className="text-xl font-bold text-primary-600 mb-2">
                  ${formatNumber(fav.vehicle.price)} {fav.vehicle.currency}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{fav.vehicle.year}</span>
                  <span>{formatNumber(fav.vehicle.kilometers)} km</span>
                </div>
                <StatusBadge status={fav.vehicle.status} />
                <div className="mt-2 space-y-1">
                  {fav.vehicle.locationCity && fav.vehicle.locationState && (
                    <p className="text-xs text-gray-500">
                      📍 {fav.vehicle.locationCity}, {fav.vehicle.locationState}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 font-medium">
                    {fav.vehicle.agency?.commercialName}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            No tienes vehículos favoritos aún
          </p>
          <Link to="/search" className="text-primary-600 hover:text-primary-800">
            Explorar vehículos →
          </Link>
        </div>
      )}
    </div>
  )
}

