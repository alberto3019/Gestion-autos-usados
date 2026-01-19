import { useState, useRef, MouseEvent } from 'react'
import type { DamageMark } from '../utils/inspectionDataSchema'

interface Props {
  view: 'front' | 'rear' | 'side' | 'side-driver' | 'top'
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

const imageMap: Record<string, string> = {
  'front': '/inspection-diagrams/frente.png',
  'rear': '/inspection-diagrams/trasero.png',
  'side': '/inspection-diagrams/lateral acompañante.png',
  'side-driver': '/inspection-diagrams/lateral conductor.png',
  'top': '/inspection-diagrams/arriba.png',
}

const viewLabels: Record<string, string> = {
  'front': 'Vista Frontal',
  'rear': 'Vista Trasera',
  'side': 'Vista Lateral Acompañante',
  'side-driver': 'Vista Lateral Conductor',
  'top': 'Vista Superior',
}

export default function VehicleDiagram({
  view,
  damages,
  onDamageAdd,
  onDamageRemove,
  selectedDamageType,
}: Props) {
  const imageRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!selectedDamageType || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    onDamageAdd({
      tipo: selectedDamageType,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      descripcion: '',
    })
  }

  // Damages are already filtered by view (passed from parent)
  const getViewDamages = () => {
    return damages
  }

  const imageSrc = imageMap[view] || imageMap['front']

  return (
    <div className="relative border p-2 print:border-black">
      <div className="text-xs font-bold mb-1 text-center">
        {viewLabels[view] || 'Vista del Auto'}
      </div>
      <div
        ref={imageRef}
        className={`relative w-full cursor-crosshair ${selectedDamageType ? 'ring-2 ring-blue-500' : ''}`}
        onClick={handleImageClick}
        style={{ minHeight: '150px' }}
      >
        <img
          src={imageSrc}
          alt={viewLabels[view]}
          className="w-full h-auto max-h-48 object-contain print:max-h-40"
          onLoad={() => setImageLoaded(true)}
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Damage markers overlay */}
        {imageLoaded && getViewDamages().map((damage, idx) => {
          const damageIndex = damages.indexOf(damage)
          return (
            <div
              key={idx}
              className="absolute cursor-pointer group"
              style={{
                left: `${damage.x}%`,
                top: `${damage.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onDamageRemove(damageIndex)
              }}
            >
              <div
                className="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{
                  backgroundColor: `${damageColors[damage.tipo]}80`, // 80 = 50% opacity
                  borderColor: damageColors[damage.tipo],
                }}
              >
                <span
                  className="text-white font-bold text-xs pointer-events-none"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {damage.tipo}
                </span>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {damageLabels[damage.tipo]}
                    {damage.descripcion && `: ${damage.descripcion}`}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {selectedDamageType && (
        <div className="text-xs text-center mt-1 text-gray-600 print:hidden">
          Click en la imagen para marcar daño de {damageLabels[selectedDamageType]}
        </div>
      )}
    </div>
  )
}
