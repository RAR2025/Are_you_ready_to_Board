import { firebaseAuth } from '@/lib/firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export class ApiRequestError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

export async function fetchWithAuth(input: string, init: Record<string, unknown> = {}, idToken?: string) {
  const token = idToken ?? (await getIdToken())
  const headers = new Headers((init as { headers?: any }).headers ?? {})
  const body = (init as { body?: unknown }).body
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  if (!token) {
    throw new Error('Not authenticated')
  }

  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${input}`, {
      ...init,
      headers,
    })
  } catch {
    throw new Error(`Unable to reach API at ${API_BASE_URL}. Ensure the API server is running and accessible.`)
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message = errorBody?.message || errorBody?.error || response.statusText || 'Request failed'
    const code = typeof errorBody?.error === 'string' ? errorBody.error : undefined
    throw new ApiRequestError(message, response.status, code)
  }

  return response
}

function getIdToken() {
  const currentUser = firebaseAuth.currentUser
  if (!currentUser) {
    return null
  }

  return currentUser.getIdToken()
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`
}
