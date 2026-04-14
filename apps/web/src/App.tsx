import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeLanding from './pages/HomeLanding'
import SignInPage from './features/auth/pages/SignInPage'
import SignUpPage from './features/auth/pages/SignUpPage'
import OrgHomePage from './features/auth/pages/OrgHomePage'
import HRHomePage from './features/auth/pages/HRHomePage'
import EmployeeHomePage from './features/auth/pages/EmployeeHomePage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import { useAuthStore } from './features/auth/store/authStore'

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLanding />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/org"
          element={
            <ProtectedRoute allowedRoles={['system_designer']}>
              <OrgHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HRHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
