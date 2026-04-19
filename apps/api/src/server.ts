import cors from 'cors'
import express from 'express'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { and, eq } from 'drizzle-orm'
import { firebaseAuth } from './lib/firebase-admin.js'
import { authenticate } from './middleware/authenticate.js'
import { authorize } from './middleware/authorize.js'
import { db } from './db/client.js'
import { organizations, repositories, users } from './db/schema.js'

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

type ParsedGitHubRepo = {
  owner: string
  repo: string
  normalizedUrl: string
}

type GithubRepoLookupResult = {
  name: string
  isPrivate: boolean
}

function parseGitHubRepoUrl(rawUrl: unknown): ParsedGitHubRepo | null {
  if (typeof rawUrl !== 'string') {
    return null
  }

  const trimmed = rawUrl.trim()

  if (!trimmed) {
    return null
  }

  const httpsMatch = trimmed.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i)

  if (httpsMatch?.[1] && httpsMatch?.[2]) {
    const owner = httpsMatch[1]
    const repo = httpsMatch[2]

    return {
      owner,
      repo,
      normalizedUrl: `https://github.com/${owner}/${repo}`,
    }
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i)

  if (sshMatch?.[1] && sshMatch?.[2]) {
    const owner = sshMatch[1]
    const repo = sshMatch[2]

    return {
      owner,
      repo,
      normalizedUrl: `https://github.com/${owner}/${repo}`,
    }
  }

  return null
}

async function fetchGitHubPublicRepo(owner: string, repo: string): Promise<GithubRepoLookupResult | null> {
  const encodedOwner = encodeURIComponent(owner)
  const encodedRepo = encodeURIComponent(repo)

  const response = await fetch(`https://api.github.com/repos/${encodedOwner}/${encodedRepo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'onboard-api',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to validate GitHub repository URL right now')
  }

  const payload = await response.json()

  if (typeof payload?.name !== 'string' || typeof payload?.private !== 'boolean') {
    throw new Error('GitHub validation response was malformed')
  }

  return {
    name: payload.name,
    isPrivate: payload.private,
  }
}

function isSshKeyConfigured() {
  const inlineKey = process.env.GITHUB_SSH_PRIVATE_KEY
  if (inlineKey && inlineKey.trim().length > 0) {
    return true
  }

  const keyPath = process.env.GITHUB_SSH_KEY_PATH
  if (keyPath && existsSync(keyPath)) {
    return true
  }

  return false
}

function toRepoResponse(repository: typeof repositories.$inferSelect) {
  return {
    id: repository.id,
    org_id: repository.organizationId,
    github_url: repository.githubUrl,
    name: repository.name,
    is_private: repository.isPrivate,
    last_indexed_at: repository.lastIndexedAt,
  }
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

app.get('/api/org/repos', authorize(['system_designer']), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const orgRepositories = await db.query.repositories.findMany({
      where: eq(repositories.organizationId, req.user.organizationId),
    })

    return res.json({
      repositories: orgRepositories.map(toRepoResponse),
      sshKeyConfigured: isSshKeyConfigured(),
    })
  } catch (error) {
    console.error('List repositories error:', error)
    return res.status(500).json({ error: 'Unable to list repositories' })
  }
})

app.post('/api/org/repos', authorize(['system_designer']), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const parsed = parseGitHubRepoUrl(req.body?.githubUrl)
  const providedName = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const requestedPrivate = Boolean(req.body?.isPrivate)

  if (!parsed) {
    return res.status(400).json({ error: 'A valid GitHub URL is required' })
  }

  try {
    let isPrivate = requestedPrivate
    let resolvedName = providedName

    if (!requestedPrivate) {
      const githubRepo = await fetchGitHubPublicRepo(parsed.owner, parsed.repo)

      if (!githubRepo) {
        return res.status(400).json({ error: 'GitHub repository is not reachable or does not exist' })
      }

      if (githubRepo.isPrivate) {
        return res.status(400).json({ error: 'Repository is private. Mark it as private before adding.' })
      }

      if (!resolvedName) {
        resolvedName = githubRepo.name
      }

      isPrivate = false
    }

    if (!resolvedName) {
      resolvedName = parsed.repo
    }

    const existingRepo = await db.query.repositories.findFirst({
      where: and(
        eq(repositories.organizationId, req.user.organizationId),
        eq(repositories.githubUrl, parsed.normalizedUrl),
      ),
    })

    if (existingRepo) {
      return res.status(409).json({ error: 'Repository already exists for this organization' })
    }

    const inserted = await db.insert(repositories).values({
      organizationId: req.user.organizationId,
      githubUrl: parsed.normalizedUrl,
      name: resolvedName,
      isPrivate,
      lastIndexedAt: null,
    }).returning()

    const createdRepo = inserted[0]

    if (!createdRepo) {
      return res.status(500).json({ error: 'Unable to create repository' })
    }

    return res.status(201).json({
      repository: toRepoResponse(createdRepo),
      sshKeyConfigured: isSshKeyConfigured(),
    })
  } catch (error) {
    console.error('Create repository error:', error)
    const message = error instanceof Error ? error.message : 'Unable to add repository'
    return res.status(500).json({ error: message })
  }
})

app.delete('/api/org/repos/:id', authorize(['system_designer']), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const repositoryId = Number(req.params.id)

  if (!Number.isInteger(repositoryId) || repositoryId <= 0) {
    return res.status(400).json({ error: 'A valid repository id is required' })
  }

  try {
    const deleted = await db.delete(repositories).where(and(
      eq(repositories.id, repositoryId),
      eq(repositories.organizationId, req.user.organizationId),
    )).returning({ id: repositories.id })

    if (!deleted[0]) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    return res.json({ id: deleted[0].id })
  } catch (error) {
    console.error('Delete repository error:', error)
    return res.status(500).json({ error: 'Unable to delete repository' })
  }
})

app.post('/api/org/repos/:id/sync', authorize(['system_designer']), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const repositoryId = Number(req.params.id)

  if (!Number.isInteger(repositoryId) || repositoryId <= 0) {
    return res.status(400).json({ error: 'A valid repository id is required' })
  }

  try {
    const repository = await db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, repositoryId),
        eq(repositories.organizationId, req.user.organizationId),
      ),
    })

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    const sshKeyConfigured = isSshKeyConfigured()

    if (repository.isPrivate && !sshKeyConfigured) {
      return res.status(409).json({
        error: 'Add an SSH key first to index private repos',
        sshKeyConfigured,
      })
    }

    const updated = await db.update(repositories).set({
      lastIndexedAt: new Date(),
    }).where(and(
      eq(repositories.id, repository.id),
      eq(repositories.organizationId, req.user.organizationId),
    )).returning()

    const syncedRepo = updated[0]

    if (!syncedRepo) {
      return res.status(500).json({ error: 'Unable to update repository sync status' })
    }

    return res.json({
      repository: toRepoResponse(syncedRepo),
      sshKeyConfigured,
      status: 'synced',
    })
  } catch (error) {
    console.error('Sync repository error:', error)
    return res.status(500).json({ error: 'Unable to sync repository' })
  }
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