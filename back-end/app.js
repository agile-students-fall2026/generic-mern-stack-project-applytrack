/*
 * The Express app: middleware, the static route and every API router.
 * Requests pass through the app.use() calls below from top to bottom.
 */
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { fileURLToPath } from 'node:url'
import { errorHandler, notFound } from './middleware/errors.js'
import { requireAuth } from './middleware/requireAuth.js'
import applicationsRouter from './routes/applications.js'
import authRouter from './routes/auth.js'
import eventsRouter from './routes/events.js'
import exportRouter from './routes/export.js'
import healthRouter from './routes/health.js'
import resumesRouter from './routes/resumes.js'
import statisticsRouter from './routes/statistics.js'
import usersRouter from './routes/users.js'

const app = express()

// Allow the React app to call this server from a different address (port 5173 by default).
app.use(cors({ origin: process.env.FRONT_END_URL || 'http://localhost:5173' }))

// Turn JSON request bodies into req.body.
app.use(express.json({ limit: '2mb' }))

// Print one line per request in the terminal ("GET /api/applications 200 4 ms"). Quiet during tests.
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// Static route: files in public/ are served as-is, e.g. public/images/logo.svg -> /static/images/logo.svg
app.use('/static', express.static(fileURLToPath(new URL('./public', import.meta.url))))

// Public routes: no login needed.
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)

// Private routes: requireAuth runs first and sets req.user to the logged-in user.
app.use('/api/users', requireAuth, usersRouter)
app.use('/api/applications', requireAuth, applicationsRouter)
app.use('/api/events', requireAuth, eventsRouter)
app.use('/api/statistics', requireAuth, statisticsRouter)
app.use('/api/export', requireAuth, exportRouter)
app.use('/api/resumes', requireAuth, resumesRouter)

// Anything that didn't match a route above, and any error thrown inside a route.
app.use(notFound)
app.use(errorHandler)

export default app
