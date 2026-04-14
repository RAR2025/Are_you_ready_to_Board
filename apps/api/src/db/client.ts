import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema.js'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const apiRoot = path.resolve(currentDir, '..', '..')

config({ path: path.resolve(apiRoot, '.env'), override: true })

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/onboard_ai'
const pool = new Pool({ connectionString: databaseUrl })

export const db = drizzle(pool, { schema })
