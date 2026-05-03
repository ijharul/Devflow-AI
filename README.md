# ⚡ DevFlow AI — AI-Powered Developer Playground

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge\&logo=vercel)](https://devflow-ai-rust.vercel.app)
[![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge\&logo=mongodb)](https://devflow-ai-rust.vercel.app)

**DevFlow AI** is a full-stack, AI-powered platform designed to help developers design scalable systems, generate DevOps pipelines, and debug issues intelligently.
It combines **System Design + DevOps + GenAI** into a single interactive workspace.

---

## 🌐 Live Demo

* Frontend: https://devflow-ai-rust.vercel.app
* Backend: https://devflow-ai-91vt.onrender.com

---

## 🚀 Key Features

### 🏗️ AI System Design

* Generate full-stack architectures from prompts
* Visualize system flows (Mermaid diagrams)
* Simulate scaling and infrastructure changes

---

### ⚙️ DevOps Engine

* Generate CI/CD pipelines (GitHub Actions, GitLab CI)
* Auto-create Docker & deployment configs
* Deployment guides for cloud platforms

---

### 🐞 Intelligent Debugger

* Root cause analysis for errors
* AI-generated fixes and code patches
* Debug suggestions in real-time

---

### 🔐 Authentication System

* JWT-based authentication
* OAuth login (Google & GitHub)
* Secure protected routes

---

## 📸 Screenshots



<div align="center">
Signup & Login Page
<img width="1918" height="988" alt="login" src="https://github.com/user-attachments/assets/8b7fa8b2-de93-495f-ba56-97686afcc85a" />
<img width="1918" height="988" alt="signup" src="https://github.com/user-attachments/assets/4020f50f-7a1b-426f-bfbf-76487a593cd7" />
Dashboard
<img width="1918" height="988" alt="dashboard_1" src="https://github.com/user-attachments/assets/d7ca538e-977e-40bb-bcba-a1a3bd90732b" />
<img width="1918" height="988" alt="dashboard_2" src="https://github.com/user-attachments/assets/98b74734-faff-4d58-b20d-4027fa347b33" />
SOME FEATURES
 System Design
 <img width="1918" height="987" alt="system deisgn generater" src="https://github.com/user-attachments/assets/d3e48f44-1bc5-44f6-b726-63eb0c9d1df2" />
 DevOps
  <img width="1918" height="990" alt="devops" src="https://github.com/user-attachments/assets/d2fbbd97-0f85-4c1a-bec0-5837e14f4b3b" />
  GitHub Function
  <img width="1918" height="997" alt="github reo page" src="https://github.com/user-attachments/assets/a01b05a6-9b10-4484-b70e-0df9781b656a" />
  Architecture Comparison
  <img width="1918" height="992" alt="arch compraison" src="https://github.com/user-attachments/assets/89f8ee84-a732-4c99-aee7-07176fb51fe0" />
  Diagram Editro
  <img width="1918" height="985" alt="diagram editior" src="https://github.com/user-attachments/assets/255c65e2-3ddb-4bd1-8578-107d6eab97f0" />
</div>

---

## 🧠 System Design Overview

The platform follows a **distributed client-server architecture**:

* **Frontend (React + Vite)** → UI & API interaction
* **Backend (Node.js + Express)** → Business logic & authentication
* **Database (MongoDB Atlas)** → Data persistence
* **External Services** → OAuth (Google/GitHub) + AI APIs

### 🔄 Data Flow

Client → API → Database → Response

### 🔐 Auth Flow

OAuth → Backend callback → JWT → Client session

---

## ⚙️ DevOps & Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* Database hosted on MongoDB Atlas

### 🔁 CI/CD

* GitHub push triggers automatic deployment

### 🔧 Environment Management

* `.env` based configuration
* Separate development and production setups

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Modern CSS (Glassmorphism UI)

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Authentication

* JWT
* Google OAuth
* GitHub OAuth

### AI Integration

* Groq API (LLaMA 3.3 70B)

### DevOps

* Git & GitHub
* CI/CD via Vercel & Render

---

## 📂 Project Structure

```text
devflow-ai/
├── client/        # Frontend
├── server/        # Backend
├── docker-compose.yml
└── README.md
```

---

## 📦 Installation

```bash
git clone https://github.com/ijharul/Devflow-AI.git
cd Devflow-AI

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

---

## ▶️ Run Locally

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

---

## 🔮 Future Enhancements

* 🐳 Docker containerization
* ⚡ Redis caching
* 📡 WebSockets (real-time updates)
* 📊 Logging & monitoring
* 💳 AI usage credits / billing system

---

## 👨‍💻 Author

**Ijharul Haque**
B.Tech CSE | Full Stack Developer

---

## ⭐ If you like this project

Give it a star on GitHub ⭐
