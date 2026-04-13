import express from 'express'
import type { ApiHealthResponse } from '@onboard/shared-types'

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.get('/', (_req, res) => {
  res.json({
    message: 'API is running',
    health: '/health'
  })
})

app.get('/health', (_req, res) => {
  const payload: ApiHealthResponse = {
    status: 'ok',
    service: 'api'
  }

  res.json(payload)
})

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})