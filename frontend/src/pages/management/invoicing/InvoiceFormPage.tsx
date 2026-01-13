import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { invoicingApi } from '../../../api/invoicing'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function InvoiceFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    type: 'A' as 'A' | 'B' | 'C',
    clientName: '',
    clientTaxId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => invoicingApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      navigate('/management/invoicing')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as any)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Factura</h1>

      <form onSubmit={handleSubmit} className="card max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Factura *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input"
                required
              >
                <option value="A">A - Responsable Inscripto</option>
                <option value="B">B - Consumidor Final</option>
                <option value="C">C - Exento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CUIT/DNI *
              </label>
              <Input
                value={formData.clientTaxId}
                onChange={(e) => setFormData({ ...formData, clientTaxId: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items *
              </label>
              <Button type="button" size="sm" onClick={addItem}>
                Agregar Item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Descripción"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Precio"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              Crear Factura
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/management/invoicing')}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

