export const categoryTranslations: Record<string, string> = {
  vehicle_purchase: 'Compra de Vehículo',
  vehicle_sale: 'Venta de Vehículo',
  service: 'Servicio',
  maintenance: 'Mantenimiento',
  payroll: 'Nómina',
  marketing: 'Marketing',
  other: 'Otro',
};

export function translateCategory(category: string): string {
  return categoryTranslations[category] || category;
}

