import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(currentDir, '.env'), override: true })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/onboard_ai'
  }
})
