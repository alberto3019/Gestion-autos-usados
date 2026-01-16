import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/admin'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Pagination from '../../components/common/Pagination'
import {
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import PaymentRecordModal from './components/PaymentRecordModal'
import GenerateMonthModal from './components/GenerateMonthModal'
import AgencyPaymentDetailModal from './components/AgencyPaymentDetailModal'

dayjs.locale('es')

const PLAN_PRICES = {
  basic: 30,
  premium: 70,
  enterprise: 100,
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1)
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { data: alertsData } = useQuery({
    queryKey: ['paymentAlerts'],
    queryFn: adminApi.getPaymentAlerts,
  })

  const { data: agenciesData, isLoading } = useQuery({
    queryKey: ['agenciesWithPayments', page, statusFilter, paymentMethodFilter, searchTerm, selectedMonth, selectedYear],
    queryFn: () =>
      adminApi.getAgenciesWithPayments({
        page,
        limit: 20,
        month: selectedMonth,
        year: selectedYear,
        isPaid: statusFilter ? statusFilter === 'paid' : undefined,
        paymentMethod: paymentMethodFilter || undefined,
        search: searchTerm || undefined,
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) => adminApi.updatePaymentRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenciesWithPayments'] })
      queryClient.invalidateQueries({ queryKey: ['paymentAlerts'] })
      setIsPaymentModalOpen(false)
      setSelectedRecord(null)
    },
  })

  const createOrUpdateMutation = useMutation({
    mutationFn: adminApi.createOrUpdatePaymentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenciesWithPayments'] })
      queryClient.invalidateQueries({ queryKey: ['paymentAlerts'] })
      setIsPaymentModalOpen(false)
      setSelectedRecord(null)
    },
  })

  const generateMutation = useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      adminApi.generatePaymentRecordsForMonth(month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenciesWithPayments'] })
      queryClient.invalidateQueries({ queryKey: ['paymentAlerts'] })
      setIsGenerateModalOpen(false)
    },
  })

  const handleEditPayment = (agency: any) => {
    const lastPayment = agency.subscription?.paymentRecords?.[0]
    if (lastPayment) {
      setSelectedRecord({ ...lastPayment, agency })
    } else {
      // Crear nuevo registro
      setSelectedRecord({
        agencyId: agency.id,
        agency,
        year: selectedYear,
        month: selectedMonth,
        isPaid: false,
        extraAmount: 0,
      })
    }
    setIsPaymentModalOpen(true)
  }

  const getPaymentStatus = (record: any) => {
    if (!record) return { status: 'pending', label: 'Sin registro', color: 'gray' }
    
    // Si está pagado, mostrar como pagado
    if (record.isPaid) {
      // Pero verificar si es de un mes/año anterior al seleccionado
      const recordDate = dayjs(`${record.year}-${record.month}-01`)
      const currentMonthDate = dayjs(`${selectedYear}-${selectedMonth}-01`)
      if (recordDate.isBefore(currentMonthDate, 'month')) {
        // Es un pago de un mes anterior, no del mes actual
        return { status: 'pending', label: 'Sin vencer', color: 'gray' }
      }
      return { status: 'paid', label: 'Pagado', color: 'green' }
    }

    const today = dayjs()
    const dueDate = dayjs(record.dueDate)
    const daysUntilDue = dueDate.diff(today, 'day')

    // Si el vencimiento ya pasó
    if (daysUntilDue < 0) {
      return { status: 'overdue', label: 'Vencido', color: 'red' }
    }
    // Si está por vencer (5 días o menos)
    if (daysUntilDue <= 5) {
      return { status: 'upcoming', label: `Vence en ${daysUntilDue} días`, color: 'orange' }
    }
    // Pendiente, sin vencer aún
    return { status: 'pending', label: 'Sin vencer', color: 'gray' }
  }

  const agencies = agenciesData?.data || []
  const alerts = alertsData || { upcoming: [], overdue: [] }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
        <Button onClick={() => setIsGenerateModalOpen(true)}>
          <CalendarIcon className="w-5 h-5 mr-2 inline" />
          Generar Registros para Mes
        </Button>
      </div>

      {/* Alert Banner */}
      {(alerts.upcoming.length > 0 || alerts.overdue.length > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              <div>
                {alerts.overdue.length > 0 && (
                  <p className="text-red-600 font-semibold">
                    {alerts.overdue.length} {alerts.overdue.length === 1 ? 'pago vencido' : 'pagos vencidos'} sin pagar
                  </p>
                )}
                {alerts.upcoming.length > 0 && (
                  <p className="text-orange-600 font-semibold">
                    {alerts.upcoming.length} {alerts.upcoming.length === 1 ? 'pago próximo a vencer' : 'pagos próximos a vencer'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar agencia..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="paid">Pagados</option>
              <option value="unpaid">No pagados</option>
            </select>
          </div>

          <div>
            <Input
              type="text"
              placeholder="Método de pago..."
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(parseInt(e.target.value))
                setPage(1)
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {dayjs().month(m - 1).format('MMMM')}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value))
                setPage(1)
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan / Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Alta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : agencies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron agencias
                  </td>
                </tr>
              ) : (
                agencies.map((agency: any) => {
                  // Buscar el registro del mes/año seleccionado específicamente
                  const currentMonthPayment = agency.subscription?.paymentRecords?.find(
                    (r: any) => r.month === selectedMonth && r.year === selectedYear
                  ) || agency.subscription?.paymentRecords?.[0] // Fallback al último si no hay del mes seleccionado
                  
                  const status = getPaymentStatus(currentMonthPayment)
                  const planPrice = PLAN_PRICES[agency.subscription?.plan as keyof typeof PLAN_PRICES] || 0

                  return (
                    <tr key={agency.id} className={status.color === 'orange' || status.color === 'red' ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{agency.commercialName}</div>
                        <div className="text-sm text-gray-500">{agency.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{agency.subscription?.plan || 'N/A'}</div>
                        <div className="text-sm text-gray-500">${planPrice} USD</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dayjs(agency.createdAt).format('DD/MM/YYYY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentMonthPayment ? dayjs(currentMonthPayment.dueDate).format('DD/MM/YYYY') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : status.color === 'red'
                              ? 'bg-red-100 text-red-800'
                              : status.color === 'orange'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {status.color === 'green' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                          {status.color === 'red' && <XCircleIcon className="w-4 h-4 mr-1" />}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentMonthPayment?.paymentMethod || agency.subscription?.paymentMethod || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${currentMonthPayment?.totalAmount ? Number(currentMonthPayment.totalAmount).toFixed(2) : planPrice.toFixed(2)} USD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedAgencyId(agency.id)
                              setIsDetailModalOpen(true)
                            }}
                          >
                            Ver Detalle
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditPayment(agency)}
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {agenciesData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={agenciesData.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isPaymentModalOpen && selectedRecord && (
        <PaymentRecordModal
          record={selectedRecord}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedRecord(null)
          }}
          onSave={(data) => {
            // Verificar si el registro existe y tiene ID válido
            const hasValidId = selectedRecord.id && typeof selectedRecord.id === 'string' && selectedRecord.id.length > 0
            if (hasValidId) {
              updateMutation.mutate({ id: String(selectedRecord.id), ...data })
            } else {
              createOrUpdateMutation.mutate(data)
            }
          }}
          isLoading={updateMutation.isPending || createOrUpdateMutation.isPending}
        />
      )}

      {isGenerateModalOpen && (
        <GenerateMonthModal
          onClose={() => setIsGenerateModalOpen(false)}
          onGenerate={(month, year) => {
            generateMutation.mutate({ month, year })
          }}
          isLoading={generateMutation.isPending}
        />
      )}

      {isDetailModalOpen && selectedAgencyId && (
        <AgencyPaymentDetailModal
          agencyId={selectedAgencyId}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedAgencyId(null)
          }}
        />
      )}
    </div>
  )
}

