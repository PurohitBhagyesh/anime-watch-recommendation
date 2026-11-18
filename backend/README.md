# AnimeSenpai — Backend API Server

A modular, security-hardened Node.js & Express REST API server with TypeScript, Prisma ORM, and AniList GraphQL integration.

---

## ⚡ Tech Stack

* **Runtime & Framework:** Node.js, Express.js, TypeScript
* **ORM & Database:** 100% parameterized Prisma ORM with SQLite (or PostgreSQL) — zero raw SQL queries
* **Auth & Security:** JSON Web Tokens (JWT), `bcrypt` (cost `12`) password hashing, global `securityMiddleware` (SQLi / null-byte / prototype-pollution / HPP firewall), tiered `rateLimitMiddleware`, and strict `requireAuth` IDOR scoping
* **External Integration:** AniList Public GraphQL API with bounded 500-entry in-memory TTL caching

---

## 📁 Directory Layout

```
backend/
├── src/
│   ├── config/             # DB and client singletons
│   ├── controllers/        # Request handlers (auth, anime, watchlist, recommendations, reviews)
│   ├── middleware/         # JWT auth, security firewall, tiered rate limiters, error handling
│   ├── routes/             # REST route declarations
│   ├── services/           # AniList proxy (bounded cache), recommendation engine algorithms
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
| `GET` | `/ping` | Lightweight 200 OK keep-alive | No |
| `GET` | `/api/health` | Service uptime and status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate existing user | No |
| `POST` | `/api/auth/demo` | Instant demo login session | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `PUT` | `/api/auth/profile` | Update authenticated user profile | Yes (Bearer) |
| `GET` | `/api/anime/trending` | Get trending anime | No |
| `GET` | `/api/anime/seasonal` | Get current seasonal anime | No |
| `GET` | `/api/anime/top` | Get top 100 highest rated anime | No |
| `GET` | `/api/anime/popular` | Get all-time popular anime | No |
| `GET` | `/api/anime/search` | Search anime with multi-filters | No |
| `GET` | `/api/anime/:id` | Get comprehensive anime details | No |
| `GET` | `/api/watchlist` | Get authenticated user watchlist items | Yes (Bearer) |
| `POST` | `/api/watchlist` | Add/update item in watchlist | Yes (Bearer) |
| `PATCH` | `/api/watchlist/:animeId/progress` | Update episode count & status | Yes (Bearer) |
| `DELETE` | `/api/watchlist/:animeId` | Delete item from watchlist | Yes (Bearer) |
| `POST` | `/api/watchlist/export` | Export watchlist JSON payload | Yes (Bearer) |
| `POST` | `/api/watchlist/import` | Import validated watchlist items (max 500) | Yes (Bearer) |
| `GET` | `/api/recommendations/personalized` | Genre-weighted personalized recommendations | Yes (Bearer) |
| `GET` | `/api/recommendations/anime/:id` | Related franchise & similar anime | No |
| `GET` | `/api/reviews/anime/:animeId` | Get community reviews for anime | No |
| `POST` | `/api/reviews` | Post a validated review & rating | Yes (Bearer) |
| `POST` | `/api/reviews/:id/like` | Upvote a community review | Yes (Bearer) |

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
