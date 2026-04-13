import express from 'express'
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import type { ApiHealthResponse } from '@onboard/shared-types'

const app = express()
const port = Number(process.env.PORT ?? 4000)

// Middleware setup
app.use(authenticate)

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

app.get('/org/dashboard', authorize(['system_designer']), (req, res) => {
  res.json({ message: 'Welcome to the system designer dashboard', user: req.user });
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