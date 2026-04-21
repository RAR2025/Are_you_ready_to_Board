import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const apiRoot = path.resolve(currentDir, '..', '..')

config({ path: path.resolve(apiRoot, '.env'), override: true })

const projectId = process.env.FIREBASE_PROJECT_ID
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim()

type FirebaseServiceAccountFile = ServiceAccount & {
  project_id?: string
}

function failFirebaseConfig(message: string): never {
  throw new Error(`Firebase Admin SDK is not configured correctly: ${message}`)
}

function loadServiceAccount(filePath: string): FirebaseServiceAccountFile {
  if (!fs.existsSync(filePath)) {
    failFirebaseConfig(`Service account file was not found at "${filePath}". Update FIREBASE_SERVICE_ACCOUNT_PATH in apps/api/.env.`)
  }

  try {
    const rawServiceAccount = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(rawServiceAccount) as FirebaseServiceAccountFile
  } catch {
    failFirebaseConfig(`Service account file at "${filePath}" is not valid JSON.`)
  }
}

function createFirebaseCredential() {
  if (serviceAccountPath) {
    const resolvedPath = path.resolve(apiRoot, serviceAccountPath)
    const serviceAccount = loadServiceAccount(resolvedPath)

    if (!serviceAccount.project_id) {
      failFirebaseConfig(`Service account file at "${resolvedPath}" is missing project_id.`)
    }

    if (projectId && projectId !== serviceAccount.project_id) {
      failFirebaseConfig(
        `FIREBASE_PROJECT_ID (${projectId}) does not match the service account project_id (${serviceAccount.project_id}). Use credentials from the same Firebase project for both the API and web app.`,
      )
    }

    return cert(serviceAccount)
  }

  if (projectId && privateKey && clientEmail) {
    return cert({
      projectId,
      privateKey,
      clientEmail,
    })
  }

  failFirebaseConfig(
    'Set FIREBASE_SERVICE_ACCOUNT_PATH, or set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in apps/api/.env.',
  )
}

if (!getApps().length) {
  console.log('Firebase Admin SDK initializing...')
  initializeApp(
    storageBucket
      ? {
          credential: createFirebaseCredential(),
          storageBucket,
        }
      : {
          credential: createFirebaseCredential(),
        },
  )
  console.log(`Firebase Admin SDK initialized successfully for ${projectId ?? 'the configured Firebase project'}.`)
}

export const firebaseAuth = getAuth()
export const firebaseStorage = getStorage()

export function getFirebaseBucket() {
  if (!storageBucket) {
    throw new Error('Firebase Storage is not configured. Set FIREBASE_STORAGE_BUCKET in apps/api/.env and restart the API.')
  }

  return firebaseStorage.bucket(storageBucket)
}