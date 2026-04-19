import { signInWithEmailAndPassword, signOut as firebaseSignOut, type UserCredential } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { apiUrl } from '@/lib/api'
import type { AuthUser, OrgRegisterPayload, RegisterOrganizationResponse } from '../types/auth'

export async function signInUser(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function signOutUser() {
  await firebaseSignOut(firebaseAuth)
}

export async function fetchAuthMe(idToken?: string): Promise<AuthUser> {
  const token = idToken ?? (await firebaseAuth.currentUser?.getIdToken())

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(apiUrl('/api/auth/me'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.error || response.statusText || 'Request failed')
  }

  return response.json() as Promise<AuthUser>
}

export async function registerOrganization(payload: OrgRegisterPayload): Promise<RegisterOrganizationResponse> {
  const response = await fetch(apiUrl('/api/org/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.error || response.statusText || 'Unable to register organization')
  }

  return response.json() as Promise<RegisterOrganizationResponse>
}
