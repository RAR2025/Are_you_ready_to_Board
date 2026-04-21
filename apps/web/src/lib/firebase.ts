import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase environment configuration. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID in apps/web/.env.local. The project ID must match the backend Firebase project.')
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

let firebaseAnalytics: Analytics | undefined

if (firebaseConfig.measurementId && typeof window !== 'undefined') {
  void isSupported().then((supported) => {
    if (supported) {
      firebaseAnalytics = getAnalytics(app)
    }
  })
}

export const firebaseAuth = getAuth(app)
export const firebaseStorage = getStorage(app)
export { firebaseAnalytics }
