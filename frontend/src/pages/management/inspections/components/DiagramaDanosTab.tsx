import { useState, useEffect, useRef, ChangeEvent } from 'react'
import type { DanosDiagrama, DamageMark } from '../utils/inspectionDataSchema'
import VehicleDiagram from './VehicleDiagram'

interface Props {
  data: DanosDiagrama
  onChange: (data: DanosDiagrama) => void
}

const damageTypeLabels: Record<DamageMark['tipo'], string> = {
  '0': 'CHAPA',
  'x': 'PINTURA',
  '#': 'CRISTAL',
  'z': 'ÓPTICAS',
}

export default function DiagramaDanosTab({ data, onChange }: Props) {
  const [localData, setLocalData] = useState<DanosDiagrama>(data)
  const [selectedDamageType, setSelectedDamageType] = useState<'0' | 'x' | '#' | 'z' | null>(null)
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

  const handleDamageAdd = (view: keyof DanosDiagrama, damage: DamageMark) => {
    isUpdatingRef.current = true
    setLocalData({
      ...localData,
      [view]: [...localData[view], damage],
    })
  }

  const handleDamageRemove = (view: keyof DanosDiagrama, index: number) => {
    isUpdatingRef.current = true
    setLocalData({
      ...localData,
      [view]: localData[view].filter((_, i) => i !== index),
    })
  }

  // Get all damages for display
  const getAllDamages = (): Array<{ view: string; viewLabel: string; damage: DamageMark; index: number }> => {
    const result: Array<{ view: string; viewLabel: string; damage: DamageMark; index: number }> = []
    const viewLabels: Record<keyof DanosDiagrama, string> = {
      front: 'Vista Frontal',
      rear: 'Vista Trasera',
      sideDriver: 'Vista Lateral Conductor',
      side: 'Vista Lateral Acompañante',
      top: 'Vista Superior',
    }

    Object.entries(localData).forEach(([view, damages]) => {
      damages.forEach((damage: DamageMark, index: number) => {
        result.push({
          view,
          viewLabel: viewLabels[view as keyof DanosDiagrama],
          damage,
          index,
        })
      })
    })

    return result
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">DIAGRAMA DE DAÑOS</h2>
      </div>

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
        <div className="flex gap-4 flex-wrap">
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
          damages={localData.front}
          onDamageAdd={(damage) => handleDamageAdd('front', damage)}
          onDamageRemove={(index) => handleDamageRemove('front', index)}
          selectedDamageType={selectedDamageType}
        />
        <VehicleDiagram
          view="rear"
          damages={localData.rear}
          onDamageAdd={(damage) => handleDamageAdd('rear', damage)}
          onDamageRemove={(index) => handleDamageRemove('rear', index)}
          selectedDamageType={selectedDamageType}
        />
        <VehicleDiagram
          view="side-driver"
          damages={localData.sideDriver}
          onDamageAdd={(damage) => handleDamageAdd('sideDriver', damage)}
          onDamageRemove={(index) => handleDamageRemove('sideDriver', index)}
          selectedDamageType={selectedDamageType}
        />
        <VehicleDiagram
          view="side"
          damages={localData.side}
          onDamageAdd={(damage) => handleDamageAdd('side', damage)}
          onDamageRemove={(index) => handleDamageRemove('side', index)}
          selectedDamageType={selectedDamageType}
        />
        <VehicleDiagram
          view="top"
          damages={localData.top}
          onDamageAdd={(damage) => handleDamageAdd('top', damage)}
          onDamageRemove={(index) => handleDamageRemove('top', index)}
          selectedDamageType={selectedDamageType}
        />
      </div>

      {/* Damage List */}
      {getAllDamages().length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Daños marcados:</h4>
          <div className="space-y-2">
            {getAllDamages().map((item, idx) => (
              <div key={`${item.view}-${idx}`} className="flex items-center gap-2 p-2 border rounded">
                <span className="font-semibold text-sm min-w-[120px]">{item.viewLabel}:</span>
                <span className="font-bold">{damageTypeLabels[item.damage.tipo]}</span>
                <span className="text-sm text-gray-600">
                  ({item.damage.x.toFixed(1)}%, {item.damage.y.toFixed(1)}%)
                </span>
                {item.damage.descripcion && (
                  <span className="text-sm text-gray-700">- {item.damage.descripcion}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDamageRemove(item.view as keyof DanosDiagrama, item.index)}
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
  )
}

