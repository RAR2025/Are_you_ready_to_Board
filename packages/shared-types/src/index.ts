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
  uniqueOrgId: string
  userId: number
  role: Role
}

export interface RepositoryRecord {
  id: number
  org_id: number
  github_url: string
  name: string
  is_private: boolean
  last_indexed_at: string | null
}

export interface OrgReposResponse {
  repositories: RepositoryRecord[]
  sshKeyConfigured: boolean
}

export interface OrgRepoMutationResponse {
  repository: RepositoryRecord
  sshKeyConfigured: boolean
}