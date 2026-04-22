# AI Service Console

Nuxt UI for testing Task 1 backend APIs.

## Prerequisites

- Node.js 22+
- Backend service running (default: `http://127.0.0.1:8000`)

## Setup

Install dependencies:

```bash
npm install
```

Create local env file:

```bash
cp .env.example .env
```

Set backend base URL in `.env`:

```env
BACKEND_BASE_URL=http://127.0.0.1:8000
```

## Run

Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Integration

The browser talks to Nuxt server routes, and Nuxt proxies requests to backend:

- `POST /api/ai/execute` -> `POST /internal/ai/execute`
- `GET /api/ai/provider` -> `GET /internal/ai/provider`

This avoids browser CORS issues on direct cross-origin calls.
