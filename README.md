# 🤖 AI-Powered Todo App

A full-stack productivity application with AI features, built with React, Node.js, Express, and MongoDB.

🔗 **Live Demo:** https://effortless-sprinkles-9bc81f.netlify.app
🔗 **Backend API:** https://ai-todo-backend-1q06.onrender.com/api/health

---

## ✨ Features

### Core
- 🔐 User Authentication (JWT)
- ✅ Full Task CRUD
- 🎯 Priority levels (Urgent/High/Medium/Low)
- 📅 Due dates & reminders
- 📌 Pin important tasks

### AI Features
- 🤖 Smart priority detection
- 📆 AI deadline suggestions
- 🔍 Task breakdown into steps
- 😊 Mood-based suggestions

### Productivity
- ⏱️ Pomodoro Timer (25/5)
- 📊 Progress dashboard
- 🗓️ Calendar view
- 🔎 Smart search & filters
- 🏷️ Categories & tags

### Extra
- 🎤 Voice input (Web Speech API)
- 📥 Export tasks (TXT + PDF)
- 🌙 Glassmorphism dark theme
- 📱 Fully responsive

---

## 🛠️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React.js + Vite               |
| Styling   | Custom CSS + Glassmorphism    |
| Backend   | Node.js + Express.js          |
| Database  | MongoDB Atlas                 |
| Auth      | JWT + bcrypt                  |
| AI        | Mock AI (OpenAI-compatible)   |
| Deploy    | Netlify + Render              |

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### Setup
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-todo-app.git
cd ai-todo-app

# Backend setup
cd backend
npm install
# Create .env file with your values (see .env.example)
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 📁 Project Structure
```
ai-todo-app/
├── frontend/          # React app
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── services/
└── backend/           # Node.js API
    ├── models/
    ├── routes/
    ├── controllers/
    └── middleware/
```

---

## 👨‍💻 Author

Suryansh Thakur — B.Tech CSE, 1st Year  
Built as a college evaluation project.