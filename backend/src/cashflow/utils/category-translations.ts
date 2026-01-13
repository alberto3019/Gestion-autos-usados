import { TransactionCategory } from '@prisma/client';

export const categoryTranslations: Record<TransactionCategory, string> = {
  vehicle_purchase: 'Compra de Vehículo',
  vehicle_sale: 'Venta de Vehículo',
  service: 'Servicio',
  maintenance: 'Mantenimiento',
  payroll: 'Nómina',
  marketing: 'Marketing',
  other: 'Otro',
};

export function translateCategory(category: TransactionCategory): string {
  return categoryTranslations[category] || category;
}

