# DevFlow AI — AI-Powered Deployment & System Design Playground

A full-stack MERN application that helps developers generate system design architectures, DevOps pipelines, chat with an AI assistant, and analyze code architecture — all powered by Groq's free LLaMA 3.3 70B model.

---

## Features

| Feature | Description |
|--------|-------------|
| **System Design Generator** | Describe any system → get architecture breakdown + Mermaid diagram |
| **DevOps Pipeline Generator** | Auto-generate Dockerfiles and GitHub Actions CI/CD pipelines |
| **AI Dev Assistant** | Chat about system design, debugging, and architecture |
| **Code → Architecture Analyzer** | Paste code → get architecture breakdown and improvement suggestions |

---

## Tech Stack

- **Frontend** — React 19, Vite, Tailwind CSS, Mermaid.js
- **Backend** — Node.js, Express, MongoDB (Atlas), JWT Auth, Passport.js (Google OAuth)
- **AI** — Groq API (LLaMA 3.3 70B — free tier)
- **DevOps** — Docker, Docker Compose, GitHub Actions

---

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v8 or higher
- A free [Groq API key](https://console.groq.com)
- A free [MongoDB Atlas](https://cloud.mongodb.com) account

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd devflow-ai
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create the `.env` file:

```bash
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devflow-ai
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_groq_api_key_here
CLIENT_URL=http://localhost:5173

# Optional — only needed for Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend:

```bash
npm run dev
```

You should see:
```
[db] MongoDB connected: cluster0.xxxxx.mongodb.net
[server] running on port 5000 in development mode
```

### 3. Set up the Frontend

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 4. Open the app

Go to **http://localhost:5173** in your browser.

---

## Getting Your API Keys

### Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up — no credit card required
3. Go to **API Keys** → **Create API Key**
4. Copy and paste into `server/.env` as `GROQ_API_KEY`

Free tier: **14,400 requests/day**, **30 requests/minute** — more than enough for development.

### MongoDB Atlas (Free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0 — always free)
3. Create a database user under **Database Access**
4. Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<password>` with your database user password
7. Paste into `server/.env` as `MONGODB_URI` — change the database name to `devflow-ai`

### Google OAuth (Optional)

Only needed if you want "Continue with Google" to work:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy **Client ID** and **Client Secret** into `server/.env`

---

## Project Structure

```
devflow-ai/
├── server/
│   ├── src/
│   │   ├── config/         # DB connection, Passport setup
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   └── services/       # Groq AI service + prompt templates
│   ├── .env.example
│   └── server.js
├── client/
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   └── App.jsx
│   └── vite.config.js
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register with email/password |
| POST | `/api/auth/login` | No | Login with email/password |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/google` | No | Google OAuth login |
| POST | `/api/system-design/generate` | Yes | Generate system architecture |
| GET | `/api/system-design/history` | Yes | Get past designs |
| POST | `/api/devops/generate` | Yes | Generate DevOps pipeline |
| POST | `/api/chat/message` | Yes | Send chat message |
| POST | `/api/code/analyze` | Yes | Analyze code architecture |
| GET | `/api/health` | No | Server health check |

---

## Running with Docker

Make sure you have Docker and Docker Compose installed, then:

```bash
# Create a .env file in the root with your secrets
cp server/.env.example .env

# Build and run both services
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Common Issues

**502 Bad Gateway on login/register**
→ Backend is not running. Start it with `cd server && npm run dev`

**MongoDB connection failed**
→ Your IP is not whitelisted in Atlas. Go to Network Access → Add IP → Allow from Anywhere (`0.0.0.0/0`)

**GROQ_API_KEY error**
→ Make sure your `.env` file exists in the `server/` folder and has a valid key from [console.groq.com](https://console.groq.com)

**Port 5000 already in use**
→ Change `PORT=5001` in `server/.env` and update `vite.config.js` proxy target accordingly

---

## Environment Variables Reference

### `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Any long random string |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `GROQ_API_KEY` | **Yes** | From console.groq.com |
| `CLIENT_URL` | No | Frontend URL (default: http://localhost:5173) |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth |

---

## License

MIT
