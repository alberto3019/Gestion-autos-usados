import { useState, useEffect, useRef, ChangeEvent } from 'react'
import type { SistemaFrenos } from '../utils/inspectionDataSchema'

interface Props {
  data: SistemaFrenos
  onChange: (data: SistemaFrenos) => void
}

export default function SistemaFrenosTab({ data, onChange }: Props) {
  const [localData, setLocalData] = useState<SistemaFrenos>(data)
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

  const updateComponent = (index: number, field: keyof SistemaFrenos['componentes'][0], value: any) => {
    isUpdatingRef.current = true
    const newComponents = [...localData.componentes]
    newComponents[index] = { ...newComponents[index], [field]: value }
    setLocalData({ ...localData, componentes: newComponents })
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">SISTEMA DE FRENOS</h2>
      </div>

      {/* Brake Components Table */}
      <div className="border print:border-black overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-50">
              <th className="border border-gray-300 print:border-black p-2 text-left font-bold">COMPONENTE</th>
              <th className="border border-gray-300 print:border-black p-2 text-center font-bold w-16">OK</th>
              <th className="border border-gray-300 print:border-black p-2 text-left font-bold">COMENTARIO</th>
              <th className="border border-gray-300 print:border-black p-2 text-left font-bold w-32">PRECIO</th>
            </tr>
          </thead>
          <tbody>
            {localData.componentes.map((component, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 print:border-black p-2 font-medium">
                  {component.componente}
                </td>
                <td className="border border-gray-300 print:border-black p-2 text-center">
                  <input
                    type="checkbox"
                    checked={component.ok || false}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateComponent(index, 'ok', e.target.checked)}
                    className="checkbox mx-auto"
                  />
                </td>
                <td className="border border-gray-300 print:border-black p-2">
                  <textarea
                    value={component.comentario}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateComponent(index, 'comentario', e.target.value)}
                    className="w-full border-0 resize-none focus:ring-0 p-0 min-h-[40px]"
                    rows={2}
                    placeholder="Comentario..."
                  />
                </td>
                <td className="border border-gray-300 print:border-black p-2">
                  <input
                    type="number"
                    value={component.precio || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateComponent(index, 'precio', parseFloat(e.target.value) || 0)}
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

    </div>
  )
}

