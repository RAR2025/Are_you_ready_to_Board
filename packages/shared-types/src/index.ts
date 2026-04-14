export interface ApiHealthResponse {
  status: 'ok' | 'error'
  service: 'api'
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
}

export type Role = 'system_designer' | 'hr' | 'employee'

export interface AuthMeResponse {
  uid: string
  email: string
  role: Role
  organizationId: number
  userId: number
}

export interface OrgRegisterRequest {
  organizationName: string
  email: string
  password: string
}

export interface OrgRegisterResponse {
  organizationId: number
  userId: number
  role: Role
}