import { useState } from 'react'
import type { DamageMark } from '../utils/inspectionDataSchema'

interface Props {
  view: 'front' | 'rear' | 'side' | 'top'
  damages: DamageMark[]
  onDamageAdd: (damage: DamageMark) => void
  onDamageRemove: (index: number) => void
  selectedDamageType: '0' | 'x' | '#' | 'z' | null
}

const damageColors = {
  '0': '#ff0000', // Red - Daño de chapa
  'x': '#ff9900', // Orange - Daño de pintura
  '#': '#0000ff', // Blue - Daño de cristal
  'z': '#9900ff', // Purple - Daño de ópticas
}

const damageLabels = {
  '0': 'Chapa',
  'x': 'Pintura',
  '#': 'Cristal',
  'z': 'Ópticas',
}

export default function VehicleDiagram({
  view,
  damages,
  onDamageAdd,
  onDamageRemove,
  selectedDamageType,
}: Props) {
  const [svgRef, setSvgRef] = useState<SVGSVGElement | null>(null)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedDamageType || !svgRef) return

    const rect = svgRef.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    onDamageAdd({
      tipo: selectedDamageType,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      descripcion: '',
    })
  }

  const getViewDamage = () => {
    // Filter damages by view (this is simplified - in a real app you'd map coordinates per view)
    return damages
  }

  const renderCarShape = () => {
    switch (view) {
      case 'front':
        return (
          <path
            d="M 20 20 L 80 20 L 85 40 L 90 50 L 90 70 L 85 80 L 15 80 L 10 70 L 10 50 L 15 40 Z"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        )
      case 'rear':
        return (
          <path
            d="M 20 20 L 80 20 L 85 30 L 85 70 L 80 80 L 20 80 L 15 70 L 15 30 Z"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        )
      case 'side':
        return (
          <path
            d="M 10 30 L 15 20 L 25 15 L 70 15 L 85 25 L 90 35 L 90 65 L 85 75 L 75 80 L 25 80 L 15 75 L 10 65 Z"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        )
      case 'top':
        return (
          <path
            d="M 20 30 L 80 30 L 85 40 L 85 60 L 80 70 L 20 70 L 15 60 L 15 40 Z"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="relative border p-2 print:border-black">
      <div className="text-xs font-bold mb-1 text-center">
        Vista {view === 'front' ? 'Frontal' : view === 'rear' ? 'Trasera' : view === 'side' ? 'Lateral' : 'Superior'}
      </div>
      <svg
        ref={setSvgRef}
        viewBox="0 0 100 100"
        className="w-full h-32 cursor-crosshair print:h-24"
        onClick={handleSvgClick}
        style={{ border: selectedDamageType ? '2px dashed #333' : '1px solid #ccc' }}
      >
        {/* Car shape */}
        {renderCarShape()}
        
        {/* Damage markers */}
        {getViewDamage().map((damage, idx) => (
          <g key={idx}>
            <circle
              cx={damage.x}
              cy={damage.y}
              r="3"
              fill={damageColors[damage.tipo]}
              stroke="#000"
              strokeWidth="0.5"
              onClick={(e) => {
                e.stopPropagation()
                onDamageRemove(damages.indexOf(damage))
              }}
              className="cursor-pointer hover:r-4"
            />
            <text
              x={damage.x}
              y={damage.y - 5}
              fontSize="4"
              fill={damageColors[damage.tipo]}
              textAnchor="middle"
              fontWeight="bold"
            >
              {damage.tipo}
            </text>
          </g>
        ))}
      </svg>
      {selectedDamageType && (
        <div className="text-xs text-center mt-1 text-gray-600">
          Click para marcar daño de {damageLabels[selectedDamageType]}
        </div>
      )}
    </div>
  )
}

