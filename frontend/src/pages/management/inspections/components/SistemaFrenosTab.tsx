import { useState, useEffect } from 'react'
import type { SistemaFrenos } from '../utils/inspectionDataSchema'
import VehicleDiagram from './VehicleDiagram'

interface Props {
  data: SistemaFrenos
  onChange: (data: SistemaFrenos) => void
}

export default function SistemaFrenosTab({ data, onChange }: Props) {
  const [localData, setLocalData] = useState<SistemaFrenos>(data)
  const [selectedDamageType, setSelectedDamageType] = useState<'0' | 'x' | '#' | 'z' | null>(null)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  useEffect(() => {
    onChange(localData)
  }, [localData, onChange])

  const updateComponent = (index: number, field: keyof SistemaFrenos['componentes'][0], value: any) => {
    const newComponents = [...localData.componentes]
    newComponents[index] = { ...newComponents[index], [field]: value }
    setLocalData({ ...localData, componentes: newComponents })
  }

  const handleDamageAdd = (damage: SistemaFrenos['danosDiagrama'][0]) => {
    setLocalData({
      ...localData,
      danosDiagrama: [...localData.danosDiagrama, damage],
    })
  }

  const handleDamageRemove = (index: number) => {
    const newDanos = localData.danosDiagrama.filter((_, i) => i !== index)
    setLocalData({ ...localData, danosDiagrama: newDanos })
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
                    onChange={(e) => updateComponent(index, 'ok', e.target.checked)}
                    className="checkbox mx-auto"
                  />
                </td>
                <td className="border border-gray-300 print:border-black p-2">
                  <textarea
                    value={component.comentario}
                    onChange={(e) => updateComponent(index, 'comentario', e.target.value)}
                    className="w-full border-0 resize-none focus:ring-0 p-0 min-h-[40px]"
                    rows={2}
                    placeholder="Comentario..."
                  />
                </td>
                <td className="border border-gray-300 print:border-black p-2">
                  <input
                    type="number"
                    value={component.precio || ''}
                    onChange={(e) => updateComponent(index, 'precio', parseFloat(e.target.value) || 0)}
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

      {/* Damage Diagrams Section */}
      <div className="border p-4 print:border-black">
        <h3 className="text-lg font-bold mb-4">Diagrama de Daños</h3>
        
        {/* Legend */}
        <div className="mb-4 p-3 bg-gray-100 print:bg-gray-50 border print:border-black">
          <h4 className="font-bold mb-2">Leyenda:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border border-black"></div>
              <span><strong>0 = DAÑO DE CHAPA</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 border border-black"></div>
              <span><strong>X = DAÑO DE PINTURA</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 border border-black"></div>
              <span><strong># = DAÑO DE CRISTAL</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 border border-black"></div>
              <span><strong>Z = DAÑO DE ÓPTICAS</strong></span>
            </div>
          </div>
        </div>

        {/* Damage Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Seleccionar tipo de daño:</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSelectedDamageType(selectedDamageType === '0' ? null : '0')}
              className={`px-4 py-2 border-2 ${
                selectedDamageType === '0' ? 'border-red-500 bg-red-100' : 'border-gray-300'
              } rounded`}
            >
              0 - Chapa
            </button>
            <button
              type="button"
              onClick={() => setSelectedDamageType(selectedDamageType === 'x' ? null : 'x')}
              className={`px-4 py-2 border-2 ${
                selectedDamageType === 'x' ? 'border-orange-500 bg-orange-100' : 'border-gray-300'
              } rounded`}
            >
              X - Pintura
            </button>
            <button
              type="button"
              onClick={() => setSelectedDamageType(selectedDamageType === '#' ? null : '#')}
              className={`px-4 py-2 border-2 ${
                selectedDamageType === '#' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
              } rounded`}
            >
              # - Cristal
            </button>
            <button
              type="button"
              onClick={() => setSelectedDamageType(selectedDamageType === 'z' ? null : 'z')}
              className={`px-4 py-2 border-2 ${
                selectedDamageType === 'z' ? 'border-purple-500 bg-purple-100' : 'border-gray-300'
              } rounded`}
            >
              Z - Ópticas
            </button>
            {selectedDamageType && (
              <button
                type="button"
                onClick={() => setSelectedDamageType(null)}
                className="px-4 py-2 bg-gray-200 border border-gray-300 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Vehicle Diagrams */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
          <VehicleDiagram
            view="front"
            damages={localData.danosDiagrama}
            onDamageAdd={handleDamageAdd}
            onDamageRemove={handleDamageRemove}
            selectedDamageType={selectedDamageType}
          />
          <VehicleDiagram
            view="rear"
            damages={localData.danosDiagrama}
            onDamageAdd={handleDamageAdd}
            onDamageRemove={handleDamageRemove}
            selectedDamageType={selectedDamageType}
          />
          <VehicleDiagram
            view="side"
            damages={localData.danosDiagrama}
            onDamageAdd={handleDamageAdd}
            onDamageRemove={handleDamageRemove}
            selectedDamageType={selectedDamageType}
          />
          <VehicleDiagram
            view="side"
            damages={localData.danosDiagrama}
            onDamageAdd={handleDamageAdd}
            onDamageRemove={handleDamageRemove}
            selectedDamageType={selectedDamageType}
          />
          <VehicleDiagram
            view="top"
            damages={localData.danosDiagrama}
            onDamageAdd={handleDamageAdd}
            onDamageRemove={handleDamageRemove}
            selectedDamageType={selectedDamageType}
          />
        </div>

        {/* Damage List */}
        {localData.danosDiagrama.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold mb-2">Daños marcados:</h4>
            <div className="space-y-2">
              {localData.danosDiagrama.map((damage, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                  <span className="font-bold">{damage.tipo}</span>
                  <span className="text-sm">
                    ({damage.x.toFixed(1)}%, {damage.y.toFixed(1)}%)
                  </span>
                  {damage.descripcion && <span className="text-sm">- {damage.descripcion}</span>}
                  <button
                    type="button"
                    onClick={() => handleDamageRemove(idx)}
                    className="ml-auto text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

