import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { clientsApi } from '../../../api/clients'
import Button from '../../../components/common/Button'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getClient(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="text-center py-8">Cargando...</div>
  if (!client) return <div>Cliente no encontrado</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {client.firstName} {client.lastName}
        </h1>
        <div className="flex gap-2">
          <Link to={`/management/clients/${id}/edit`}>
            <Button>Editar</Button>
          </Link>
          <Button variant="secondary" onClick={() => navigate('/management/clients')}>
            Volver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Información de Contacto</h2>
          <div className="space-y-2">
            {client.email && <p><span className="font-medium">Email:</span> {client.email}</p>}
            {client.phone && <p><span className="font-medium">Teléfono:</span> {client.phone}</p>}
            {client.address && <p><span className="font-medium">Dirección:</span> {client.address}</p>}
          </div>
        </div>

        {client.currentVehicle && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Vehículo Actual</h2>
            <Link to={`/vehicles/${client.currentVehicle.id}`}>
              <p className="text-blue-600 hover:underline">
                {client.currentVehicle.brand} {client.currentVehicle.model}
              </p>
            </Link>
          </div>
        )}

        {client.desiredVehicle && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Vehículo Deseado</h2>
            <Link to={`/vehicles/${client.desiredVehicle.id}`}>
              <p className="text-blue-600 hover:underline">
                {client.desiredVehicle.brand} {client.desiredVehicle.model}
              </p>
            </Link>
          </div>
        )}

        {client.alertEnabled && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Alertas</h2>
            <p className="text-yellow-600">
              Alerta activa cada {client.alertDays} días
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

