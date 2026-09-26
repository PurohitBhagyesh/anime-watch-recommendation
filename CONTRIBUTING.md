# Contributing to Voltaku

Thank you for your interest in contributing to Voltaku! We welcome bug reports, feature suggestions, and code contributions.

---

## Code of Conduct

Please be respectful, constructive, and kind in all issues, pull requests, and discussions.

---

## Development Workflow

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/<your-username>/anime-watch-recommendation.git
   cd anime-watch-recommendation
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Local Development Server:**
   ```bash
   npm run dev
   ```

4. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Test Your Changes:**
   Ensure the TypeScript compilation and production build pass with zero errors:
   ```bash
   npm run build
   ```

6. **Submit a Pull Request:**
   Push your branch to your fork and submit a Pull Request targeting the `main` branch with a clear description of your changes.

---

## Coding Standards

- **TypeScript:** Use strict types and type-only imports (`import type { ... }`).
- **Styling:** Follow the Apple UI glassmorphism design tokens defined in `src/index.css`.
- **API Cleanliness:** Respect AniList GraphQL rate limits and keep network queries optimized.
- **Copy:** Maintain clean, direct product copy without fluff or emoji spam in form controls.
