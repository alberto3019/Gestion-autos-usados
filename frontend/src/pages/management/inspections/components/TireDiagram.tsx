import { ChangeEvent } from 'react'
import type { NeumaticoCondition } from '../utils/inspectionDataSchema'

interface Props {
  neumaticos: NeumaticoCondition[]
  auxilioCondicion: 'n' | 'b' | 'r' | 'o' | ''
  onUpdate: (neumaticos: NeumaticoCondition[], auxilioCondicion: string) => void
}

const conditionLabels = {
  n: 'NUEVO',
  b: 'BUENO',
  r: 'REGULAR',
  m: 'MALO',
  o: 'OTRO',
}

const conditionColors = {
  n: 'bg-green-500',
  b: 'bg-blue-500',
  r: 'bg-yellow-500',
  m: 'bg-red-500',
  o: 'bg-gray-500',
}

export default function TireDiagram({ neumaticos, auxilioCondicion, onUpdate }: Props) {
  const updateTire = (posicion: NeumaticoCondition['posicion'], condicion: NeumaticoCondition['condicion']) => {
    const existing = neumaticos.filter((n) => n.posicion !== posicion)
    onUpdate(
      [...existing, { posicion, condicion }],
      auxilioCondicion
    )
  }

  const getTireCondition = (posicion: NeumaticoCondition['posicion']) => {
    return neumaticos.find((n) => n.posicion === posicion)?.condicion || ''
  }

  // Positions on the top view image (approximate percentages)
  const tirePositions = {
    delantero_izquierdo: { left: '15%', top: '35%' },
    delantero_derecho: { left: '85%', top: '35%' },
    trasero_izquierdo: { left: '15%', top: '65%' },
    trasero_derecho: { left: '85%', top: '65%' },
  }

  return (
    <div className="border p-3 print:border-black">
      <h3 className="font-bold mb-2">NEUMÁTICOS</h3>
      <div className="text-xs mb-2 p-2 bg-red-100 border border-red-300 print:bg-red-50">
        <p><strong>N = NUEVO</strong> | <strong>B = BUENO</strong> | <strong>R = REGULAR</strong> | <strong>M = MALO</strong></p>
      </div>
      
      {/* Top view image with tire positions */}
      <div className="relative mb-4 border print:border-black" style={{ minHeight: '200px' }}>
        <img
          src="/inspection-diagrams/arriba.png"
          alt="Vista superior del auto"
          className="w-full h-auto max-h-48 object-contain print:max-h-40"
        />
        
        {/* Tire position markers */}
        {Object.entries(tirePositions).map(([key, position]) => {
          const condicion = getTireCondition(key as NeumaticoCondition['posicion'])
          const label = key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          return (
            <div
              key={key}
              className="absolute"
              style={{
                left: position.left,
                top: position.top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <select
                value={condicion}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  updateTire(key as NeumaticoCondition['posicion'], e.target.value as NeumaticoCondition['condicion'])
                }
                className={`text-xs font-bold text-white px-2 py-1 rounded border-2 border-white shadow-md ${
                  condicion ? conditionColors[condicion] : 'bg-gray-400'
                }`}
                style={{ minWidth: '60px' }}
              >
                <option value="">-</option>
                {Object.entries(conditionLabels).map(([val, label]) => (
                  <option key={val} value={val}>
                    {val.toUpperCase()} - {label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-center mt-1 font-semibold whitespace-nowrap">{label}</div>
            </div>
          )
        })}
      </div>

      {/* Auxilio selector */}
      <div>
        <label className="block text-sm font-medium mb-1">AUXILIO</label>
        <div className="flex gap-2">
          {(['n', 'b', 'r', 'o'] as const).map((cond) => (
            <label key={cond} className="flex items-center gap-1">
              <input
                type="radio"
                name="auxilioCondicion"
                value={cond}
                checked={auxilioCondicion === cond}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  onUpdate(neumaticos, e.target.value as 'n' | 'b' | 'r' | 'o')
                }}
              />
              <span className="text-sm uppercase">{cond} - {conditionLabels[cond]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

