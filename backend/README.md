# Voltaku — Backend API Server

A modular, high-performance Node.js & Express REST API server with TypeScript, Prisma ORM, and AniList GraphQL integration.

---

## ⚡ Tech Stack

* **Runtime & Framework:** Node.js, Express.js, TypeScript
* **ORM & Database:** Prisma ORM with SQLite (or PostgreSQL)
* **Auth:** JSON Web Tokens (JWT) & bcrypt password hashing
* **External Integration:** AniList Public GraphQL API with smart in-memory TTL caching

---

## 📁 Directory Layout

```
backend/
├── src/
│   ├── config/             # DB and client singletons
│   ├── controllers/        # Request handlers (auth, anime, watchlist, recommendations, reviews)
│   ├── middleware/         # JWT verification, error handling, logging
│   ├── routes/             # REST route declarations
│   ├── services/           # AniList proxy, recommendation engine algorithms
│   ├── scripts/            # Database seed script
│   └── server.ts           # Express server entry point
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime and status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate existing user | No |
| `POST` | `/api/auth/demo` | Instant demo login session | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `PUT` | `/api/auth/profile` | Update profile avatar/bio/genres | Yes (Bearer) |
| `GET` | `/api/anime/trending` | Get trending anime | No |
| `GET` | `/api/anime/seasonal` | Get current seasonal anime | No |
| `GET` | `/api/anime/top` | Get top 100 highest rated anime | No |
| `GET` | `/api/anime/popular` | Get all-time popular anime | No |
| `GET` | `/api/anime/search` | Search anime with multi-filters | No |
| `GET` | `/api/anime/:id` | Get comprehensive anime details | No |
| `GET` | `/api/watchlist` | Get user watchlist items | Optional |
| `POST` | `/api/watchlist` | Add/update item in watchlist | Optional |
| `PATCH`| `/api/watchlist/:id/progress` | Quick episode count increment | Optional |
| `DELETE`| `/api/watchlist/:id` | Delete item from watchlist | Optional |
| `POST` | `/api/watchlist/export` | Export watchlist JSON payload | Optional |
| `POST` | `/api/watchlist/import` | Import watchlist items | Optional |
| `GET` | `/api/recommendations/personalized` | AI/Genre-weighted recommendations | Optional |
| `GET` | `/api/recommendations/anime/:id` | Related franchise & similar anime | Optional |
| `GET` | `/api/reviews/anime/:animeId` | Get community reviews for anime | Optional |
| `POST` | `/api/reviews` | Post a review & rating | Optional |
| `POST` | `/api/reviews/:id/like` | Upvote a review | Optional |

---

## 🛠️ Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma Schema to SQLite
npm run db:push

# 3. Seed initial database data
npm run db:seed

# 4. Start development server
npm run dev
```
