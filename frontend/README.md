# AnimeSenpai — Frontend Application

Modern, Apple-inspired anime discovery, schedule tracking, and recommendation client built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## ✨ Key Features

* **Glassmorphic UI Design:** Apple Human Interface guidelines, ambient gradients, frosted acrylic cards.
* **Smart Catalog & Discovery:** Multi-parameter search by genre, format, status, season, and release year.
* **Interactive Media View:** Character voice actors (Seiyuu), franchise relations tree, official streaming links (Crunchyroll, Netflix, Hulu, Disney+), and privacy-enhanced trailer modal.
* **Watchlist & Episode Tracking:** Real-time episode progress increment (`+` / `-`), rating, status categorization, and JSON export/import.
* **Firebase Authentication & Firestore:** Native Email/Password login, 1-Click Google Sign-In, and user profile persistence in Cloud Firestore.
* **Dual-Mode Persistence:** Works seamlessly connected to the AnimeSenpai Express REST API or autonomously with client-side persistence fallback.

---

## 🚀 Running Frontend Locally

```bash
# 1. Install dependencies
npm install

# 2. Run Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production bundle
npm run preview
```

The frontend will run at `http://localhost:5173`.
To configure the environment variables, copy `.env.example` to `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api

# Firebase Authentication & Firestore Config
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```
