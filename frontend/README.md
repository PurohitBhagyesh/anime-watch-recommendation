# Voltaku — Frontend Application

Modern, Apple-inspired anime discovery, schedule tracking, and recommendation client built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## ✨ Key Features

* **Glassmorphic UI Design:** Apple Human Interface guidelines, ambient gradients, frosted acrylic cards.
* **Smart Catalog & Discovery:** Multi-parameter search by genre, format, status, season, and release year.
* **Interactive Media View:** Character voice actors (Seiyuu), franchise relations tree, official streaming links (Crunchyroll, Netflix, Hulu, Disney+), and privacy-enhanced trailer modal.
* **Watchlist & Episode Tracking:** Real-time episode progress increment (`+` / `-`), rating, status categorization, and JSON export/import.
* **Dual-Mode Persistence:** Works seamlessly connected to the Voltaku Express REST API or autonomously with client-side persistence fallback.

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
To configure the backend endpoint, update `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
