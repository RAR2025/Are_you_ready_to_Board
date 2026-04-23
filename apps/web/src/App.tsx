import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeLanding from './pages/HomeLanding'
import SignInPage from './features/auth/pages/SignInPage'
import SignUpPage from './features/auth/pages/SignUpPage'
import HRHomePage from './features/auth/pages/HRHomePage'
import EmployeeHomePage from './features/auth/pages/EmployeeHomePage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import { useAuthStore } from './features/auth/store/authStore'
import OrgShell from './features/org/components/OrgShell'
import OrgDashboardPage from './features/org/pages/OrgDashboardPage'
import RepositoriesPage from './features/org/pages/RepositoriesPage'
import TechStackPage from './features/org/pages/TechStackPage'
import DocumentsPage from './features/org/pages/DocumentsPage'
import HRManagersPage from './features/org/pages/HRManagersPage'
import SSHKeysPage from './features/org/pages/SSHKeysPage'

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
              <OrgShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrgDashboardPage />} />
          <Route path="repositories" element={<RepositoriesPage />} />
          <Route path="tech-stack" element={<TechStackPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="hr-managers" element={<HRManagersPage />} />
          <Route path="ssh-keys" element={<SSHKeysPage />} />
        </Route>
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
