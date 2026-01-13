import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layout
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import RoleGuard from './components/common/RoleGuard'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Agency Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import MyVehiclesPage from './pages/vehicles/MyVehiclesPage'
import VehicleFormPage from './pages/vehicles/VehicleFormPage'
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage'
import SearchPage from './pages/search/SearchPage'
import FavoritesPage from './pages/favorites/FavoritesPage'
import ProfilePage from './pages/profile/ProfilePage'
import UsersManagementPage from './pages/users/UsersManagementPage'

// Admin Pages
import AdminActivitiesPage from './pages/admin/AdminActivitiesPage'
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage'
import AdminAgencyModulesPage from './pages/admin/AdminAgencyModulesPage'

// Management Pages
import StockPage from './pages/management/stock/StockPage'
import StockSettingsPage from './pages/management/stock/StockSettingsPage'
import InspectionsPage from './pages/management/inspections/InspectionsPage'
import InspectionFormPage from './pages/management/inspections/InspectionFormPage'
import InspectionDetailPage from './pages/management/inspections/InspectionDetailPage'
import ClientsPage from './pages/management/clients/ClientsPage'
import ClientFormPage from './pages/management/clients/ClientFormPage'
import ClientDetailPage from './pages/management/clients/ClientDetailPage'
import CashflowPage from './pages/management/cashflow/CashflowPage'
import CashflowFormPage from './pages/management/cashflow/CashflowFormPage'
import CashflowReportPage from './pages/management/cashflow/CashflowReportPage'
import SalesStatsPage from './pages/management/sales-stats/SalesStatsPage'
import SalesPage from './pages/management/sales/SalesPage'
import FinancingPage from './pages/management/financing/FinancingPage'
import FinancingFormPage from './pages/management/financing/FinancingFormPage'
import BalancesPage from './pages/management/balances/BalancesPage'
import VehicleBalanceFormPage from './pages/management/balances/VehicleBalanceFormPage'
import InvoicingPage from './pages/management/invoicing/InvoicingPage'
import AfipSettingsPage from './pages/management/invoicing/AfipSettingsPage'
import InvoiceFormPage from './pages/management/invoicing/InvoiceFormPage'
import MetricsPage from './pages/management/metrics/MetricsPage'

// User Permissions
import UserPermissionsPage from './pages/users/UserPermissionsPage'

// Guards
import ModuleGuard from './components/common/ModuleGuard'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPasswordPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Agency Routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vehicles" element={<MyVehiclesPage />} />
          <Route path="vehicles/new" element={<VehicleFormPage />} />
          <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Users Management - Solo para agency_admin */}
          <Route
            path="users"
            element={
              <RoleGuard roles={['agency_admin']}>
                <UsersManagementPage />
              </RoleGuard>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin/activities"
            element={
              <RoleGuard roles={['super_admin']}>
                <AdminActivitiesPage />
              </RoleGuard>
            }
          />
          <Route
            path="admin/agencies/:agencyId/subscription"
            element={
              <RoleGuard roles={['super_admin']}>
                <AdminSubscriptionsPage />
              </RoleGuard>
            }
          />
          <Route
            path="admin/agencies/:agencyId/modules"
            element={
              <RoleGuard roles={['super_admin']}>
                <AdminAgencyModulesPage />
              </RoleGuard>
            }
          />

          {/* Management Routes - Con ModuleGuard */}
          <Route
            path="management/stock"
            element={
              <ModuleGuard module="stock">
                <StockPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/stock/settings"
            element={
              <ModuleGuard module="stock">
                <StockSettingsPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/inspections"
            element={
              <ModuleGuard module="vehicle_inspection">
                <InspectionsPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/inspections/new"
            element={
              <ModuleGuard module="vehicle_inspection">
                <InspectionFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/inspections/:id"
            element={
              <ModuleGuard module="vehicle_inspection">
                <InspectionDetailPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/clients"
            element={
              <ModuleGuard module="clients">
                <ClientsPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/clients/new"
            element={
              <ModuleGuard module="clients">
                <ClientFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/clients/:id/edit"
            element={
              <ModuleGuard module="clients">
                <ClientFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/clients/:id"
            element={
              <ModuleGuard module="clients">
                <ClientDetailPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/cashflow"
            element={
              <ModuleGuard module="cashflow">
                <CashflowPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/cashflow/new"
            element={
              <ModuleGuard module="cashflow">
                <CashflowFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/cashflow/report"
            element={
              <ModuleGuard module="cashflow">
                <CashflowReportPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/sales-stats"
            element={
              <ModuleGuard module="statistics">
                <SalesStatsPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/sales-stats/new"
            element={
              <ModuleGuard module="statistics">
                <SalesPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/financing"
            element={
              <ModuleGuard module="financing_tracking">
                <FinancingPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/financing/new"
            element={
              <ModuleGuard module="financing_tracking">
                <FinancingFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/financing/:id/edit"
            element={
              <ModuleGuard module="financing_tracking">
                <FinancingFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/balances"
            element={
              <ModuleGuard module="balances">
                <BalancesPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/balances/vehicle/:vehicleId"
            element={
              <ModuleGuard module="balances">
                <VehicleBalanceFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/invoicing"
            element={
              <ModuleGuard module="invoicing_afip">
                <InvoicingPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/invoicing/settings"
            element={
              <ModuleGuard module="invoicing_afip">
                <AfipSettingsPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/invoicing/new"
            element={
              <ModuleGuard module="invoicing_afip">
                <InvoiceFormPage />
              </ModuleGuard>
            }
          />
          <Route
            path="management/metrics"
            element={
              <ModuleGuard module="metrics">
                <MetricsPage />
              </ModuleGuard>
            }
          />

          {/* User Permissions */}
          <Route
            path="users/:userId/permissions"
            element={
              <RoleGuard roles={['agency_admin']}>
                <UserPermissionsPage />
              </RoleGuard>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

