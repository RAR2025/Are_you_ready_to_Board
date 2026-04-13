import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const apiRoot = path.resolve(currentDir, '..', '..')
config({ path: path.resolve(apiRoot, '.env'), override: true })

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/onboard_ai'
const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations')
const metaFolder = path.join(migrationsFolder, 'meta')
const journalFile = path.join(metaFolder, '_journal.json')

if (!fs.existsSync(metaFolder)) {
  fs.mkdirSync(metaFolder, { recursive: true })
}

if (!fs.existsSync(journalFile)) {
  fs.writeFileSync(journalFile, JSON.stringify({ version: '7', dialect: 'postgresql', entries: [] }, null, 2))
}

const pool = new Pool({ connectionString: databaseUrl })
const db = drizzle(pool)

try {
  await migrate(db, { migrationsFolder })
  console.log('Drizzle migrations completed successfully.')
} finally {
  await pool.end()
}
