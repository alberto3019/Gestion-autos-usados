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
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

