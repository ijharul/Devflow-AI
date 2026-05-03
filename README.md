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

<img src="./screenshots/home.png" width="800"/>

<img src="./screenshots/login.png" width="800"/>

<img src="./screenshots/dashboard.png" width="800"/>

<img src="./screenshots/system-design.png" width="800"/>

<img src="./screenshots/devops.png" width="800"/>

<img src="./screenshots/debugger.png" width="800"/>

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
