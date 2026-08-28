# SkillSync — Peer-to-Peer Knowledge Network

> **Exchange skills. Not money.** A modern, full-stack peer-to-peer knowledge barter platform where developers, students, and professionals teach what they know and learn what they need through 1-on-1 collaborative video rooms and real-time coding sessions.

---

## Key Features

- **AI-Powered Matching Engine**: Matches peers based on reciprocal skill overlap (User A teaches what User B wants to learn, and vice-versa) with compatibility scoring.
- **In-App 1-on-1 Interactive Video Studio**:
  - WebRTC video & crystal-clear audio calling.
  - Screen sharing for live debugging and demos.
  - Synchronized collaborative live code editor supporting C++, Java, Python, JavaScript, SQL, and HTML.
  - Shared whiteboard scratchpad for lesson notes.
  - In-room live chat & interactive lesson goal checklists.
  - Accidental leave recovery with one-click green Re-join and red End/Complete prompts.
- **Direct Messaging & Chat**: WhatsApp/Telegram-style locked viewport with smooth message streaming, unread counters, and instant session booking from chat headers.
- **Reputation & Review System**: Score and tier tracking (New → Rising → Trusted → Expert → Elite) based on peer ratings, teaching quality, and session punctuality.
- **Automated AI Learning Roadmaps**: Personalized skill progression plans and weak topic detection powered by Groq LLaMA models.
- **Transactional Email System**: HTML email templates for tokenized account verification, password resets, and session reminders.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Dark-mode first, luxury obsidian design system)
- **State & Queries**: Zustand + TanStack React Query v5
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose + Pagination plugins
- **Real-Time Communication**: Socket.io (Signaling, in-room collaboration, chat sync)
- **Security**: JWT (Access + Refresh tokens with cookie persistence), Helmet, Rate Limiting, CORS, Bcrypt
- **Email Delivery**: Nodemailer (Gmail SMTP)
- **AI Engine**: Groq SDK (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`)

---

## Project Structure

```text
SkillSync/
├── client/                     # Frontend React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI, layout & feature components
│   │   │   ├── layout/         # Navbar, Sidebar, MobileNav, DashboardLayout
│   │   │   ├── sessions/       # BookSessionModal, SessionCard
│   │   │   └── ui/             # Design system (Button, Avatar, Badge, etc.)
│   │   ├── hooks/              # useAuth, useSocket, useWebRTC, etc.
│   │   ├── lib/                # Constants, formatters, notify utility
│   │   ├── pages/              # Landing, Dashboard, Discover, Matches, Chat, VideoSession, etc.
│   │   ├── services/           # Axios API modules (auth, user, match, session, chat)
│   │   └── store/              # Zustand global state (auth, socket, notifications)
│   └── vite.config.js
│
├── server/                     # Backend Node.js REST & Socket Server
│   ├── config/                 # MongoDB & Cloudinary configuration
│   ├── controllers/            # Route controllers (auth, match, session, chat, etc.)
│   ├── middleware/             # Auth protection, multer upload, rate limiters, validation
│   ├── models/                 # Mongoose schemas (User, Match, Session, Message, Review)
│   ├── routes/                 # Express API routes
│   ├── socket/                 # Socket.io handlers (chat, video signaling, notifications)
│   ├── utils/                  # Matching algorithms, reputation scoring, AI prompts, email templates
│   ├── validators/             # Express-validator schema chains
│   └── index.js                # Server entry point
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas cluster URI
- Gmail SMTP credentials (for email verification)
- Groq API Key

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/himanshuraj108/SkillSync.git
   cd SkillSync
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGO_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   GROQ_API_KEY=your_groq_api_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## License

This project is licensed under the MIT License — see the LICENSE file for details.
