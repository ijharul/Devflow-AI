# ⚡ DevFlow AI — The Ultimate Developer Playground

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://devflow-ai-rust.vercel.app)
[![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb)](https://devflow-ai-rust.vercel.app)

**DevFlow AI** is a premium, AI-powered developer platform designed to streamline system architecture design, automate DevOps pipelines, and provide intelligent debugging assistance. Powered by **LLaMA 3.3 (70B)** via **Groq Inference**, it delivers sub-2s responses for complex architectural decisions.

![DevFlow AI Banner](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070)

---

## 🔗 Live Link
Visit the platform here: [**https://devflow-ai-rust.vercel.app**](https://devflow-ai-rust.vercel.app)

---

## 🚀 Key Features

### 🏗️ AI System Design
- **Instant Architecture:** Generate full-stack system designs with one prompt.
- **Mermaid Diagrams:** Automatic generation of architecture diagrams.
- **What-if Simulator:** Explore the impact of switching databases or scaling services.

### ☸️ DevOps Engine
- **CI/CD Pipelines:** Generate GitHub Actions and GitLab CI YAMLs instantly.
- **Infrastructure as Code:** Auto-generate Dockerfiles and docker-compose configurations.
- **Deployment Checklists:** Step-by-step guides for AWS, Vercel, and Render.

### 🐞 Intelligent Debugger
- **Root Cause Analysis:** Paste an error and code to get an instant explanation.
- **Auto-Patching:** AI suggests fixed code blocks ready to copy-paste.
---

## 📸 Screenshots

| Dashboard | System Design |


| DevOps Tool | AI Chat |


---

## 📂 Project Structure

```text
devflow-ai/
├── client/                # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── api/           # Axios client & API logic
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth & Global state
│   │   ├── pages/         # Page components (Home, Login, etc.)
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── vercel.json        # Vercel deployment config
├── server/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Passport & DB configs
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth & Quota logic
│   │   ├── models/        # Mongoose schemas
│   │   └── routes/        # API endpoints
│   ├── scripts/           # DB cleanup & maintenance scripts
│   └── .env               # Server environment variables
├── package.json           # Root build proxy
└── vercel.json            # Root deployment routing
```

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Lucide React, CSS3 (Modern Glassmorphism)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI Engine:** LLaMA 3.3 (70B) via Groq Cloud
- **Email System:** Resend API / Nodemailer (SMTP)
- **Deployment:** Vercel (Frontend) & Render (Backend)

---

## 📦 Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/devflow-ai.git
   cd devflow-ai
   ```

2. **Install Dependencies:**
   ```bash
   # Install server deps
   cd server && npm install
   # Install client deps
   cd ../client && npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GROQ_API_KEY=your_groq_key
   RESEND_API_KEY=your_resend_key
   CLIENT_URL=https://devflow-ai-rust.vercel.app
   ```

4. **Run Locally:**
   ```bash
   # From root
   npm run dev
   ```

---

## 📱 Mobile-First Design
Optimized for high-fidelity mobile experiences. Verified and refined for modern mobile devices including **Nothing Phone 2a**.

---

## 📄 License
MIT License. Created by [Ijharul](https://github.com/ijharul).
