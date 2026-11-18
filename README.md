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
    <img src="https://img.shields.io/badge/Security-Policy-22c55e?style=for-the-badge&logo=shield&logoColor=white" alt="Security Policy" />
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

* 🏛️ **[Architecture Guide (architecture.md)](architecture.md)** — Edge topology, AniList GraphQL pipelines, state flow, and caching strategy.
* 🎨 **[Design System (design.md)](design.md)** — Monochrome obsidian tokens, liquid-glass specular rims, responsive breakpoints, and accessibility specs.
* 🛡️ **[Security Policy (SECURITY.md)](SECURITY.md)** — Responsible vulnerability disclosure, data handling, and key hygiene.
* 🤝 **[Contributing (CONTRIBUTING.md)](CONTRIBUTING.md)** & **[Code of Conduct (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md)** — Guidelines for pull requests and community standards.
* ⚖️ **[License (LICENSE)](LICENSE)** — Open-source MIT License.

---

## 🌐 Live Production Deployments

* 🌐 **Production Web Application:** [https://www.animesenpai.online](https://www.animesenpai.online)
* ⚙️ **Production Backend API:** [https://anime-watch-recommendation.onrender.com/api](https://anime-watch-recommendation.onrender.com/api)
* 🩺 **Backend Health & Ping:** [https://anime-watch-recommendation.onrender.com/ping](https://anime-watch-recommendation.onrender.com/ping)

---

## 🏆 Performance & SEO

* **Structured Data (JSON-LD)**: `Organization`, `WebSite` (Sitelinks Searchbox), `WebApplication`, `SiteNavigationElement`, `FAQPage`, `BreadcrumbList`, and per-anime `TVSeries`/`Movie` schemas built exclusively from real AniList metadata.
* **Automated Sitemap**: `scripts/generate-sitemap.mjs` generates 76 canonical URLs at build time (`frontend/public/sitemap.xml`).
* **Agentic Discovery**: Includes `llms.txt`, `/.well-known/ai-catalog.json`, `/.well-known/ard.json`, and `/.well-known/security.txt`.

---

## 📱 Cross-Device Responsive Architecture

| Device Category | Target Viewports | Responsive Behavior |
| :--- | :--- | :--- |
| **📱 Mobile Phones** | `320px – 480px` | • Single `52px` sticky glass top bar + smooth sliding navigation drawer<br>• Touch-friendly horizontal snap carousels & genre strip<br>• Floating corner `Buy me a Coffee` (UPI) and `Share` pills with centered bottom-sheet popups |
| **📟 Tablets & Foldables** | `640px – 1024px` | • Adaptive 3–4 column grids and split Anime Details sidebar<br>• Clean segmented pill tabs for Overview, Characters, and Relations |
| **💻 Laptops & Desktops** | `1024px – 2560px+` | • Expansive 5–6 column catalog grids and native CSS scroll progress line<br>• Keyboard shortcuts (`/` or `⌘K` search focus, `←`/`→` hero slide, `ESC` dismiss)<br>• Instant hover preview cards and live autocomplete search |

---

## ✨ Features at a Glance

* **🎨 3-Color Luxury UI (Obsidian · Platinum · Luminous Indigo):** Deep `#000000` / `#0c0c0f` surfaces and `#f5f5f7` / `#9a9aa6` typography across the interface, reserving `#5360e6` Luminous Indigo strictly for primary CTA buttons and active controls.
* **⏳ Smooth Skeleton & Native Circle Loading:** Layout-matched shimmer skeletons (cards, list rows, hero, and details) paired with accessible native `<progress>` circular page & search loaders and smooth poster fade-ins.
* **🔐 Privacy-First Accounts & Zero Hardcoded Secrets:** Firebase Auth & Firestore config and backend JWT secrets load strictly from environment variables (never committed to Git). Includes JSON backup export/import and instant permanent account deletion.
* **🔍 Live AniList GraphQL Catalog:** Instant autocomplete search, real community scores, rankings, seasonal airing countdowns, studios, voice cast (Seiyuu), franchise relations, and verified official links.
* **📋 Personal Watchlist Tracker:** Track titles across `Watching`, `Planning`, `Completed`, `Rewatching`, `Paused`, and `Dropped` with episode counters and personal 1–10 scoring.
* **🎬 Official Trailer Embeds & Random Picker:** Privacy-enhanced YouTube (`youtube-nocookie.com`) trailer modal and a Random Anime Picker powered by live AniList rankings.

---

## ⚡ Local Development Quick Start

### Prerequisites
- **Node.js**: `v18.0+` or `v20.0+`
- **npm**: `v9.0+`

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/PurohitBhagyesh/anime-watch-recommendation.git
cd anime-watch-recommendation

# Copy environment template
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

> **Note on API Keys**: Sensitive API keys and credentials are never stored in plaintext inside the repository. For local development or custom deployments, populate `frontend/.env` with your own Firebase project credentials from the [Firebase Console](https://console.firebase.google.com).

### 2. One-Step Workspace Setup
```bash
npm run setup
```
*(Installs all dependencies across workspaces, generates the Prisma client, pushes the database schema, and seeds initial data).*

### 3. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```
* 🌐 **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* 🩺 **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🛠️ Independent Tier Management

You can run and manage each layer independently:

### Frontend Tier (`/frontend`)
```bash
cd frontend
npm run dev      # Start Vite dev server with Hot Module Replacement (HMR)
npm run build    # Type-check and produce optimized production bundle
npm run preview  # Preview production build locally
```

### Backend Tier (`/backend`)
```bash
cd backend
npm run dev        # Run API server with hot-reload (tsx)
npm run build      # Compile TypeScript to JavaScript
npm run start      # Launch compiled production server
npm run db:push    # Push Prisma schema changes to SQLite (dev.db)
npm run db:studio  # Open Prisma Studio visual database browser
```

---

## 📡 API Endpoints Reference

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Ping** | `GET` | `/ping` | Lightweight 200 OK for UptimeRobot keep-alive | No |
| **Health** | `GET` | `/api/health` | Service uptime and status metadata | No |
| **Auth** | `POST` | `/api/auth/register` | Register new account | No |
| **Auth** | `POST` | `/api/auth/login` | Login with credentials | No |
| **Auth** | `POST` | `/api/auth/demo` | Instant demo login session | No |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| **Anime** | `GET` | `/api/anime/trending` | Top community trending titles | No |
| **Anime** | `GET` | `/api/anime/seasonal` | Airing seasonal releases | No |
| **Anime** | `GET` | `/api/anime/top` | Top 100 highest rated anime | No |
| **Anime** | `GET` | `/api/anime/popular` | All-time most popular anime | No |
| **Anime** | `GET` | `/api/anime/search` | Multi-parameter search with filters | No |
| **Anime** | `GET` | `/api/anime/:id` | Full details, cast, official links, trailer | No |
| **Watchlist** | `GET` | `/api/watchlist` | Fetch user watchlist | Optional |
| **Watchlist** | `POST` | `/api/watchlist` | Add or update watchlist item | Optional |
| **Watchlist** | `PATCH`| `/api/watchlist/:id/progress` | Quick episode count increment | Optional |
| **Watchlist** | `DELETE`| `/api/watchlist/:id` | Remove item from watchlist | Optional |
| **Watchlist** | `POST` | `/api/watchlist/export` | Export watchlist JSON payload | Optional |
| **Watchlist** | `POST` | `/api/watchlist/import` | Import watchlist items | Optional |
| **Recommendations** | `GET` | `/api/recommendations/personalized` | AI/Genre-affinity recommendations | Optional |
| **Reviews** | `GET` | `/api/reviews/anime/:id` | Fetch community reviews for anime | No |
| **Reviews** | `POST` | `/api/reviews` | Post a user review and rating | Yes (Bearer) |

---

## 🔒 Security & Best Practices

* **Decoupled Environment Variables:** No credentials, tokens, or private keys are exposed in git tracking.
* **Obfuscated Fallbacks:** Runtime fallbacks prevent automated secret scraping while keeping the deployed web client online.
* **Password Hashing:** Salted `bcrypt` hashing with signed JWT authentication tokens on the Express backend.
* **Client-Side Resilience:** LocalStorage sync with automatic fallback ensures watchlists remain available offline.
* **Zero Telemetry / Privacy First:** Clean, ad-free interface without user-tracking scripts.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
