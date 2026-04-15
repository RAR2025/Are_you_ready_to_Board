import cors from 'cors'
import express from 'express'
import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { firebaseAuth } from './lib/firebase-admin.js'
import { authenticate } from './middleware/authenticate.js'
import { authorize } from './middleware/authorize.js'
import { db } from './db/client.js'
import { organizations, users } from './db/schema.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173'

type FirebaseAuthErrorLike = {
  code?: string
  message?: string
}

type DatabaseErrorLike = {
  code?: string
  message?: string
}

function getOrgRegistrationErrorResponse(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { status: 500, error: 'Unable to register organization' }
  }

  const databaseError = error as DatabaseErrorLike

  if (databaseError.code === '42703' && databaseError.message?.includes('unique_org_id')) {
    return {
      status: 500,
      error: 'Database schema is out of date: missing organizations.unique_org_id. Run `npm run db:migrate --workspace @onboard/api` and restart the API.',
    }
  }

  const firebaseError = error as FirebaseAuthErrorLike

  switch (firebaseError.code) {
    case 'auth/email-already-exists':
      return { status: 409, error: 'Email already in use' }
    case 'auth/configuration-not-found':
      return {
        status: 503,
        error: 'Firebase Authentication is not enabled for this project. Enable Authentication and the Email/Password provider in the Firebase console.',
      }
    case 'auth/operation-not-allowed':
      return {
        status: 503,
        error: 'Email/Password sign-in is disabled for this Firebase project. Enable it in the Firebase console.',
      }
    case 'auth/project-not-found':
      return {
        status: 503,
        error: 'The Firebase service account does not match a valid Firebase project. Check the project ID and service account file.',
      }
    case 'auth/insufficient-permission':
      return {
        status: 500,
        error: 'The Firebase Admin service account does not have permission to create users. Use a service account with Firebase Auth admin access.',
      }
    case 'auth/invalid-credential':
      return {
        status: 500,
        error: 'The Firebase Admin credential is invalid. Re-check the service account JSON or project credential values.',
      }
    default:
      return { status: 500, error: firebaseError.message || 'Unable to register organization' }
  }
}

function generateUniqueOrgId(organizationName: string) {
  const nameFragment = organizationName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 8)

  const randomFragment = randomBytes(3).toString('hex').toUpperCase()

  return `${nameFragment || 'ORG'}-${randomFragment}`
}

app.use(
  cors({
    origin: webOrigin,
    credentials: true,
  }),
)
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    message: 'API is running',
    health: '/health'
  })
})

app.get('/health', (_req, res) => {
  const payload = {
    status: 'ok',
    service: 'api'
  } as const

  res.json(payload)
})

app.post('/api/org/register', async (req, res) => {
  const { organizationName, email, password } = req.body

  if (!organizationName || !email || !password) {
    return res.status(400).json({ error: 'organizationName, email, and password are required' })
  }

  try {
    const createdUser = await firebaseAuth.createUser({
      email,
      password,
    })

    const uniqueOrgId = generateUniqueOrgId(organizationName)

    const orgInsert = await db
      .insert(organizations)
      .values({
        name: organizationName,
        uniqueOrgId,
      })
      .returning({ id: organizations.id, uniqueOrgId: organizations.uniqueOrgId })
    const organizationId = orgInsert[0]?.id
    const createdUniqueOrgId = orgInsert[0]?.uniqueOrgId

    if (!organizationId || !createdUniqueOrgId) {
      await firebaseAuth.deleteUser(createdUser.uid)
      return res.status(500).json({ error: 'Unable to create organization' })
    }

    const userInsert = await db.insert(users).values({
      organizationId,
      email,
      firebaseUid: createdUser.uid,
      role: 'system_designer',
    }).returning({ id: users.id })

    const userId = userInsert[0]?.id

    if (!userId) {
      await firebaseAuth.deleteUser(createdUser.uid)
      await db.delete(organizations).where(eq(organizations.id, organizationId))
      return res.status(500).json({ error: 'Unable to create user record' })
    }

    return res.status(201).json({
      organizationId,
      uniqueOrgId: createdUniqueOrgId,
      userId,
      role: 'system_designer',
    })
  } catch (error: unknown) {
    console.error('Org registration error:', error)
    const failure = getOrgRegistrationErrorResponse(error)
    return res.status(failure.status).json({ error: failure.error })
  }
})

app.use(authenticate)

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.json(req.user)
})

app.get('/org/dashboard', authorize(['system_designer']), (req, res) => {
  res.json({ message: 'Welcome to the system designer dashboard', user: req.user })
});

app.get('/hr/dashboard', authorize(['hr']), (req, res) => {
  res.json({ message: 'Welcome to the HR dashboard', user: req.user });
});

app.get('/employee/dashboard', authorize(['employee']), (req, res) => {
  res.json({ message: 'Welcome to the employee dashboard', user: req.user });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})