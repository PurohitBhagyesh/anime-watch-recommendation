# AnimeSenpai — Frontend Application

Modern, monochrome luxury anime discovery, schedule tracking, and recommendation client built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## ✨ Key Features

* **3-Color Luxury UI (Obsidian · Platinum · Luminous Indigo):** Pure `#000000` / `#0c0c0f` dark surfaces, `#f5f5f7` / `#9a9aa6` typography, and `#5360e6` Luminous Indigo strictly reserved for primary actions and active states.
* **Art-Directed Clean Hero Banner:** Responsive `<picture>` framing (portrait on mobile `< 640px`, widescreen on desktop `>= 640px`) with swipe, trackpad gesture, keyboard arrow, and dot indicator controls (zero overlay `<` `>` arrow clutter) plus media-scoped LCP image preloading.
* **Smooth Motion & Rendering Efficiency:** CSS `linear()` physics-based spring easing, native CSS scroll-driven section reveals (`animation-timeline: view()`), `React.memo` cards & rows, native `loading="lazy"` + `fetchPriority="low"`, `content-visibility: auto`, and an 80-entry 5-minute GraphQL LRU cache with in-flight deduplication.
* **Pixel-Matched Cross-Device Skeletons:** 1:1 layout-matched skeletons (`HeroSkeleton`, `CarouselRowSkeleton`, `CardSkeleton`, `TableRowSkeleton`, `DetailsSkeleton`) aligned independently for mobile and desktop viewports.
* **Portal Previews & Hover-to-Open Widgets:** Viewport-clamped `createPortal` desktop hover preview cards and hover-to-open **Buy Me a Coffee** (UPI QR + PNG fallback) & minimal **Share** sheets with hover-intent timers.
* **Smart Catalog & Interactive Media View:** Real-time autocomplete search, multi-parameter filters, character voice actors (Seiyuu), franchise relations, official streaming links, and privacy-first `youtube-nocookie.com` trailers.
* **Watchlist & Pub/Sub Sync:** Real-time episode progress tracking (`+` / `-`), personal 1–10 ratings, status categorization, JSON export/import, and cross-tab sync via `BroadcastChannel`.
* **Firebase Auth, CAPTCHA & Rate Limiting:** Email/Password & Google OAuth sign-in, Cloud Firestore profile persistence, interactive `AuthCaptcha` verification, and persistent client-side progressive lockout protection.

---

## 🚀 Running Frontend Locally

```bash
# 1. Install dependencies
npm install

# 2. Run Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Lint codebase
npm run lint

# 5. Preview production bundle
npm run preview
```

The frontend will run at `http://localhost:5173`.
To configure the environment variables, copy `.env.example` to `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api

# Firebase Authentication & Cloud Firestore
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```
