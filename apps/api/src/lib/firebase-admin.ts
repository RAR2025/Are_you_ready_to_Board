import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const apiRoot = path.resolve(currentDir, '..', '..')

config({ path: path.resolve(apiRoot, '.env'), override: true })

const projectId = process.env.FIREBASE_PROJECT_ID
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

console.log('Firebase Admin SDK initializing...')

if (!getApps().length) {
  if (serviceAccountPath) {
    const resolvedPath = path.resolve(apiRoot, serviceAccountPath)
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'))
    initializeApp({ credential: cert(serviceAccount) })
    console.log('Firebase Admin SDK initialized successfully.');
  } else if (projectId && privateKey && clientEmail) {
    initializeApp({
      credential: cert({
        projectId,
        privateKey,
        clientEmail
      })
    })
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    console.log('Firebase Admin SDK already initialized.');
    throw new Error(
      'Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL.'
    )
  }
}

console.log('Firebase Admin SDK initialized successfully.');

export const firebaseAuth = getAuth()