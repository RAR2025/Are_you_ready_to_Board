import { firebaseAuth } from '@/lib/firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export async function fetchWithAuth(input: string, init: Record<string, unknown> = {}) {
  const token = await getIdToken()
  const headers = new Headers((init as { headers?: any }).headers ?? {})

  if (!token) {
    throw new Error('Not authenticated')
  }

  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type')) {
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
    const message = errorBody?.error || response.statusText || 'Request failed'
    throw new Error(message)
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
