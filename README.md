# DevFlow AI — The Ultimate Developer Playground

DevFlow AI is a high-performance, AI-powered platform designed to supercharge the developer workflow. From generating complex system architectures to automated DevOps pipelines and intelligent debugging, it's the all-in-one workspace for modern engineers.

---

## 🚀 Live Demo & Links

- **Frontend (Vercel):** [https://devflow-ai-rust.vercel.app](https://devflow-ai-rust.vercel.app)
- **Backend (Render):** [https://devflow-ai-91vt.onrender.com](https://devflow-ai-91vt.onrender.com)

---

## 📸 Platform Showcase (Screenshots)

### 🖥️ Dashboard & Tool Overview
*(Replace with screenshot of your main dashboard)*
![Dashboard View](./screenshots/dashboard.png)

### 🏗️ AI System Design Generator
*(Replace with screenshot of a generated architecture with Mermaid diagrams)*
![System Design](./screenshots/system-design.png)

### 🐳 Automated DevOps Pipelines
*(Replace with screenshot showing Docker & GitHub Actions generation)*
![DevOps View](./screenshots/devops.png)

### 🐙 GitHub Repository Browser & Import
*(Replace with screenshot of the new direct GitHub import sidebar)*
![GitHub Integration](./screenshots/github-import.png)

### 🐛 Intelligent Error Debugger
*(Replace with screenshot of the AI fixing a code bug)*
![Debugger View](./screenshots/debugger.png)

---

## 🌟 Key Features

- **Architecture Generator:** Get full-stack system designs with Mermaid.js diagrams, tech stack recommendations, and component breakdowns.
- **DevOps Suite:** Instantly generate Dockerfiles, Docker Compose, and CI/CD pipelines (GitHub Actions).
- **Direct GitHub Sync:** Browse and import your GitHub repositories with one click using OAuth2.
- **AI Assistant:** A dedicated chat expert for architectural decisions and deployment strategies.
- **Code Analyzer:** Deep-dive into any codebase to understand patterns, flows, and potential bottlenecks.
- **Interview Mode:** Practice high-level system design interviews with AI-driven questions and hints.
- **What-if Simulator:** Simulate architectural changes (e.g., "What if I move to Microservices?") and see the impact.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Vanilla CSS (Custom Design System), Lucide Icons.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose).
- **AI Engine:** LLaMA 3.3 70B via Groq SDK (Sub-2s response time).
- **Authentication:** Passport.js (Google & GitHub OAuth2), JWT, Bcrypt.js.
- **Email:** Nodemailer (Secure SMTP via Gmail).
- **Diagrams:** Mermaid.js.

---

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_key

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (Gmail SMTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# URLs
CLIENT_URL=http://localhost:5173
```

---

## 🏗️ Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/devflow-ai.git
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [Your Name]**
