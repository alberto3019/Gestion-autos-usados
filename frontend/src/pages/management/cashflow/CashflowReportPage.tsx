import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cashflowApi } from '../../../api/cashflow'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import { formatNumber } from '../../../utils/format'

export default function CashflowReportPage() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [showReport, setShowReport] = useState(false)

  const { data: report, isLoading } = useQuery({
    queryKey: ['cashflowReport', startDate, endDate],
    queryFn: () => cashflowApi.getCashflowReport({ startDate, endDate }),
    enabled: showReport,
  })

  const handleGenerateReport = () => {
    setShowReport(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reporte de Cashflow</h1>

      <div className="card max-w-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtrar por Período</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerateReport}>Generar Reporte</Button>
        </div>
      </div>

      {isLoading && showReport && <div className="text-center py-8">Cargando...</div>}

      {report && (
        <div className="space-y-6">
          {report.exchangeRate && (
            <div className="card bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tipo de cambio utilizado:</strong> 1 USD = {report.exchangeRate.usdToArs.toFixed(2)} ARS
                {report.exchangeRate.lastUpdated && (
                  <span className="ml-2 text-xs">
                    (Actualizado: {new Date(report.exchangeRate.lastUpdated).toLocaleDateString()})
                  </span>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Todos los valores están convertidos a ARS
              </p>
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(report.summary.totalIncome)} ARS
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(report.summary.totalExpenses)} ARS
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cashflow Neto</p>
                <p className={`text-2xl font-bold ${
                  report.summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatNumber(report.summary.netCashflow)} ARS
                </p>
              </div>
            </div>
          </div>

          {report.byCategory && report.byCategory.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Por Categoría</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Categoría</th>
                      <th className="px-4 py-2 text-right">Ingresos (ARS)</th>
                      <th className="px-4 py-2 text-right">Egresos (ARS)</th>
                      <th className="px-4 py-2 text-right">Neto (ARS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.byCategory.map((item: any) => (
                      <tr key={item.category}>
                        <td className="px-4 py-2">{item.categoryLabel || translateCategory(item.category)}</td>
                        <td className="px-4 py-2 text-right text-green-600">
                          {formatNumber(item.income)}
                        </td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {formatNumber(item.expense)}
                        </td>
                        <td className={`px-4 py-2 text-right font-semibold ${
                          item.net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatNumber(item.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

