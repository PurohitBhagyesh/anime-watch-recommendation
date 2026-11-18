# ⚡ AnimeSenpai — Full-Stack Anime Discovery & Watchlist Platform

<p align="center">
  <img src="frontend/public/animesenpai-banner.svg" alt="AnimeSenpai Logo Banner" width="480" />
</p>

<p align="center">
  <strong>An independent, ad-free anime discovery catalog and personal watchlist tracker powered by the live AniList GraphQL API.</strong>
</p>

<p align="center">
  <a href="https://www.animesenpai.online" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Website-animesenpai.online-000000?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Website" />
  </a>
  <a href="https://vercel.com" target="_blank">
    <img src="https://img.shields.io/badge/Frontend-Vercel%20Edge-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </a>
  <a href="https://render.com" target="_blank">
    <img src="https://img.shields.io/badge/Backend-Render%20Cloud-151519?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  </a>
  <a href="SECURITY.md">
    <img src="https://img.shields.io/badge/Security-Hardened-5360e6?style=for-the-badge&logo=shield&logoColor=white" alt="Security Hardened" />
  </a>
</p>

<p align="center">
  <a href="architecture.md"><img src="https://img.shields.io/badge/Documentation-Architecture-151519?style=flat-square" alt="Architecture" /></a>
  <a href="design.md"><img src="https://img.shields.io/badge/Design%20System-Guidelines-151519?style=flat-square" alt="Design System" /></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/Security-SECURITY.md-151519?style=flat-square" alt="Security" /></a>
  <a href="CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Community-Code%20of%20Conduct-151519?style=flat-square" alt="Code of Conduct" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="License" /></a>
</p>

---

## 📚 Documentation & Governance

* 🏛️ **[Architecture Guide (architecture.md)](architecture.md)** — Edge topology, AniList GraphQL pipelines, Pub/Sub event bus, and caching strategy.
* 🎨 **[Design System (design.md)](design.md)** — Monochrome Obsidian/Platinum tokens, Luminous Indigo button accent, responsive container queries, and accessibility specs.
* 🛡️ **[Security Policy (SECURITY.md)](SECURITY.md)** — Responsible vulnerability disclosure, Firestore rules, CSP, and SQLi protection.
* 🤝 **[Contributing (CONTRIBUTING.md)](CONTRIBUTING.md)** & **[Code of Conduct (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md)** — Guidelines for pull requests and community standards.
* ⚖️ **[License (LICENSE)](LICENSE)** — Open-source MIT License.

---

## 🌐 Live Production Deployments

* 🌐 **Production Web Application:** [https://www.animesenpai.online](https://www.animesenpai.online)
* ⚙️ **Production Backend API:** [https://anime-watch-recommendation.onrender.com/api](https://anime-watch-recommendation.onrender.com/api)
* 🩺 **Backend Health & Ping:** [https://anime-watch-recommendation.onrender.com/ping](https://anime-watch-recommendation.onrender.com/ping)

---

## ✨ Features at a Glance

* **🎨 3-Color Luxury UI (Obsidian · Platinum · Luminous Indigo):** Pure `#000000` / `#0c0c0f` surfaces and `#f5f5f7` / `#9a9aa6` typography across the interface, reserving `#5360e6` Luminous Indigo strictly for primary CTA buttons and active controls.
* **📡 Publisher–Subscriber (Pub/Sub) Event Architecture:** Typed client event broker (`frontend/src/utils/pubsub.ts`) backed by `BroadcastChannel` for decoupled real-time cross-tab synchronization of watchlists, preferences, auth state, and instant Undo toasts.
* **🔐 Multi-Method Firebase Authentication:** Sign in or link accounts with **Email & Password**, **Google OAuth**, or **Phone Number (SMS OTP with invisible reCAPTCHA)** — plus Email Verification, Forgot Password, Change Email (`verifyBeforeUpdateEmail`), Change Password, and self-service Permanent Account Deletion.
* **📸 Apple-Style Settings & Profile Photo Picker:** Live **Small / Default / Large** text size controls, English/Romaji/Japanese title switcher, catalog density toggle, live camera capture (`getUserMedia`) & Photo Library uploader, and organized **Display · Profile · Security · Data · About** workspace.
* **⏳ Smooth Skeleton & Native Circle Loading:** Layout-matched shimmer skeletons paired with accessible native `<progress>` circular loaders and GPU-composited Apple-spring transitions.
* **🔍 Live AniList GraphQL Catalog & Watchlist Tracker:** Real-time autocomplete search, seasonal schedules, studios, voice cast, franchise relations, episode progress bars with auto-complete, personal 1–10 score distribution chart, clickable genre filters, and portable JSON backup export/import.
* **🎬 Privacy-First Trailer & Share Experience:** Sandboxed `youtube-nocookie.com` official trailers, Random Anime Picker, and a minimal Share sheet (Copy Link + native device share sheet, zero social tracker buttons).

---

## 📱 Cross-Device Responsive Architecture

| Device Category | Target Viewports | Responsive Behavior |
| :--- | :--- | :--- |
| **📱 Mobile Phones** | `320px – 480px` | • Single sticky glass top bar + smooth sliding navigation drawer (with collapsible **Genres** menu)<br>• Touch-friendly horizontal snap carousels & responsive watchlist cards<br>• Floating corner `Buy me a Coffee` (UPI) and minimal `Share` pills |
| **📟 Tablets & Foldables** | `640px – 1024px` | • Adaptive 3–4 column grids and split Anime Details sidebar<br>• Scroll-safe segmented pill navigation across Settings & Watchlist |
| **💻 Laptops & Desktops** | `1024px – 2560px+` | • Expansive 5–6 column catalog grids and native CSS scroll progress line<br>• Keyboard shortcuts (`/` or `⌘K` search focus, `←`/`→` hero slide, `ESC` dismiss)<br>• Instant hover preview cards and live autocomplete search |

---

## 🔒 Defense-in-Depth Security Architecture

* **Zero SQL Injection Surface:** All backend database operations use **100% parameterized Prisma ORM queries** (zero `$queryRaw` / `$executeRaw` anywhere in the codebase), reinforced by a global **API Input Security Guard** (`backend/src/middleware/securityMiddleware.ts`) that strips prototype-pollution keys (`__proto__`, `constructor`, `prototype`), normalizes HTTP Parameter Pollution, and rejects null bytes and SQLi probes at the boundary.
* **IDOR & Brute-Force Protection:** Every private Watchlist, Review mutation, and Personalized Recommendation route enforces `requireAuth` and scopes strictly to `req.user.id` (never trusting client-supplied `userId`). Express rate limiters guard `/api/auth` (`25 req / 15 min`) and `/api` (`180 req / min`) with `1mb` payload caps and `bcrypt` (cost `12`) password hashing.
* **Strict Edge HTTP Headers (`vercel.json`):** Enforces a tight **Content-Security-Policy (CSP)**, `X-Frame-Options: DENY`, `Strict-Transport-Security` (HSTS preload), `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy`, `Referrer-Policy`, and `Permissions-Policy` (`camera=(self)` only). Production source maps are disabled (`sourcemap: false`).
* **Hardened Firestore Security Rules (`firestore.rules`):** Strict owner-only access (`request.auth.uid == userId`), `allow list: if false` (blocks PII/email scraping), `hasOnly` strict schema enforcement, immutable `id`/`joinedDate`, validated usernames (3–24 chars with safe spaces), O(1) raster-only avatar checks, and default-deny on all other collections.
* **Zero Hardcoded Secrets:** Firebase client credentials and backend JWT secrets load strictly from environment variables (`.env` files are gitignored), and the browser Firebase API key is locked via Google Cloud HTTP referrer & API restrictions.

---

## ⚡ Local Development Quick Start

### Prerequisites
- **Node.js**: `v20.0+`
- **npm**: `v9.0+`

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/PurohitBhagyesh/anime-watch-recommendation.git
cd anime-watch-recommendation

cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

> **Environment Variables**: Populate `frontend/.env` with your Firebase project config from the [Firebase Console](https://console.firebase.google.com) and set a strong `JWT_SECRET` in `backend/.env`. Never commit `.env` files.

### 2. One-Step Workspace Setup
```bash
npm run setup
```

### 3. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```
* 🌐 **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* 🩺 **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Deploy Firestore Security Rules
```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

---

## 📡 API Endpoints Reference

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Ping** | `GET` | `/ping` | Lightweight 200 OK keep-alive | No |
| **Health** | `GET` | `/api/health` | Service uptime and status metadata | No |
| **Auth** | `POST` | `/api/auth/register` | Register new account (validated username/email/password) | No |
| **Auth** | `POST` | `/api/auth/login` | Login with credentials | No |
| **Auth** | `POST` | `/api/auth/demo` | Instant demo login session | No |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| **Auth** | `PUT` | `/api/auth/profile` | Update authenticated user profile | Yes (Bearer) |
| **Anime** | `GET` | `/api/anime/trending` | Top community trending titles | No |
| **Anime** | `GET` | `/api/anime/seasonal` | Airing seasonal releases | No |
| **Anime** | `GET` | `/api/anime/top` | Top 100 highest rated anime | No |
| **Anime** | `GET` | `/api/anime/popular` | All-time most popular anime | No |
| **Anime** | `GET` | `/api/anime/search` | Multi-parameter search with filters | No |
| **Anime** | `GET` | `/api/anime/:id` | Full details, cast, official links, trailer | No |
| **Watchlist** | `GET` | `/api/watchlist` | Fetch authenticated user watchlist | Yes (Bearer) |
| **Watchlist** | `POST` | `/api/watchlist` | Add or update watchlist item | Yes (Bearer) |
| **Watchlist** | `PATCH` | `/api/watchlist/:animeId/progress` | Update episode count & status | Yes (Bearer) |
| **Watchlist** | `DELETE` | `/api/watchlist/:animeId` | Remove item from watchlist | Yes (Bearer) |
| **Watchlist** | `POST` | `/api/watchlist/export` | Export watchlist JSON payload | Yes (Bearer) |
| **Watchlist** | `POST` | `/api/watchlist/import` | Import validated watchlist items (max 500) | Yes (Bearer) |
| **Recommendations** | `GET` | `/api/recommendations/personalized` | Genre-affinity recommendations | Yes (Bearer) |
| **Recommendations** | `GET` | `/api/recommendations/anime/:id` | Similar & related titles | No |
| **Reviews** | `GET` | `/api/reviews/anime/:animeId` | Fetch community reviews for anime | No |
| **Reviews** | `POST` | `/api/reviews` | Post a validated user review and rating | Yes (Bearer) |
| **Reviews** | `POST` | `/api/reviews/:id/like` | Like a community review | Yes (Bearer) |

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
