import { useState, useEffect, useRef, ChangeEvent } from 'react'
import type { ChecklistGeneral } from '../utils/inspectionDataSchema'
import Input from '../../../../components/common/Input'

interface Props {
  data: ChecklistGeneral
  onChange: (data: ChecklistGeneral) => void
}

export default function ChecklistGeneralTab({ data, onChange }: Props) {
  const [localData, setLocalData] = useState<ChecklistGeneral>(data)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    if (!isUpdatingRef.current) {
      setLocalData(data)
    }
  }, [data])

  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false
      onChange(localData)
    }
  }, [localData, onChange])

  const updateItem = (index: number, field: keyof ChecklistGeneral['items'][0], value: any) => {
    isUpdatingRef.current = true
    const newItems = [...localData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setLocalData({ ...localData, items: newItems })
  }

  const updateField = (field: keyof ChecklistGeneral, value: any) => {
    isUpdatingRef.current = true
    setLocalData({ ...localData, [field]: value })
  }

  // Calculate total automatically
  useEffect(() => {
    const total =
      (localData.valorReacondicionado || 0) +
      (localData.valorReparacion || 0) +
      (localData.valorToma || 0)
    if (total !== localData.total) {
      setLocalData((prev) => ({ ...prev, total }))
    }
  }, [localData.valorReacondicionado, localData.valorReparacion, localData.valorToma])

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">CHECKLIST GENERAL</h2>
      </div>

      {/* Main Table */}
      <div className="border print:border-black overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-50">
              <th className="border border-gray-300 print:border-black p-2 text-left font-bold">ITEM</th>
              <th className="border border-gray-300 print:border-black p-2 text-center font-bold w-16">OK</th>
              <th className="border border-gray-300 print:border-black p-2 text-left font-bold">COMENTARIO</th>
              <th className="border border-gray-300 print:border-black p-2 text-left font-bold w-32">PRECIO</th>
            </tr>
          </thead>
          <tbody>
            {localData.items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 print:border-black p-2">{item.item}</td>
                <td className="border border-gray-300 print:border-black p-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.ok || false}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(index, 'ok', e.target.checked)}
                    className="checkbox mx-auto"
                  />
                </td>
                <td className="border border-gray-300 print:border-black p-2">
                  <textarea
                    value={item.comentario}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateItem(index, 'comentario', e.target.value)}
                    className="w-full border-0 resize-none focus:ring-0 p-0 min-h-[40px]"
                    rows={2}
                    placeholder="Comentario..."
                  />
                </td>
                <td className="border border-gray-300 print:border-black p-2">
                  <input
                    type="number"
                    value={item.precio || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(index, 'precio', parseFloat(e.target.value) || 0)}
                    className="w-full border-0 focus:ring-0 p-0 text-right"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">OBSERVACIONES</label>
          <textarea
            value={localData.observaciones}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('observaciones', e.target.value)}
            className="input w-full"
            rows={4}
            placeholder="Observaciones generales..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VALOR REACONDICIONADO</label>
            <Input
              type="number"
              value={localData.valorReacondicionado || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('valorReacondicionado', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VALOR REPARACIÓN</label>
            <Input
              type="number"
              value={localData.valorReparacion || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('valorReparacion', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VALOR DE TOMA</label>
            <Input
              type="number"
              value={localData.valorToma || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('valorToma', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TOTAL</label>
            <Input
              type="number"
              value={localData.total || ''}
              readOnly
              className="bg-gray-100 font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

