# Voltaku — Database Layer

This directory contains the database definitions, Prisma ORM schema, SQL DDL migrations, initial seed datasets, and optional Docker orchestration.

---

## 🗄️ Database Architecture

The default setup uses **SQLite** (embedded, zero-configuration local database stored at `backend/prisma/dev.db` or `database/dev.db`), powered by **Prisma ORM**.

It is also fully compatible with **PostgreSQL** by updating `provider = "postgresql"` in `prisma/schema.prisma` and running the included `docker-compose.yml`.

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ WATCHLIST_ITEMS : "tracks"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ ACTIVITY_LOGS : "generates"

    USERS {
        string id PK "UUID"
        string username "Unique"
        string email "Unique"
        string passwordHash
        string avatar
        string banner
        string bio
        string favoriteGenre
        datetime joinedDate
        datetime createdAt
        datetime updatedAt
    }

    WATCHLIST_ITEMS {
        string id PK "UUID"
        string userId FK
        int animeId "AniList Media ID"
        string title
        string romajiTitle
        string coverImage
        string bannerImage
        string format
        string status "watching | completed | plan_to_watch | dropped"
        int currentEpisode
        int totalEpisodes
        float userRating "1.0 - 10.0"
        string notes
        string genres "JSON String"
        datetime addedAt
        datetime updatedAt
    }

    ANIME_CACHE {
        int id PK "AniList ID"
        string titleRomaji
        string titleEnglish
        string coverImage
        string bannerImage
        string format
        string status
        int episodes
        int averageScore
        int popularity
        string genres "JSON"
        string description
        string externalLinks "JSON"
        datetime cachedAt
    }

    REVIEWS {
        string id PK "UUID"
        string userId FK
        int animeId
        int rating "1 - 10"
        string reviewText
        int likesCount
        datetime createdAt
    }

    ACTIVITY_LOGS {
        string id PK "UUID"
        string userId FK
        string action "WATCHED_EPISODE | REVIEWED"
        int animeId
        string metadata "JSON"
        datetime createdAt
    }
```

---

## 📁 Directory Structure

```
database/
├── prisma/
│   └── schema.prisma      # Prisma schema definitions (SQLite / PostgreSQL)
├── schema.sql             # Standard SQL DDL migration script
├── seeds.sql              # Initial demo users, watchlists, & reviews
├── docker-compose.yml     # Optional PostgreSQL & Redis container setup
└── README.md              # Database documentation (this file)
```

---

## 🚀 Quick Database Commands

From the project root or backend folder:

```bash
# Push schema to SQLite database
npx prisma db push --schema=../database/prisma/schema.prisma

# Launch visual Prisma Studio database manager
npx prisma studio --schema=../database/prisma/schema.prisma

# (Optional) Spin up Docker PostgreSQL & Redis
docker compose -f database/docker-compose.yml up -d
```
