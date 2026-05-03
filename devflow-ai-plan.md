# DevFlow AI – Implementation Plan

## Context

Building a production-level full-stack MERN app that lets developers generate system design diagrams, DevOps pipelines, chat with an AI assistant, and analyze code architecture. All dependencies are local to the project (no global installs). AI provider: **Groq** (free tier, LLaMA 3.3 70B — best long-term free option). MongoDB: Atlas cloud. Auth: JWT.

---

## Folder Structure

```
devflow-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── systemDesignController.js
│   │   │   ├── devopsController.js
│   │   │   ├── chatController.js
│   │   │   └── codeAnalyzerController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verify
│   │   │   └── errorHandler.js        # Central error handler
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── History.js             # Save AI results per user
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── systemDesignRoutes.js
│   │   │   ├── devopsRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── codeAnalyzerRoutes.js
│   │   ├── services/
│   │   │   ├── aiService.js           # Groq API wrapper
│   │   │   └── promptTemplates.js     # All prompt templates
│   │   └── app.js                     # Express app setup
│   ├── .env.example
│   ├── package.json
│   └── server.js                      # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js           # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── common/
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   ├── SystemDesign/
│   │   │   │   ├── PromptInput.jsx
│   │   │   │   └── DiagramOutput.jsx  # Mermaid renderer
│   │   │   ├── DevOps/
│   │   │   │   └── PipelineOutput.jsx # Code block display
│   │   │   ├── Chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   └── MessageBubble.jsx
│   │   │   └── CodeAnalyzer/
│   │   │       └── AnalysisOutput.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── SystemDesign.jsx
│   │   │   ├── DevOps.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── CodeAnalyzer.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT token + user state
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── App.jsx                    # Router + protected routes
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
└── .gitignore
```

---

## Implementation Phases

### Phase 1 — Project Scaffolding
- Create `devflow-ai/backend/` and `devflow-ai/frontend/` directories
- Backend: `npm init -y` → install all deps locally
  - `express cors dotenv mongoose bcryptjs jsonwebtoken groq-sdk express-validator`
  - Dev: `nodemon`
- Frontend: `npm create vite@latest frontend -- --template react` → install locally
  - `axios react-router-dom mermaid`
  - Dev: `tailwindcss @tailwindcss/vite`
- Configure `tailwind.config.js` and `vite.config.js`
- Create `.env.example` files for both backend and frontend

### Phase 2 — Backend Core
**Files:** `backend/src/app.js`, `backend/server.js`, `backend/src/config/db.js`
- Express app with `cors`, `express.json()`, rate limiting via express middleware
- MongoDB Atlas connection with retry logic in `db.js`
- Central error handler in `middleware/errorHandler.js`
- `server.js` starts on `PORT` from env

### Phase 3 — Auth (JWT)
**Files:** `models/User.js`, `controllers/authController.js`, `routes/authRoutes.js`, `middleware/authMiddleware.js`
- `User` model: `name, email, password (hashed), createdAt`
- `POST /api/auth/register` → bcrypt hash → save → return JWT
- `POST /api/auth/login` → compare hash → return JWT
- `authMiddleware.js` → verify JWT → attach `req.user`
- Token stored in `localStorage` on frontend, sent as `Authorization: Bearer <token>`

### Phase 4 — AI Service Layer
**Files:** `services/aiService.js`, `services/promptTemplates.js`
- `aiService.js`: single `callGroq(prompt, systemPrompt)` function using `groq-sdk`
  - Model: `llama-3.3-70b-versatile`
  - Returns parsed response text
- `promptTemplates.js`: dedicated prompt builder for each feature
  - `buildSystemDesignPrompt(userPrompt)` → instructs AI to return JSON + Mermaid diagram block
  - `buildDevOpsPrompt(appType)` → returns Dockerfile + GitHub Actions YAML
  - `buildChatPrompt(history, message)` → conversational dev assistant
  - `buildCodeAnalyzerPrompt(code)` → returns architecture breakdown JSON

### Phase 5 — Feature API Endpoints
All routes protected by `authMiddleware` except chat (optional public).

**System Design** — `POST /api/system-design/generate`
- Body: `{ prompt: string }`
- Returns: `{ architecture: string, techStack: [], components: [], mermaidDiagram: string }`
- Save result to `History` model

**DevOps Pipeline** — `POST /api/devops/generate`
- Body: `{ appType: string, framework: string }`
- Returns: `{ dockerfile: string, githubActions: string, deploymentSteps: [] }`

**AI Chat** — `POST /api/chat/message`
- Body: `{ message: string, history: [] }`
- Returns: `{ reply: string }`

**Code Analyzer** — `POST /api/code/analyze`
- Body: `{ code: string, language: string }`
- Returns: `{ components: [], architecture: string, suggestions: [] }`

### Phase 6 — Frontend Core
**Files:** `api/apiClient.js`, `context/AuthContext.jsx`, `App.jsx`
- Axios instance in `apiClient.js` with `baseURL` from `VITE_API_URL` env var, request interceptor adds JWT header
- `AuthContext` provides `user`, `login()`, `logout()`, `register()`
- `App.jsx`: React Router with protected route wrapper — redirects to `/login` if no token
- `Navbar` + `Sidebar` layout wrapping all authenticated pages

### Phase 7 — System Design Feature (First Feature, Full Implementation)
**Files:** `pages/SystemDesign.jsx`, `components/SystemDesign/PromptInput.jsx`, `components/SystemDesign/DiagramOutput.jsx`
- `PromptInput`: textarea + submit button, loading state, character limit display
- `DiagramOutput`:
  - Renders `architecture` text as formatted sections
  - Renders `components` as cards (icon + name + description)
  - Renders Mermaid diagram using `mermaid.render()` in a `useEffect`
  - Copy-to-clipboard for the Mermaid source
- `SystemDesign.jsx` orchestrates: call API → parse response → pass to `DiagramOutput`

### Phase 8 — Remaining Features
- `pages/DevOps.jsx` + `PipelineOutput.jsx`: syntax-highlighted code blocks for Dockerfile + YAML (use `<pre><code>` with Tailwind prose styling)
- `pages/Chat.jsx` + `ChatWindow.jsx`: scrollable message list, input bar, streaming feel via state
- `pages/CodeAnalyzer.jsx` + `AnalysisOutput.jsx`: textarea for code input, tabbed output (Architecture / Components / Suggestions)

### Phase 9 — Docker + CI/CD
**Files:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `.github/workflows/ci.yml`
- `backend/Dockerfile`: Node 20 Alpine, copy `package.json`, `npm ci`, copy src, `CMD node server.js`
- `frontend/Dockerfile`: Node 20 Alpine build stage → Nginx serve stage
- `docker-compose.yml`: backend + frontend services, env vars from `.env`
- `ci.yml`: on push to main → lint → build → docker build test

---

## Critical Files

| File | Purpose |
|------|---------|
| `backend/src/services/aiService.js` | Core Groq integration |
| `backend/src/services/promptTemplates.js` | AI output quality depends on these prompts |
| `backend/src/middleware/errorHandler.js` | Consistent API error shape |
| `frontend/src/api/apiClient.js` | All HTTP calls go through here |
| `frontend/src/context/AuthContext.jsx` | Auth state across entire app |
| `frontend/src/components/SystemDesign/DiagramOutput.jsx` | Mermaid rendering |

---

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Project (No Global Installs)

```bash
# Backend
cd devflow-ai/backend && npm install && npm run dev

# Frontend (separate terminal)
cd devflow-ai/frontend && npm install && npm run dev
```

Scripts in `backend/package.json`:
- `"dev": "node_modules/.bin/nodemon src/server.js"`
- `"start": "node src/server.js"`

Scripts in `frontend/package.json` (from Vite default):
- `"dev": "vite"` (uses local vite from node_modules)

---

## Verification

1. `npm run dev` in backend → server starts on port 5000, MongoDB connected log appears
2. `POST /api/auth/register` with Postman/Thunder → returns JWT
3. `POST /api/system-design/generate` with Bearer token → returns JSON with `mermaidDiagram` field
4. Frontend `npm run dev` → Vite starts on port 5173
5. Register → Login → System Design page → enter prompt → diagram renders in browser
6. `docker-compose up` → both services start, app accessible on ports 5000 + 5173
