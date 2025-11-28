/**
 * Formatea un número con separadores de miles usando comas
 * @param value - El número a formatear
 * @returns El número formateado con comas como separadores de miles
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  // Usar toLocaleString con configuración específica para usar comas
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Formatea un precio con separadores de miles
 * @param price - El precio a formatear
 * @param currency - La moneda (opcional)
 * @returns El precio formateado con comas
 */
export function formatPrice(price: number | string, currency?: string): string {
  const formatted = formatNumber(price)
  return currency ? `$${formatted} ${currency}` : `$${formatted}`
}

