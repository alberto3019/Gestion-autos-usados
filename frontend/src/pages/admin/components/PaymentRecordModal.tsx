import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import dayjs from 'dayjs'

const PLAN_PRICES = {
  basic: 30,
  premium: 70,
  enterprise: 100,
}

interface PaymentRecordModalProps {
  record: any
  onClose: () => void
  onSave: (data: any) => void
  isLoading: boolean
}

export default function PaymentRecordModal({ record, onClose, onSave, isLoading }: PaymentRecordModalProps) {
  const [formData, setFormData] = useState({
    extraAmount: record?.extraAmount || 0,
    paymentMethod: record?.paymentMethod || record?.agency?.subscription?.paymentMethod || '',
    isPaid: record?.isPaid || false,
    paidAt: record?.paidAt ? dayjs(record.paidAt).format('YYYY-MM-DD') : '',
    notes: record?.notes || '',
  })

  const baseAmount = record?.amount || PLAN_PRICES[record?.agency?.subscription?.plan as keyof typeof PLAN_PRICES] || 0
  const totalAmount = baseAmount + (formData.extraAmount || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      agencyId: record.agencyId || record.agency?.id,
      year: record.year || dayjs().year(),
      month: record.month || dayjs().month() + 1,
      extraAmount: parseFloat(formData.extraAmount.toString()) || 0,
      paymentMethod: formData.paymentMethod || undefined,
      isPaid: formData.isPaid,
      paidAt: formData.isPaid && formData.paidAt ? formData.paidAt : undefined,
      notes: formData.notes || undefined,
    }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {record.id ? 'Editar Pago' : 'Crear Registro de Pago'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Agency Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Agencia</h3>
            <p className="text-gray-700">{record.agency?.commercialName || record.agency?.businessName}</p>
            <p className="text-sm text-gray-500">{record.agency?.email}</p>
          </div>

          {/* Base Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Base (Plan {record.agency?.subscription?.plan || 'N/A'})
            </label>
            <Input
              type="number"
              value={baseAmount.toFixed(2)}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* Extra Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cobros Extras (USD)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.extraAmount}
              onChange={(e) => setFormData({ ...formData, extraAmount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          {/* Total Amount */}
          <div className="bg-primary-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total a Pagar
            </label>
            <p className="text-2xl font-bold text-primary-600">
              ${totalAmount.toFixed(2)} USD
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <Input
              type="text"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="Ej: Transferencia, Tarjeta, Mercado Pago, etc."
            />
          </div>

          {/* Is Paid */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPaid"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isPaid" className="ml-2 block text-sm font-medium text-gray-700">
              Marcado como Pagado
            </label>
          </div>

          {/* Paid Date */}
          {formData.isPaid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago
              </label>
              <Input
                type="date"
                value={formData.paidAt || dayjs().format('YYYY-MM-DD')}
                onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

