import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { invoicingApi } from '../../../api/invoicing'
import Button from '../../../components/common/Button'
import Pagination from '../../../components/common/Pagination'
import { formatNumber } from '../../../utils/format'

export default function InvoicingPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page],
    queryFn: () => invoicingApi.getInvoices({ page, limit: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: invoicingApi.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facturación AFIP</h1>
        <div className="flex gap-2">
          <Link to="/management/invoicing/settings">
            <Button variant="secondary">Configuración AFIP</Button>
          </Link>
          <Link to="/management/invoicing/new">
            <Button>Nueva Factura</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3">
                      {invoice.pointOfSale}-{invoice.invoiceNumber.toString().padStart(8, '0')}
                    </td>
                    <td className="px-4 py-3">{invoice.type}</td>
                    <td className="px-4 py-3">{invoice.clientName}</td>
                    <td className="px-4 py-3 text-right">
                      {formatNumber(invoice.total)} {invoice.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        invoice.status === 'sent' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/management/invoicing/${invoice.id}`}>
                          <Button size="sm">Ver</Button>
                        </Link>
                        {invoice.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (confirm('¿Eliminar esta factura?')) {
                                deleteMutation.mutate(invoice.id)
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

