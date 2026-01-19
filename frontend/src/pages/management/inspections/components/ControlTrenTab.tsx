import { useState, useEffect } from 'react'
import type { ControlTren } from '../utils/inspectionDataSchema'

interface Props {
  data: ControlTren
  onChange: (data: ControlTren) => void
}

export default function ControlTrenTab({ data, onChange }: Props) {
  const [localData, setLocalData] = useState<ControlTren>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  useEffect(() => {
    onChange(localData)
  }, [localData, onChange])

  const updateComponent = (
    tren: 'trenDelantero' | 'trenTrasero',
    index: number,
    field: keyof ControlTren['trenDelantero'][0],
    value: any
  ) => {
    const newComponents = [...localData[tren]]
    newComponents[index] = { ...newComponents[index], [field]: value }
    
    // Ensure OK and NO are mutually exclusive
    if (field === 'ok' && value) {
      newComponents[index] = { ...newComponents[index], no: false }
    } else if (field === 'no' && value) {
      newComponents[index] = { ...newComponents[index], ok: false }
    }
    
    setLocalData({ ...localData, [tren]: newComponents })
  }

  const renderTrenTable = (
    title: string,
    components: ControlTren['trenDelantero'],
    trenKey: 'trenDelantero' | 'trenTrasero'
  ) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="border print:border-black overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border border-gray-300 print:border-black p-2 text-left font-bold">REPUESTO</th>
                <th className="border border-gray-300 print:border-black p-2 text-center font-bold w-16">OK</th>
                <th className="border border-gray-300 print:border-black p-2 text-center font-bold w-16">NO</th>
                <th className="border border-gray-300 print:border-black p-2 text-left font-bold">DETALLE</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 print:border-black p-2 font-medium">
                    {component.repuesto}
                  </td>
                  <td className="border border-gray-300 print:border-black p-2 text-center">
                    <input
                      type="checkbox"
                      checked={component.ok || false}
                      onChange={(e) => updateComponent(trenKey, index, 'ok', e.target.checked)}
                      className="checkbox mx-auto"
                    />
                  </td>
                  <td className="border border-gray-300 print:border-black p-2 text-center">
                    <input
                      type="checkbox"
                      checked={component.no || false}
                      onChange={(e) => updateComponent(trenKey, index, 'no', e.target.checked)}
                      className="checkbox mx-auto"
                    />
                  </td>
                  <td className="border border-gray-300 print:border-black p-2">
                    <textarea
                      value={component.detalle}
                      onChange={(e) => updateComponent(trenKey, index, 'detalle', e.target.value)}
                      className="w-full border-0 resize-none focus:ring-0 p-0 min-h-[40px]"
                      rows={2}
                      placeholder="Detalle..."
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

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">CONTROL TREN DELANTERO Y TRASERO</h2>
      </div>

      {renderTrenTable('CONTROL TREN DELANTERO', localData.trenDelantero, 'trenDelantero')}
      {renderTrenTable('CONTROL TREN TRASERO', localData.trenTrasero, 'trenTrasero')}
    </div>
  )
}

