export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'super_admin' | 'agency_admin' | 'agency_user'
  agency: Agency | null
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

