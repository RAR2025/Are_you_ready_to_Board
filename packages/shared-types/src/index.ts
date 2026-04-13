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