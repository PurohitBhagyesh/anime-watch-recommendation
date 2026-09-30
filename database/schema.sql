-- =========================================================
-- AnimeSenpai Anime Discovery & Recommendation Engine Database DDL
-- Target: SQLite 3 / PostgreSQL Compatible Schema
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    avatar TEXT,
    banner TEXT,
    bio TEXT,
    favorite_genre TEXT DEFAULT 'Action',
    joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Watchlist Items Table
CREATE TABLE IF NOT EXISTS watchlist_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    anime_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    romaji_title TEXT,
    cover_image TEXT,
    banner_image TEXT,
    format TEXT DEFAULT 'TV',
    status TEXT NOT NULL DEFAULT 'watching', -- 'watching', 'plan_to_watch', 'completed', 'favorite', 'dropped', 'paused'
    current_episode INTEGER NOT NULL DEFAULT 0,
    total_episodes INTEGER DEFAULT 0,
    user_rating REAL, -- 1.0 to 10.0
    notes TEXT,
    genres TEXT, -- JSON Array: '["Action", "Sci-Fi"]'
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, anime_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_status ON watchlist_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_watchlist_anime_id ON watchlist_items(anime_id);

-- 3. Anime Cache Table (Reduces external AniList rate-limiting)
CREATE TABLE IF NOT EXISTS anime_cache (
    id INTEGER PRIMARY KEY, -- AniList Media ID
    title_english TEXT,
    title_romaji TEXT NOT NULL,
    title_native TEXT,
    cover_image TEXT NOT NULL,
    banner_image TEXT,
    format TEXT,
    status TEXT,
    episodes INTEGER,
    duration INTEGER,
    season TEXT,
    season_year INTEGER,
    average_score INTEGER,
    popularity INTEGER,
    favourites INTEGER,
    genres TEXT NOT NULL, -- JSON Array
    description TEXT,
    studios TEXT, -- JSON Array
    external_links TEXT, -- JSON Array
    trailer_url TEXT,
    details_json TEXT, -- Full Raw GraphQL JSON
    cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anime_cache_popularity ON anime_cache(popularity);
CREATE INDEX IF NOT EXISTS idx_anime_cache_average_score ON anime_cache(average_score);

-- 4. Reviews & Community Ratings Table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    anime_id INTEGER NOT NULL,
    rating INTEGER NOT NULL, -- 1 to 10
    review_text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_anime_id ON reviews(anime_id);

-- 5. User Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'WATCHED_EPISODE', 'ADDED_TO_WATCHLIST', 'UPDATED_SCORE', 'REVIEWED'
    anime_id INTEGER NOT NULL,
    metadata TEXT, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity_logs(user_id, created_at);
