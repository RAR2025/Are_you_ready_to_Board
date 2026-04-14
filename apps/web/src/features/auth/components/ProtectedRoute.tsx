import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '@shared-types'

interface ProtectedRouteProps {
  allowedRoles: Role[]
  children: ReactNode
}

function getRoleHome(role: Role) {
  switch (role) {
    case 'system_designer':
      return '/org'
    case 'hr':
      return '/hr'
    case 'employee':
      return '/employee'
    default:
      return '/signin'
  }
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { status, user } = useAuthStore((state) => ({ status: state.status, user: state.user }))

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/signin" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return <>{children}</>
}
