import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicingApi } from '../../../api/invoicing'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function AfipSettingsPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    afipCuit: '',
    afipPointOfSale: 1,
    afipCertificate: '',
    afipPrivateKey: '',
  })

  const { data: settings } = useQuery({
    queryKey: ['afipSettings'],
    queryFn: invoicingApi.getAfipSettings,
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        afipCuit: settings.afipCuit || '',
        afipPointOfSale: settings.afipPointOfSale || 1,
        afipCertificate: '',
        afipPrivateKey: '',
      })
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: invoicingApi.updateAfipSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['afipSettings'] })
      alert('Configuración guardada exitosamente')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Configuración AFIP
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CUIT *
            </label>
            <Input
              value={formData.afipCuit}
              onChange={(e) => setFormData({ ...formData, afipCuit: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Punto de Venta *
            </label>
            <Input
              type="number"
              value={formData.afipPointOfSale}
              onChange={(e) => setFormData({ ...formData, afipPointOfSale: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificado (Base64)
            </label>
            <textarea
              value={formData.afipCertificate}
              onChange={(e) => setFormData({ ...formData, afipCertificate: e.target.value })}
              className="input font-mono text-xs"
              rows={6}
              placeholder="Pega el certificado en formato Base64"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clave Privada (Base64)
            </label>
            <textarea
              value={formData.afipPrivateKey}
              onChange={(e) => setFormData({ ...formData, afipPrivateKey: e.target.value })}
              className="input font-mono text-xs"
              rows={6}
              placeholder="Pega la clave privada en formato Base64"
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  )
}

