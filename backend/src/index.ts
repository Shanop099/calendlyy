import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import eventTypesRouter from './routes/eventTypes';
import availabilityRouter from './routes/availability';
import meetingsRouter from './routes/meetings';
import publicRouter from './routes/public';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000,http://localhost:3002,http://localhost:3003'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string) {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return isLocalhost;
  } catch {
    return false;
  }
}

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/v1/event-types', eventTypesRouter);
app.use('/api/v1/availability', availabilityRouter);
app.use('/api/v1/meetings', meetingsRouter);
app.use('/api/v1/public', publicRouter);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 + error handlers (must come last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 API base: http://localhost:${PORT}/api/v1\n`);
});

export default app;
