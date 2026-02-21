# 📋 Registration Form + Admin Portal

Full-stack application with a public registration form and a secure admin dashboard.
Built with **React**, **Node.js/Express**, and **MongoDB**.

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── models/User.js          # MongoDB schema (all fields)
│   ├── routes/users.js         # Public form submission API
│   ├── routes/admin.js         # Protected admin API + state filter/stats
│   ├── middleware/auth.js      # JWT auth middleware
│   ├── server.js               # Express entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
└── frontend/
    └── src/App.jsx             # React app (form + admin dashboard)
```

---

## 🗂️ Fields Collected

| Field | Required |
|-------|----------|
| First Name | ✅ |
| Last Name | ✅ |
| Email | ✅ |
| Phone Number | ✅ |
| State of Origin | ✅ |
| LGA of Origin | Optional |
| State of Residence | ✅ |
| LGA of Residence | Optional |
| Date of Birth | Optional |
| Gender | Optional |
| Occupation | Optional |
| Street / City / Postal Code | Optional |
| Message / Notes | Optional |

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB local **or** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free)

### 1️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env     # then edit .env with your values
npm run dev              # starts on http://localhost:5000
```

**Edit `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/registrationdb
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm start               # opens http://localhost:3000
```

---

## 🔐 Accessing the Admin Portal

1. Open **http://localhost:3000**
2. Click **Admin** in the nav bar
3. Log in with your `.env` credentials

---

## 📡 API Reference

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Submit registration form |

### Admin (Bearer JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Get JWT token |
| GET | `/api/admin/users` | List users (search, filter, paginate) |
| GET | `/api/admin/users/:id` | Get single user |
| PATCH | `/api/admin/users/:id/status` | Update status |
| DELETE | `/api/admin/users/:id` | Delete record |
| GET | `/api/admin/stats` | Dashboard stats + top states |
| GET | `/api/admin/states` | Distinct state values |

**Query params for GET /api/admin/users:**
- `search` — searches name, email, phone, occupation
- `status` — new / reviewed / contacted / archived
- `stateOfOrigin` — filter by state of origin
- `stateOfResidence` — filter by state of residence
- `page`, `limit`, `sortBy`, `order`

---

## 🔒 Security Features

- JWT authentication (8-hour expiry)
- Rate limiting (100 req/15min; 10 login attempts/15min)
- Helmet.js security headers
- Input validation (express-validator)
- CORS locked to frontend URL
- Duplicate email detection

---

## ☁️ Deploy to Production

**Backend** → Render / Railway / Fly.io
- Set all `.env` values as environment secrets
- Start command: `npm start`

**Frontend** → Vercel / Netlify
- Change `API_BASE` in `App.jsx` to your backend URL
- Build: `npm run build` | Output: `build/`

**MongoDB Atlas** (recommended for production):
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/registrationdb
```
