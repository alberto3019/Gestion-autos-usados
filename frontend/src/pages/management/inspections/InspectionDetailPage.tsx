import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { inspectionsApi } from '../../../api/inspections'
import Button from '../../../components/common/Button'
import type { InspectionData } from './utils/inspectionDataSchema'

export default function InspectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionsApi.getInspection(id!),
    enabled: !!id,
  })

  const generatePdfMutation = useMutation({
    mutationFn: () => inspectionsApi.generatePdf(id!),
    onSuccess: (data) => {
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank')
      }
      queryClient.invalidateQueries({ queryKey: ['inspection', id] })
    },
  })

  if (isLoading) return <div className="text-center py-8">Cargando...</div>
  if (!inspection) return <div>Peritaje no encontrado</div>

  const inspectionData = inspection.data as InspectionData | Record<string, any>

  const handleGeneratePdf = () => {
    generatePdfMutation.mutate()
  }

  const handleDownloadPdf = () => {
    if (inspection.pdfUrl) {
      window.open(inspection.pdfUrl, '_blank')
    } else {
      handleGeneratePdf()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detalle del Peritaje</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownloadPdf} disabled={generatePdfMutation.isPending}>
            {generatePdfMutation.isPending ? 'Generando...' : inspection.pdfUrl ? 'Ver PDF' : 'Generar PDF'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/management/inspections')}>
            Volver
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Información General</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Inspector</label>
            <p className="text-lg">{inspection.inspectorName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha</label>
            <p className="text-lg">{new Date(inspection.inspectionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <p className="text-lg capitalize">{inspection.status}</p>
          </div>
          {inspection.vehicle && (
            <div>
              <label className="text-sm font-medium text-gray-500">Vehículo</label>
              <p className="text-lg">
                {inspection.vehicle.brand} {inspection.vehicle.model} ({inspection.vehicle.year})
              </p>
            </div>
          )}
        </div>
        {inspection.observations && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Observaciones Generales</label>
            <p className="text-lg">{inspection.observations}</p>
          </div>
        )}
      </div>

      {/* PERITAJE MECÁNICO */}
      {inspectionData.mecanico && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">PERITAJE MECÁNICO</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inspectionData.mecanico.header && (
                <>
                  <div><strong>Fecha:</strong> {inspectionData.mecanico.header.fecha || '-'}</div>
                  <div><strong>Kilometraje:</strong> {inspectionData.mecanico.header.kilometraje || '-'}</div>
                  <div><strong>Propietario:</strong> {inspectionData.mecanico.header.propietario || '-'}</div>
                  <div><strong>Dominio:</strong> {inspectionData.mecanico.header.dominio || '-'}</div>
                  <div><strong>Marca:</strong> {inspectionData.mecanico.header.marca || '-'}</div>
                  <div><strong>Modelo:</strong> {inspectionData.mecanico.header.modelo || '-'}</div>
                  <div><strong>Año:</strong> {inspectionData.mecanico.header.año || '-'}</div>
                  <div><strong>Color:</strong> {inspectionData.mecanico.header.color || '-'}</div>
                </>
              )}
            </div>

            {inspectionData.mecanico.motor && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Motor</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Marca:</strong> {inspectionData.mecanico.motor.marca || '-'}</div>
                  <div><strong>Cilindrada:</strong> {inspectionData.mecanico.motor.cilindrada || '-'}</div>
                  <div><strong>HP:</strong> {inspectionData.mecanico.motor.hp || '-'}</div>
                  <div><strong>Combustible:</strong> {inspectionData.mecanico.motor.combustible || '-'}</div>
                </div>
              </div>
            )}

            {inspectionData.mecanico.puntaje && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Puntaje</h3>
                <p className="text-lg"><strong>{inspectionData.mecanico.puntaje.puntaje || 0}/10</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist General */}
      {inspectionData.checklist && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Checklist General</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ITEM</th>
                  <th className="border p-2 text-center">OK</th>
                  <th className="border p-2 text-left">COMENTARIO</th>
                  <th className="border p-2 text-left">PRECIO</th>
                </tr>
              </thead>
              <tbody>
                {inspectionData.checklist.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border p-2">{item.item}</td>
                    <td className="border p-2 text-center">{item.ok ? '✓' : '✗'}</td>
                    <td className="border p-2">{item.comentario || '-'}</td>
                    <td className="border p-2">{item.precio || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><strong>Valor Reacondicionado:</strong> ${inspectionData.checklist.valorReacondicionado || 0}</div>
            <div><strong>Valor Reparación:</strong> ${inspectionData.checklist.valorReparacion || 0}</div>
            <div><strong>Valor de Toma:</strong> ${inspectionData.checklist.valorToma || 0}</div>
            <div><strong>Total:</strong> ${inspectionData.checklist.total || 0}</div>
          </div>
        </div>
      )}

      {/* Control Tren */}
      {inspectionData.tren && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Control Tren Delantero y Trasero</h2>
          {inspectionData.tren.trenDelantero && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Tren Delantero</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">REPUESTO</th>
                      <th className="border p-2 text-center">OK</th>
                      <th className="border p-2 text-center">NO</th>
                      <th className="border p-2 text-left">DETALLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionData.tren.trenDelantero.map((comp: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border p-2">{comp.repuesto}</td>
                        <td className="border p-2 text-center">{comp.ok ? '✓' : '✗'}</td>
                        <td className="border p-2 text-center">{comp.no ? '✓' : '✗'}</td>
                        <td className="border p-2">{comp.detalle || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {inspectionData.tren.trenTrasero && (
            <div>
              <h3 className="font-semibold mb-2">Tren Trasero</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">REPUESTO</th>
                      <th className="border p-2 text-center">OK</th>
                      <th className="border p-2 text-center">NO</th>
                      <th className="border p-2 text-left">DETALLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionData.tren.trenTrasero.map((comp: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border p-2">{comp.repuesto}</td>
                        <td className="border p-2 text-center">{comp.ok ? '✓' : '✗'}</td>
                        <td className="border p-2 text-center">{comp.no ? '✓' : '✗'}</td>
                        <td className="border p-2">{comp.detalle || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sistema de Frenos */}
      {inspectionData.frenos && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Sistema de Frenos</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">COMPONENTE</th>
                  <th className="border p-2 text-center">OK</th>
                  <th className="border p-2 text-left">COMENTARIO</th>
                  <th className="border p-2 text-left">PRECIO</th>
                </tr>
              </thead>
              <tbody>
                {inspectionData.frenos.componentes?.map((comp: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border p-2">{comp.componente}</td>
                    <td className="border p-2 text-center">{comp.ok ? '✓' : '✗'}</td>
                    <td className="border p-2">{comp.comentario || '-'}</td>
                    <td className="border p-2">{comp.precio || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inspectionData.frenos.danosDiagrama && inspectionData.frenos.danosDiagrama.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Daños Marcados</h3>
              <div className="space-y-1">
                {inspectionData.frenos.danosDiagrama.map((dano: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <strong>{dano.tipo}:</strong> Posición ({dano.x}%, {dano.y}%)
                    {dano.descripcion && ` - ${dano.descripcion}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(`/management/inspections/${id}/edit`)}>
          Editar
        </Button>
      </div>
    </div>
  )
}
