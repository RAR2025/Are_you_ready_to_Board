import cors from 'cors'
import express from 'express'
import { eq } from 'drizzle-orm'
import { firebaseAuth } from './lib/firebase-admin.js'
import { authenticate } from './middleware/authenticate.js'
import { authorize } from './middleware/authorize.js'
import { db } from './db/client.js'
import { organizations, users } from './db/schema.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(cors())
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

    const orgInsert = await db.insert(organizations).values({ name: organizationName }).returning({ id: organizations.id })
    const organizationId = orgInsert[0]?.id

    if (!organizationId) {
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
      userId,
      role: 'system_designer',
    })
  } catch (error: unknown) {
    console.error('Org registration error:', error)

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'auth/email-already-exists'
    ) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    return res.status(500).json({ error: 'Unable to register organization' })
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