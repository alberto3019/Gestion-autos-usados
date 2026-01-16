import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import { adminApi } from '../../../api/admin'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

interface AgencyPaymentDetailModalProps {
  agencyId: string
  onClose: () => void
}

const PLAN_PRICES = {
  basic: 30,
  premium: 70,
  enterprise: 100,
}

export default function AgencyPaymentDetailModal({ agencyId, onClose }: AgencyPaymentDetailModalProps) {
  const queryClient = useQueryClient()
  const [nextDueDate, setNextDueDate] = useState('')
  const [monthsToGenerate, setMonthsToGenerate] = useState(1)

  const { data: agencyDetails, isLoading } = useQuery({
    queryKey: ['agencyPaymentDetails', agencyId],
    queryFn: () => adminApi.getAgencyPaymentDetails(agencyId),
  })

  const generateDebtMutation = useMutation({
    mutationFn: ({ nextDueDate, monthsToGenerate }: { nextDueDate: string; monthsToGenerate: number }) =>
      adminApi.generateDebtRecords(agencyId, nextDueDate, monthsToGenerate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyPaymentDetails', agencyId] })
      queryClient.invalidateQueries({ queryKey: ['agenciesWithPayments'] })
      queryClient.invalidateQueries({ queryKey: ['paymentAlerts'] })
      alert('Registros de deuda generados exitosamente')
      setNextDueDate('')
      setMonthsToGenerate(1)
    },
  })

  const paymentRecords = agencyDetails?.paymentRecords || []
  const paymentHistory = agencyDetails?.paymentHistory || []
  const agency = agencyDetails?.agency
  const subscription = agencyDetails?.subscription

  // Calcular deuda acumulada (meses sin pagar)
  const unpaidMonths = paymentRecords.filter((r: any) => !r.isPaid && dayjs(r.dueDate).isBefore(dayjs()))
  const totalDebt = unpaidMonths.reduce((sum: number, r: any) => sum + Number(r.totalAmount || 0), 0)

  // Calcular próximo vencimiento sugerido
  const lastPaidRecord = paymentRecords
    .filter((r: any) => r.isPaid)
    .sort((a: any, b: any) => dayjs(b.dueDate).unix() - dayjs(a.dueDate).unix())[0]
  
  const suggestedNextDueDate = lastPaidRecord
    ? dayjs(lastPaidRecord.dueDate).add(1, 'month').format('YYYY-MM-DD')
    : dayjs().add(1, 'month').format('YYYY-MM-DD')

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalle de Pagos</h2>
            <p className="text-sm text-gray-500 mt-1">{agency?.commercialName || agency?.businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la Agencia */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Información de la Agencia</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Plan:</span>
                <span className="ml-2 font-medium capitalize">{subscription?.plan || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Método de Pago:</span>
                <span className="ml-2 font-medium">{subscription?.paymentMethod || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-gray-500">Día de Vencimiento:</span>
                <span className="ml-2 font-medium">{subscription?.billingDay || 5} de cada mes</span>
              </div>
              <div>
                <span className="text-gray-500">Fecha de Alta:</span>
                <span className="ml-2 font-medium">
                  {dayjs(agency?.createdAt).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </div>

          {/* Resumen de Deuda */}
          {totalDebt > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Deuda Acumulada</h3>
                  <p className="text-2xl font-bold text-red-600">${totalDebt.toFixed(2)} USD</p>
                  <p className="text-sm text-red-700 mt-1">
                    {unpaidMonths.length} {unpaidMonths.length === 1 ? 'mes' : 'meses'} sin pagar
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Configurar Próximo Vencimiento */}
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" />
              Configurar Próximo Vencimiento y Generar Deuda
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Si hay meses sin registrar pagos, puedes generarlos automáticamente desde el último pago registrado hasta el próximo vencimiento configurado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Vencimiento
                </label>
                <Input
                  type="date"
                  value={nextDueDate || suggestedNextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meses a Generar
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={monthsToGenerate}
                  onChange={(e) => setMonthsToGenerate(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad de meses de deuda a generar desde el último pago
                </p>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    if (!nextDueDate && !suggestedNextDueDate) {
                      alert('Por favor selecciona una fecha de vencimiento')
                      return
                    }
                    generateDebtMutation.mutate({
                      nextDueDate: nextDueDate || suggestedNextDueDate,
                      monthsToGenerate,
                    })
                  }}
                  isLoading={generateDebtMutation.isPending}
                  disabled={generateDebtMutation.isPending}
                >
                  Generar Deuda
                </Button>
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-primary-600" />
              Registro de Pagos ({paymentRecords.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes/Año</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Base</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extras</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonificación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 text-center text-gray-500 text-sm">
                        No hay registros de pago
                      </td>
                    </tr>
                  ) : (
                    paymentRecords.map((record: any) => {
                      const isOverdue = !record.isPaid && dayjs(record.dueDate).isBefore(dayjs())
                      const isUpcoming = !record.isPaid && dayjs(record.dueDate).isAfter(dayjs()) && dayjs(record.dueDate).diff(dayjs(), 'days') <= 7

                      return (
                        <tr
                          key={record.id}
                          className={`${isOverdue ? 'bg-red-50' : isUpcoming ? 'bg-yellow-50' : record.isPaid ? 'bg-green-50' : ''}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {dayjs().month(record.month - 1).format('MMMM')} {record.year}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {dayjs(record.dueDate).format('DD/MM/YYYY')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            ${Number(record.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            ${Number(record.extraAmount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            ${Number((record as any).discountAmount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${Number(record.totalAmount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {record.isPaid ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Pagado
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Vencido
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {record.paidAt ? dayjs(record.paidAt).format('DD/MM/YYYY') : '-'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial de Pagos (PaymentHistory) */}
          {paymentHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-600" />
                Historial de Transacciones ({paymentHistory.length})
              </h3>
              <div className="space-y-2">
                {paymentHistory.map((history: any) => (
                  <div key={history.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          ${Number(history.amount).toFixed(2)} - {history.paymentMethod}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {dayjs(history.paymentDate).format('DD/MM/YYYY HH:mm')}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

