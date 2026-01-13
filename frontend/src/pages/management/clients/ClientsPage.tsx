import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { clientsApi } from '../../../api/clients'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Pagination from '../../../components/common/Pagination'

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => clientsApi.getClients({ page, limit: 20, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: clientsApi.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link to="/management/clients/new">
          <Button>Nuevo Cliente</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data?.data.map((client) => (
              <div key={client.id} className="card">
                <h3 className="font-semibold text-lg mb-2">
                  {client.firstName} {client.lastName}
                </h3>
                {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                {client.alertEnabled && (
                  <p className="text-sm text-yellow-600 mt-2">⚠️ Alerta activa</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Link to={`/management/clients/${client.id}`}>
                    <Button size="sm">Ver Detalle</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm('¿Eliminar este cliente?')) {
                        deleteMutation.mutate(client.id)
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {data && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(data.total / data.limit)}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}

