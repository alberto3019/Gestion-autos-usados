import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockApi } from '../../../api/stock'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

export default function StockSettingsPage() {
  const queryClient = useQueryClient()
  const [yellowDays, setYellowDays] = useState<number>(60)
  const [redDays, setRedDays] = useState<number>(90)

  const { data: settings } = useQuery({
    queryKey: ['stockSettings'],
    queryFn: stockApi.getStockSettings,
  })

  useEffect(() => {
    if (settings) {
      setYellowDays(settings.stockYellowDays)
      setRedDays(settings.stockRedDays)
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: (data: { stockYellowDays: number; stockRedDays: number }) =>
      stockApi.updateStockSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockSettings'] })
      queryClient.invalidateQueries({ queryKey: ['stockStats'] })
      alert('Configuración guardada exitosamente')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      stockYellowDays: yellowDays,
      stockRedDays: redDays,
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Configuración de Semáforo de Stock
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días para Amarillo
          </label>
          <Input
            type="number"
            value={yellowDays}
            onChange={(e) => setYellowDays(parseInt(e.target.value))}
            min={1}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Vehículos con más de {yellowDays} días mostrarán semáforo amarillo
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días para Rojo
          </label>
          <Input
            type="number"
            value={redDays}
            onChange={(e) => setRedDays(parseInt(e.target.value))}
            min={1}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Vehículos con más de {redDays} días mostrarán semáforo rojo
          </p>
        </div>

        <Button type="submit" disabled={updateMutation.isPending}>
          Guardar Configuración
        </Button>
      </form>
    </div>
  )
}

