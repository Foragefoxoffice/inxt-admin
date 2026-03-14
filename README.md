# inxt-admin

Multi-country CMS Admin Panel with React frontend and Express backend, served under a single domain.

## Project Structure

```
inxt-admin/
├── backend/          # Express.js API server
│   ├── config/       # Database config
│   ├── controllers/  # Route handlers
│   ├── middleware/    # Auth & upload middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── server.js     # Entry point
├── frontend/         # React (Vite) SPA
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   └── pages/
│   └── vite.config.js
├── package.json      # Root scripts
└── .gitignore
```

## Setup

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

## Development

```bash
# Run both backend and frontend concurrently
npm run dev
```

- **Frontend:** http://localhost:3000 (Vite dev server with HMR)
- **Backend API:** http://localhost:5002
- Vite auto-proxies `/api/*` and `/uploads/*` to the backend

## Production

```bash
# Build frontend & start production server
npm run deploy
```

Or step-by-step:

```bash
# 1. Build the frontend
npm run build

# 2. Start the production server (serves both API + frontend)
npm start
```

In production, the Express server serves:
- `/api/*` → Backend API routes
- `/uploads/*` → Static uploaded files
- `/*` → Frontend SPA (from `frontend/dist/`)

Everything runs under a **single port** (default: `5006`).

## AI Chatbot & Knowledge Base

The system supports two AI providers:
- **Ollama (Default/Local)**: Runs locally on your server/machine.
- **OpenAI (Cloud)**: Uses the OpenAI API for embeddings and chat.

### Switching Providers
1. Edit `backend/.env` and change `AI_PROVIDER` to `openai` or `ollama`.
2. **IMPORTANT**: If you switch providers, you **MUST** use the "Reindex All" button in the Chatbot Management panel. OpenAI and Ollama use different vector dimensions; mixing them will break the search functionality.

## Environment Variables

Create `backend/.env`:

```env
PORT=5006
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# AI Provider: 'ollama' or 'openai'
AI_PROVIDER=openai

# OpenAI Config
OPENAI_API_KEY=your_key_here
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# Ollama Config
OLLAMA_HOST=127.0.0.1
OLLAMA_PORT=11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=tinyllama:latest
```
