# 🌿 Wellness Tracker App

A full-stack wellness and habit tracking platform built with **Next.js**, **Node.js**, and **MongoDB**.  
Track your habits, log moods, visualize progress, and stay motivated every day.  

---

## 🚀 Features

- ✅ JWT-based authentication (Sign up / Login)
- 📅 Habit tracking dashboard for daily progress
- 🔥 Dynamic streak calendar view
- 🏆 Automatic achievements (7, 14, 30-day streaks)
- 💭 Mood tracking form with notes (1–10 scale)
- 📈 Progress charts (weekly habit completion & mood trends)
- 💡 AI-motivational quotes fetched dynamically
- 📊 Analytics via Recharts
- 🎨 Sleek UI using shadcn/ui + Tailwind CSS
- ⚡ Backend built with Node.js + Express + MongoDB  

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, shadcn/ui, Recharts, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT |
| Hosting | Vercel (Frontend) + Render/Railway (Backend) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

git clone https://github.com/<your-username>/<repo-name>.git
cd wellness-tracker

text

---

### 2️⃣ Environment Variables

Create two `.env` files — one for backend and one for frontend.

#### 📁 Backend (`/backend/.env`):
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wellness
JWT_SECRET=supersecretkey

text

#### 📁 Frontend (`/frontend/.env.local`):
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_QUOTE_API_URL=https://api.api-ninjas.com/v1/quotes
NEXT_PUBLIC_QUOTE_API_KEY=<your_api_key_here>

text

> You can get a free **Quote API key** from [API Ninjas](https://api-ninjas.com/api/quotes).

---

### 3️⃣ Install Dependencies

#### Backend
cd backend
npm install

text

#### Frontend
cd frontend
npm install

text

---

### 4️⃣ Run the App

#### Start Backend
cd backend
npm run dev

text

#### Start Frontend
cd frontend
npm run dev

text

Visit: [http://localhost:3000](http://localhost:3000) 🌐

---

## 🧠 Example Credentials (for Testing)

📧 Email: test@example.com
🔑 Password: password123

text

---

## 📊 Folder Structure

📦 wellness-tracker
┣ 📂 backend
┃ ┣ 📂 models # Mongoose schemas
┃ ┣ 📂 routes # Express API routes
┃ ┣ 📜 server.js # App entry point
┃ ┗ 📜 seed.js # MongoDB dummy seed script
┣ 📂 frontend
┃ ┣ 📂 components # shadcn/ui + Recharts components
┃ ┣ 📂 lib # API functions
┃ ┣ 📂 app # Next.js app routes
┃ ┗ 📜 package.json
┗ 📜 README.md

text

---

## 🧾 API Overview

### Auth
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User login and token retrieval |

### Habits
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create new habit |
| POST | `/api/habits/:id/complete` | Mark habit as completed |

### Progress
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/progress/weekly` | Get weekly progress chart data |
| GET | `/api/progress/habits-completion` | Get per-habit stats |
| GET | `/api/progress/mood-trend` | Get user's 7-day mood data |
| POST | `/api/progress/mood` | Log today's mood |
| GET | `/api/progress/insights` | Get personal trends and insights |

### Streaks
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/streaks/stats` | View current streaks |
| GET | `/api/streaks/calendar/:year/:month` | Fetch monthly habit completion calendar |

---

## 🧪 Seed Demo Data (Optional)

You can pre-populate MongoDB with a test user and sample data.

node backend/seed.js

text

Login using:
Email: test@example.com
Password: password123

text

---

## 🧠 Mood Tracking Example

**POST `/api/progress/mood`**

Request:
{
"mood": 8,
"notes": "Morning workout energized me!"
}

text

Response:
{
"success": true,
"message": "Mood logged successfully"
}

text

---

## 🌐 Deployment (Vercel + Render)

### Frontend (Next.js → Vercel)
1. Push your project to GitHub  
2. Go to [Vercel.com](https://vercel.com) → Import GitHub project  
3. Set environment variables (`NEXT_PUBLIC_*`)  
4. Deploy 🎉  

### Backend (Express → Render)
1. Create a new **Web Service** on [Render](https://render.com/)  
2. Connect your GitHub backend repo  
3. Add environment variables from your `.env` file  
4. Deploy the API  

Update your **Frontend** `.env.local` as:
NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api

text

---

## 🧭 Future Improvements

- [ ] Add email-based habit reminders  
- [ ] Mobile push notifications  
- [ ] Advanced mood analytics dashboard  
- [ ] Google sign-in integration  
- [ ] Offline habit tracking (PWA support)

---

## 🧑‍💻 Author

**Developer:** [Your Name](https://github.com/<your-username>)  
**Email:** yourname@example.com  
**Website:** [https://yourportfolio.com](https://yourportfolio.com)

---

## 🪪 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

## 💖 Acknowledgements

- [Next.js](https://nextjs.org/)  
- [shadcn/ui](https://ui.shadcn.com)  
- [Recharts](https://recharts.org/en-US)  
- [MongoDB](https://mongodb.com)  
- [API Ninjas](https://api-ninjas.com/api/quotes)  
- Community contributors 💫

---

**🚀 Built with care to help you live a healthier, more mindful life.**
