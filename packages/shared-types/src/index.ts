export interface ApiHealthResponse {
  status: 'ok' | 'error'
  service: 'api'
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
}