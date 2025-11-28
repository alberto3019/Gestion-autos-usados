import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'

interface Province {
  name: string
  value: number
}

interface ArgentinaMapProps {
  data: Province[]
}

const provinceMap: Record<string, string> = {
  'Buenos Aires': 'AR-B', 'Catamarca': 'AR-K', 'Chaco': 'AR-H', 'Chubut': 'AR-U',
  'CABA': 'AR-C', 'Córdoba': 'AR-X', 'Corrientes': 'AR-W', 'Entre Ríos': 'AR-E',
  'Formosa': 'AR-P', 'Jujuy': 'AR-Y', 'La Pampa': 'AR-L', 'La Rioja': 'AR-F',
  'Mendoza': 'AR-M', 'Misiones': 'AR-N', 'Neuquén': 'AR-Q', 'Río Negro': 'AR-R',
  'Salta': 'AR-A', 'San Juan': 'AR-J', 'San Luis': 'AR-D', 'Santa Cruz': 'AR-Z',
  'Santa Fe': 'AR-S', 'Santiago del Estero': 'AR-G', 'Tierra del Fuego': 'AR-V',
  'Tucumán': 'AR-T'
}

const getColor = (value: number) => {
  if (value === 0) return '#e5e7eb' // Gris - sin datos
  if (value >= 200) return '#1e40af' // Azul muy oscuro - 200+
  if (value >= 100) return '#2563eb' // Azul oscuro - 100-199
  if (value >= 50) return '#3b82f6'  // Azul medio - 50-99
  if (value >= 20) return '#60a5fa'  // Azul claro - 20-49
  return '#93c5fd'                    // Azul muy claro - 1-19
}

export default function ArgentinaMap({ data }: ArgentinaMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const dataMap = new Map(data.map(p => [p.name, p.value]))

  useEffect(() => {
    const loadSvg = async () => {
      const response = await fetch('/argentina.svg')
      const svgText = await response.text()
      if (svgRef.current) {
        svgRef.current.innerHTML = svgText
        const svg = svgRef.current.querySelector('svg')
        if (svg) {
          // Mantener proporción original del SVG (361.5 x 792.5)
          svg.setAttribute('viewBox', '0 0 361.55 792.58')
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          svg.style.width = '100%'
          svg.style.height = '100%'
          svg.style.cursor = 'grab'
          
          // Limpiar listeners anteriores
          const cleanupFunctions: (() => void)[] = []
          
          Object.entries(provinceMap).forEach(([name, id]) => {
            const path = svg.querySelector(`#${id}`) as SVGPathElement
            if (path) {
              const value = dataMap.get(name) || 0
              const color = getColor(value)
              
              path.setAttribute('fill', color)
              path.setAttribute('stroke', '#fff')
              path.setAttribute('stroke-width', '0.5')
              path.style.cursor = 'pointer'
              path.style.transition = 'all 0.2s'
              
              const handleMouseEnter = (e: Event) => {
                const event = e as MouseEvent
                setHoveredProvince(name)
                setTooltipPos({ x: event.clientX, y: event.clientY })
                path.style.opacity = '0.8'
              }
              
              const handleMouseMove = (e: Event) => {
                const event = e as MouseEvent
                setTooltipPos({ x: event.clientX, y: event.clientY })
              }
              
              const handleMouseLeave = () => {
                setHoveredProvince(null)
                path.style.opacity = '1'
              }
              
              path.addEventListener('mouseenter', handleMouseEnter)
              path.addEventListener('mousemove', handleMouseMove)
              path.addEventListener('mouseleave', handleMouseLeave)
              
              cleanupFunctions.push(() => {
                path.removeEventListener('mouseenter', handleMouseEnter)
                path.removeEventListener('mousemove', handleMouseMove)
                path.removeEventListener('mouseleave', handleMouseLeave)
              })
            }
          })
          
          // Retornar función de cleanup
          return () => {
            cleanupFunctions.forEach(cleanup => cleanup())
          }
        }
      }
    }
    
    loadSvg()
  }, [data])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing'
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }

  const handleContainerMouseLeave = () => {
    setIsDragging(false)
    setHoveredProvince(null)
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition-colors"
          title="Acercar"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition-colors"
          title="Alejar"
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition-colors text-xs font-medium"
          title="Resetear"
        >
          ↺
        </button>
      </div>

      {/* Map Container */}
      <div 
        ref={containerRef}
        className="overflow-hidden relative border border-gray-200 rounded"
        style={{ height: '700px', cursor: 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleContainerMouseLeave}
      >
        <div
          ref={svgRef}
                style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>

      {hoveredProvince && (
        <div
          className="fixed z-50 bg-white px-3 py-2 rounded shadow-lg border pointer-events-none"
          style={{ left: tooltipPos.x + 10, top: tooltipPos.y + 10 }}
        >
          <p className="font-semibold text-sm">{hoveredProvince}</p>
          <p className="text-primary-600 text-sm">
            {dataMap.get(hoveredProvince) || 0} vehículos
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        <span className="text-gray-600">Menos</span>
        <div className="flex gap-1">
          {['bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-800'].map((color, i) => (
            <div key={i} className={`w-6 h-4 ${color} border border-gray-300`} />
          ))}
        </div>
        <span className="text-gray-600">Más</span>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        Total: {data.reduce((sum, p) => sum + p.value, 0)} vehículos en {data.length} provincias
      </p>
    </div>
  )
}
