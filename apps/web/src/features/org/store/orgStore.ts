import { create } from 'zustand'
import type {
  DocumentRecord,
  OrgSshKeyMutationResponse,
  OrgSshKeysResponse,
  OrgDocumentMutationResponse,
  OrgDocumentsResponse,
  OrgHrManagersResponse,
  OrgReposResponse,
  OrgTechStackMutationResponse,
  OrgTechStackResponse,
  SshKeyRecord,
  TechStackRecord,
} from '@shared-types'
import { fetchWithAuth } from '@/lib/api'

type OrgStoreStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UploadDocumentPayload {
  file: File
  title?: string
  content?: string
}

interface OrgState {
  status: OrgStoreStatus
  error: string | null
  repositoriesCount: number
  techStackCount: number
  documentsCount: number
  hrManagersCount: number
  sshKeysCount: number
  techStackItems: TechStackRecord[]
  documents: DocumentRecord[]
  sshKeys: SshKeyRecord[]
  loadDashboardData: () => Promise<void>
  refreshRepositoriesCount: () => Promise<void>
  loadSSHKeys: () => Promise<void>
  addSSHKey: (label: string, publicKey: string) => Promise<SshKeyRecord>
  deleteSSHKey: (id: number) => Promise<void>
  loadTechStack: () => Promise<void>
  addTechStackItem: (name: string, description?: string) => Promise<void>
  deleteTechStackItem: (id: number) => Promise<void>
  loadDocuments: () => Promise<void>
  uploadDocument: (payload: UploadDocumentPayload) => Promise<void>
  deleteDocument: (id: number) => Promise<void>
}

export const useOrgStore = create<OrgState>((set, get) => ({
  status: 'idle',
  error: null,
  repositoriesCount: 0,
  techStackCount: 0,
  documentsCount: 0,
  hrManagersCount: 0,
  sshKeysCount: 0,
  techStackItems: [],
  documents: [],
  sshKeys: [],

  loadDashboardData: async () => {
    set({ status: 'loading', error: null })

    try {
      const [reposResponse, techResponse, docsResponse, hrResponse, sshKeysResponse] = await Promise.all([
        fetchWithAuth('/api/org/repos'),
        fetchWithAuth('/api/org/techstack'),
        fetchWithAuth('/api/org/documents'),
        fetchWithAuth('/api/org/hr'),
        fetchWithAuth('/api/org/ssh-keys'),
      ])

      const reposPayload = (await reposResponse.json()) as OrgReposResponse
      const techPayload = (await techResponse.json()) as OrgTechStackResponse
      const docsPayload = (await docsResponse.json()) as OrgDocumentsResponse
      const hrPayload = (await hrResponse.json()) as OrgHrManagersResponse
      const sshKeysPayload = (await sshKeysResponse.json()) as OrgSshKeysResponse

      set({
        status: 'ready',
        repositoriesCount: reposPayload.repositories.length,
        techStackCount: techPayload.items.length,
        documentsCount: docsPayload.documents.length,
        hrManagersCount: hrPayload.managers.length,
        sshKeysCount: sshKeysPayload.keys.length,
        techStackItems: techPayload.items,
        documents: docsPayload.documents,
        sshKeys: sshKeysPayload.keys,
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to load org dashboard data',
      })
    }
  },

  refreshRepositoriesCount: async () => {
    try {
      const response = await fetchWithAuth('/api/org/repos')
      const payload = (await response.json()) as OrgReposResponse
      set({ repositoriesCount: payload.repositories.length, error: null })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to refresh repositories count' })
    }
  },

  loadSSHKeys: async () => {
    set({ status: 'loading', error: null })

    try {
      const response = await fetchWithAuth('/api/org/ssh-keys')
      const payload = (await response.json()) as OrgSshKeysResponse

      set({
        status: 'ready',
        sshKeys: payload.keys,
        sshKeysCount: payload.keys.length,
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to load SSH keys',
      })
      throw error
    }
  },

  addSSHKey: async (label: string, publicKey: string) => {
    const trimmedLabel = label.trim()
    const trimmedPublicKey = publicKey.trim()

    if (!trimmedLabel || !trimmedPublicKey) {
      throw new Error('Label and public key are required')
    }

    const response = await fetchWithAuth('/api/org/ssh-keys', {
      method: 'POST',
      body: JSON.stringify({
        label: trimmedLabel,
        public_key: trimmedPublicKey,
      }),
    })

    const payload = (await response.json()) as OrgSshKeyMutationResponse
    const nextKeys = [payload.key, ...get().sshKeys]

    set({
      sshKeys: nextKeys,
      sshKeysCount: nextKeys.length,
      error: null,
    })

    return payload.key
  },

  deleteSSHKey: async (id: number) => {
    await fetchWithAuth(`/api/org/ssh-keys/${id}`, {
      method: 'DELETE',
    })

    const nextKeys = get().sshKeys.filter((key) => key.id !== id)

    set({
      sshKeys: nextKeys,
      sshKeysCount: nextKeys.length,
      error: null,
    })
  },

  loadTechStack: async () => {
    set({ status: 'loading', error: null })

    try {
      const response = await fetchWithAuth('/api/org/techstack')
      const payload = (await response.json()) as OrgTechStackResponse

      set({
        status: 'ready',
        techStackItems: payload.items,
        techStackCount: payload.items.length,
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to load tech stack',
      })
    }
  },

  addTechStackItem: async (name: string, description = '') => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      set({ error: 'Technology name is required' })
      return
    }

    try {
      const response = await fetchWithAuth('/api/org/techstack', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
        }),
      })
      const payload = (await response.json()) as OrgTechStackMutationResponse
      const nextItems = [payload.item, ...get().techStackItems]

      set({
        techStackItems: nextItems,
        techStackCount: nextItems.length,
        error: null,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to add tech stack entry' })
      throw error
    }
  },

  deleteTechStackItem: async (id: number) => {
    try {
      await fetchWithAuth(`/api/org/techstack/${id}`, {
        method: 'DELETE',
      })

      const nextItems = get().techStackItems.filter((item) => item.id !== id)

      set({
        techStackItems: nextItems,
        techStackCount: nextItems.length,
        error: null,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete tech stack entry' })
      throw error
    }
  },

  loadDocuments: async () => {
    set({ status: 'loading', error: null })

    try {
      const response = await fetchWithAuth('/api/org/documents')
      const payload = (await response.json()) as OrgDocumentsResponse

      set({
        status: 'ready',
        documents: payload.documents,
        documentsCount: payload.documents.length,
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to load documents',
      })
    }
  },

  uploadDocument: async (payload: UploadDocumentPayload) => {
    const formData = new FormData()
    formData.append('file', payload.file)

    if (payload.title?.trim()) {
      formData.append('title', payload.title.trim())
    }

    if (payload.content?.trim()) {
      formData.append('content', payload.content.trim())
    }

    try {
      const response = await fetchWithAuth('/api/org/documents', {
        method: 'POST',
        body: formData,
      })
      const created = (await response.json()) as OrgDocumentMutationResponse
      const nextDocuments = [created.document, ...get().documents]

      set({
        documents: nextDocuments,
        documentsCount: nextDocuments.length,
        error: null,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to upload document' })
      throw error
    }
  },

  deleteDocument: async (id: number) => {
    try {
      await fetchWithAuth(`/api/org/documents/${id}`, {
        method: 'DELETE',
      })

      const nextDocuments = get().documents.filter((document) => document.id !== id)

      set({
        documents: nextDocuments,
        documentsCount: nextDocuments.length,
        error: null,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete document' })
      throw error
    }
  },
}))
