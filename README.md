# AnimePulse — Anime Discovery & Tracking Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GraphQL](https://img.shields.io/badge/API-AniList_GraphQL-E10098?logo=graphql&logoColor=white)](https://anilist.co)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AnimePulse** is a modern, privacy-focused anime discovery platform and personal watchlist tracker built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and the **AniList GraphQL API**, featuring an **Apple Human Interface-inspired frosted glass UI**.

---

## ✨ Features

- 🌟 **Spotlight Hero Banner:** Features the #1 trending title with dynamic banner backdrop, score badges, and direct YouTube trailer modal.
- ⚡ **Real-Time AniList GraphQL Data:** Instant access to thousands of anime titles, airing schedules, and high-resolution assets with zero rate limiting.
- 🧭 **Multi-Parameter Discovery Engine:** Filter catalog by genre, broadcast season, format (TV, Movie, OVA, Special), release year, or keyword search.
- 🍿 **Verified Streaming Availability:** Direct outlinks to legitimate official streaming partners (Crunchyroll, Netflix, Hulu, Disney+, Amazon Prime Video, HIDIVE).
- 🎙️ **Characters & Voice Cast:** Japanese voice actors (Seiyuu) mapped directly to character roles.
- 🔗 **Franchise Relations:** Prequels, sequels, spin-offs, and community recommendations.
- 📱 **Device Adaptive / Mobile-First Design:** Features an iOS-style floating bottom tab bar on mobile and a frosted glass top navbar on desktop.
- 🔒 **Privacy-First Watchlist:** Complete watchlist tracking (Watching, Plan to Watch, Completed, Favorites) stored in `localStorage` with JSON export/import backup.
- ⚖️ **Compliance Ready:** Dedicated, real Privacy Policy (`/privacy`) and Terms of Service (`/terms`) pages.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool & Bundler** | Vite 8 |
| **Styling & Design System** | Tailwind CSS v4 + Apple UI Frosted Glass Tokens |
| **Routing** | React Router DOM v7 |
| **Icons** | Lucide React |
| **API Integration** | AniList Public GraphQL Endpoint |
| **State & Storage** | React Context API + Client `localStorage` |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- `npm` or `pnpm`

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PurohitBhagyesh/anime-watch-recommendation.git
   cd anime-watch-recommendation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 📂 Project Structure

```text
anime-watch-recommendation/
├── src/
│   ├── api/
│   │   ├── anilist.ts            # GraphQL client & query fetchers
│   │   └── types.ts              # TypeScript interfaces for media, cast, streaming
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx        # Desktop frosted glass navigation bar
│   │   │   ├── BottomTabBar.tsx  # Mobile iOS-style tab bar navigation
│   │   │   ├── Footer.tsx        # Directory footer with legal links
│   │   │   ├── AnimeCard.tsx     # Poster card with score & quick-add popover
│   │   │   ├── TrailerModal.tsx  # YouTube iframe trailer modal
│   │   │   └── Skeleton.tsx      # Shimmer loading cards & hero
│   │   ├── home/
│   │   │   ├── HeroBanner.tsx    # Hero spotlight with trailer trigger
│   │   │   ├── CarouselRow.tsx   # Smooth horizontal scroll row
│   │   │   └── GenreGrid.tsx     # Visual genre exploration cards
│   │   └── anime/
│   │       ├── StreamingPlatforms.tsx # Verified streaming partner badges
│   │       ├── EpisodesGrid.tsx       # Episode clips & stream links
│   │       ├── CharacterGrid.tsx      # Characters & Japanese voice actors
│   │       ├── RelationsGrid.tsx      # Franchise prequels & sequels
│   │       └── RecommendationsGrid.tsx# Community suggestions
│   ├── context/
│   │   └── WatchlistContext.tsx   # Persistent watchlist provider & JSON export
│   ├── pages/
│   │   ├── HomePage.tsx           # Home dashboard
│   │   ├── DiscoverPage.tsx       # Advanced search & filter catalog
│   │   ├── AnimeDetailsPage.tsx   # Deep profile & streaming sources
│   │   ├── WatchlistPage.tsx      # Personal library & episode counter
│   │   ├── PrivacyPage.tsx        # Privacy policy
│   │   └── TermsPage.tsx          # Terms of service
│   ├── App.tsx                    # Route definitions & layout wrapper
│   ├── main.tsx                   # React root mount
│   └── index.css                  # Apple UI design system & glassmorphism
├── package.json
├── tsconfig.json
├── vite.config.ts
├── PRD.md                         # Product Requirements Document
├── CONTRIBUTING.md                # Contribution guidelines
└── LICENSE                        # MIT License
```

---

## 📄 Documentation

For full product specifications, user stories, and architecture diagrams, check out the [Product Requirements Document (`PRD.md`)](./PRD.md).

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE). All anime metadata and imagery belong to their respective creators, publishers, and studios under fair use.
