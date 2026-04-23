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
  status?: 'queued' | 'synced'
  jobId?: string
}

export interface SshKeyRecord {
  id: number
  label: string
  fingerprint: string
  created_at: string
}

export interface OrgSshKeysResponse {
  keys: SshKeyRecord[]
}

export interface OrgSshKeyMutationResponse {
  key: SshKeyRecord
}

export interface CreateOrgSshKeyRequest {
  label: string
  public_key: string
}

export interface ApiErrorResponse {
  error: string
  message?: string
}

export interface TechStackRecord {
  id: number
  org_id: number
  name: string
  description: string
  created_at: string
}

export interface OrgTechStackResponse {
  items: TechStackRecord[]
}

export interface CreateTechStackRequest {
  name: string
  description?: string
}

export interface OrgTechStackMutationResponse {
  item: TechStackRecord
}

export interface DocumentRecord {
  id: number
  org_id: number
  title: string
  content: string
  file_url: string
  file_type: string
  original_name: string
  storage_path: string
  uploaded_at: string
}

export interface OrgDocumentsResponse {
  documents: DocumentRecord[]
}

export interface OrgDocumentMutationResponse {
  document: DocumentRecord
}

export interface HrManagerRecord {
  id: number
  email: string
}

export interface OrgHrManagersResponse {
  managers: HrManagerRecord[]
}