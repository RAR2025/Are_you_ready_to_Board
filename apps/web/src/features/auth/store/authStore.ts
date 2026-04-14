import { create } from 'zustand'
import { firebaseAuth } from '@/lib/firebase'
import type { AuthUser, OrgRegisterPayload, RegisterOrganizationResponse } from '../types/auth'
import { fetchAuthMe, registerOrganization, signInUser, signOutUser } from '../services/authService'

interface AuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  user: AuthUser | null
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
  registerOrg: (payload: OrgRegisterPayload) => Promise<RegisterOrganizationResponse>
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  error: null,
  signIn: async (email, password) => {
    set({ status: 'loading', error: null })

    try {
      await signInUser(email, password)
      const user = await fetchAuthMe()
      set({ status: 'authenticated', user, error: null })
      return user
    } catch (error) {
      if (error instanceof Error) {
        set({ status: 'unauthenticated', user: null, error: error.message })
      } else {
        set({ status: 'unauthenticated', user: null, error: 'Unable to sign in' })
      }
      throw error
    }
  },
  signOut: async () => {
    set({ status: 'loading', error: null })
    await signOutUser()
    set({ status: 'unauthenticated', user: null, error: null })
  },
  initializeAuth: async () => {
    set({ status: 'loading', error: null })

    if (firebaseAuth.currentUser) {
      try {
        const user = await fetchAuthMe()
        set({ status: 'authenticated', user, error: null })
      } catch {
        set({ status: 'unauthenticated', user: null, error: null })
      }
    } else {
      set({ status: 'unauthenticated', user: null, error: null })
    }
  },
  registerOrg: async (payload) => {
    set({ status: 'loading', error: null })

    try {
      const response = await registerOrganization(payload)
      set({ status: 'unauthenticated', user: null, error: null })
      return response
    } catch (error) {
      if (error instanceof Error) {
        set({ status: 'unauthenticated', user: null, error: error.message })
      } else {
        set({ status: 'unauthenticated', user: null, error: 'Unable to register organization' })
      }
      throw error
    }
  },
}))
