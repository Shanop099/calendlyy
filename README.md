# Calendly Clone (Full Stack)

A full-stack scheduling app inspired by Calendly.

- Frontend: Next.js 14 + React + TypeScript
- Backend: Express + TypeScript + Prisma
- Database: PostgreSQL

## Project Structure

- frontend: Next.js app (UI, dashboard, booking flow)
- backend: Express API, Prisma schema/migrations, seed script

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL running locally (or a reachable Postgres instance)

## Environment Setup

### 1) Backend env

Create backend/.env from backend/.env.example and fill values:

- DATABASE_URL
- PORT
- FRONTEND_URLS (comma-separated)
- Optional SMTP vars for email sending

### 2) Frontend env

Create frontend/.env from frontend/.env.example:

- NEXT_PUBLIC_API_BASE_URL

## Install Dependencies

Run in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Database Setup (Backend)

From the backend folder:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Run the App

### Start backend

```bash
cd backend
npm run dev
```

Backend default URL: http://localhost:3001

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend default URL: http://localhost:3000

## Available Scripts

### Backend

- npm run dev: start backend in development mode
- npm run build: compile TypeScript
- npm run start: run compiled backend
- npm run db:generate: generate Prisma client
- npm run db:migrate: run Prisma migrations
- npm run db:seed: seed sample data

### Frontend

- npm run dev: start Next.js dev server
- npm run build: create production build
- npm run start: run production server

## GitHub Publish Checklist

Before pushing publicly:

1. Ensure secrets are not committed:

- backend/.env
- frontend/.env

2. Keep only example env files committed:

- backend/.env.example
- frontend/.env.example

3. Confirm .gitignore is present at repo root and includes:

- node_modules
- build artifacts
- env files
- logs

4. If any real secrets were ever committed, rotate them:

- database credentials
- SMTP credentials

## Notes

- Deleting an event type is blocked only if it has upcoming active meetings.
- If deletion is allowed, related historical/cancelled meetings are cleaned up in a transaction before removing the event type.
