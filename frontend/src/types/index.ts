export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'super_admin' | 'agency_admin' | 'agency_user'
  agency: Agency | null
  commissionPercentage?: number | null
}

export interface Agency {
  id: string
  businessName: string
  commercialName: string
  taxId: string
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressCountry: string
  phone?: string
  whatsapp: string
  email: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  logoUrl?: string
  status: 'pending' | 'active' | 'blocked'
  vehicleCount?: number
  userCount?: number
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise' | null
  subscriptionActive?: boolean
  createdAt?: string
}

export interface Vehicle {
  id: string
  agencyId: string
  brand: string
  model: string
  version?: string
  year: number
  kilometers: number
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other'
  transmission: 'manual' | 'automatic' | 'cvt' | 'other'
  color?: string
  licensePlate?: string
  hideLicensePlate: boolean
  price: number
  currency: 'ARS' | 'USD' | 'EUR'
  condition: 'new' | 'used'
  status: 'available' | 'reserved' | 'sold' | 'paused'
  locationCity?: string
  locationState?: string
  internalNotes?: string
  publicNotes?: string
  createdAt: string
  updatedAt: string
  photos: VehiclePhoto[]
  agency?: Agency
  isFavorite?: boolean
  isOwn?: boolean
}

export interface VehiclePhoto {
  id: string
  vehicleId: string
  url: string
  order: number
  isPrimary: boolean
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  vehicleId: string
  createdAt: string
  vehicle: Vehicle
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface AdminStats {
  agencies: {
    total: number
    active: number
    pending: number
    blocked: number
  }
  vehicles: {
    total: number
    available: number
    reserved: number
    sold: number
  }
  whatsappClicks: {
    total: number
    lastMonth: number
  }
}

export interface SearchFilters {
  search?: string // Búsqueda general
  brand?: string
  model?: string
  version?: string
  color?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  kilometersMax?: number
  fuelType?: string
  transmission?: string
  locationState?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise'

export type ManagementModule =
  | 'stock'
  | 'vehicle_inspection'
  | 'clients'
  | 'cashflow'
  | 'statistics'
  | 'financing_tracking'
  | 'balances'
  | 'invoicing_afip'
  | 'metrics'
  | 'sales_platforms'

export interface Subscription {
  id: string
  agencyId: string
  plan: SubscriptionPlan
  isActive: boolean
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  enabledModules?: AgencyModule[]
}

export interface AgencyModule {
  id: string
  agencyId: string
  module: ManagementModule
  isEnabled: boolean
  enabledBy?: string
  enabledAt?: string
  createdAt: string
}

export interface UserModulePermission {
  id: string
  userId: string
  module: ManagementModule
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  createdAt: string
  updatedAt: string
}

export interface StockSettings {
  stockYellowDays: number
  stockRedDays: number
}

export interface VehicleStockStatus {
  vehicleId: string
  daysInStock: number
  status: 'green' | 'yellow' | 'red'
  vehicle: Vehicle
}

import type { InspectionData } from '../pages/management/inspections/utils/inspectionDataSchema'

export interface VehicleInspection {
  id: string
  vehicleId: string
  agencyId: string
  inspectorName: string
  inspectionDate: string
  observations?: string
  status: string
  data: InspectionData | Record<string, any>
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  vehicle?: Vehicle
}

export interface Client {
  id: string
  agencyId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  documentType?: string
  documentNumber?: string
  address?: string
  notes?: string
  currentVehicleId?: string
  desiredVehicleId?: string
  alertEnabled: boolean
  alertDays?: number
  createdAt: string
  updatedAt: string
  currentVehicle?: Vehicle
  desiredVehicle?: Vehicle
  sales?: Sale[]
  financings?: Financing[]
}

export interface CashflowTransaction {
  id: string
  agencyId: string
  type: 'income' | 'expense'
  category:
    | 'vehicle_purchase'
    | 'vehicle_sale'
    | 'service'
    | 'maintenance'
    | 'payroll'
    | 'marketing'
    | 'other'
  amount: number
  currency: 'ARS' | 'USD' | 'EUR'
  description?: string
  date: string
  vehicleId?: string
  createdAt: string
  updatedAt: string
  vehicle?: Vehicle
}

export interface Sale {
  id: string
  agencyId: string
  vehicleId: string
  sellerId: string
  clientId?: string
  salePrice: number
  commission?: number
  saleDate: string
  notes?: string
  createdAt: string
  vehicle?: Vehicle
  seller?: User
  client?: Client
}

export interface Financing {
  id: string
  agencyId: string
  vehicleId: string
  clientId?: string
  financier: string
  amount: number
  installments: number
  interestRate?: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  applicationDate: string
  approvalDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  vehicle?: Vehicle
  client?: Client
}

export interface VehicleBalance {
  id: string
  vehicleId: string
  purchasePrice: number
  purchaseCurrency?: 'ARS' | 'USD' | 'EUR'
  purchaseExchangeRate?: number
  investment: number
  investmentCurrency?: 'ARS' | 'USD' | 'EUR'
  investmentExchangeRate?: number
  salePrice?: number
  saleCurrency?: 'ARS' | 'USD' | 'EUR'
  saleExchangeRate?: number
  profit?: number
  profitMargin?: number
  createdAt: string
  updatedAt: string
  vehicle?: Vehicle
}

export interface Invoice {
  id: string
  agencyId: string
  type: 'A' | 'B' | 'C'
  pointOfSale: number
  invoiceNumber: number
  cae?: string
  caeExpirationDate?: string
  clientName: string
  clientTaxId: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  issueDate?: string
  dueDate?: string
  notes?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
  subtotal: number
  taxes: number
  total: number
  currency: 'ARS' | 'USD' | 'EUR'
  status: 'draft' | 'sent' | 'cancelled'
  vehicleId?: string
  createdAt: string
  updatedAt: string
  vehicle?: Vehicle
}

export interface Metrics {
  period: {
    startDate?: string
    endDate?: string
  }
  filters: {
    vehicleId?: string
    sellerId?: string
  }
  vehicles: {
    total: number
    byStatus: Record<string, number>
  }
  sales: {
    total: number
    revenue: number
    commission: number
    averageSalePrice: number
  }
  cashflow: {
    income: number
    expenses: number
    net: number
  }
  clients: {
    total: number
    withAlerts: number
  }
  financing: {
    total: number
    byStatus: Record<string, number>
  }
  balances: {
    totalPurchasePrice: number
    totalInvestment: number
    totalSalePrice: number
    totalProfit: number
    totalCost: number
  }
}

