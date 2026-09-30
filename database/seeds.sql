-- =========================================================
-- AnimeSenpai Database Seed Data
-- =========================================================

-- Demo Users
INSERT OR REPLACE INTO users (id, username, email, password_hash, avatar, banner, bio, favorite_genre, joined_date)
VALUES 
(
    'usr_demo_101',
    'OtakuMaster',
    'otakumaster@animesenpai.io',
    '$2a$10$wN3H0978943719873948712398712938712938172938712938712', -- bcrypt hash for demo pass
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    'Anime enthusiast exploring new seasonal gems and 90s cyberpunk classics.',
    'Sci-Fi / Psychological',
    '2026-01-15 10:00:00'
),
(
    'usr_demo_102',
    'CyberSakura',
    'sakura@animesenpai.io',
    '$2a$10$wN3H0978943719873948712398712938712938172938712938712',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'Collecting beautiful OSTs, tracking romance and fantasy epics.',
    'Fantasy / Romance',
    '2026-03-20 14:30:00'
);

-- Demo Watchlist Items
INSERT OR REPLACE INTO watchlist_items (id, user_id, anime_id, title, romaji_title, cover_image, banner_image, format, status, current_episode, total_episodes, user_rating, notes, genres)
VALUES
(
    'wl_1',
    'usr_demo_101',
    16498,
    'Attack on Titan',
    'Shingeki no Kyojin',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiDY.png',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmnei.jpg',
    'TV',
    'completed',
    25,
    25,
    9.5,
    'Masterpiece soundtrack and world-building.',
    '["Action", "Drama", "Fantasy", "Mystery"]'
),
(
    'wl_2',
    'usr_demo_101',
    11061,
    'Hunter x Hunter (2011)',
    'Hunter x Hunter (2011)',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-sA1uF0e1gYyv.png',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/11061-129gM6e7Fh3v.jpg',
    'TV',
    'watching',
    131,
    148,
    10.0,
    'Chimera Ant arc is peak shonen fiction.',
    '["Action", "Adventure", "Fantasy"]'
),
(
    'wl_3',
    'usr_demo_101',
    154587,
    'Frieren: Beyond Journey''s End',
    'Sousou no Frieren',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-3W7bV5f4fCge.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-dr6vT4f6jQer.jpg',
    'TV',
    'completed',
    28,
    28,
    10.0,
    'Unbelievably poignant storytelling and stellar animation by Madhouse.',
    '["Adventure", "Drama", "Fantasy"]'
),
(
    'wl_4',
    'usr_demo_101',
    171010,
    'Solo Leveling Season 2 -Arise from the Shadow-',
    'Ore dake Level Up na Ken Season 2: Arise from the Shadow',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171010-8JzC9bVzXG2n.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/171010-3W8bQ4k9xZ1m.jpg',
    'TV',
    'watching',
    8,
    12,
    8.8,
    'High adrenaline fight sequences and sound design.',
    '["Action", "Adventure", "Fantasy"]'
);

-- Demo Reviews
INSERT OR REPLACE INTO reviews (id, user_id, anime_id, rating, review_text, likes_count)
VALUES
(
    'rev_1',
    'usr_demo_101',
    154587,
    10,
    'Frieren is a sublime journey meditating on time, memory, and companionship. The direction and soundtrack are unmatched in modern anime.',
    42
),
(
    'rev_2',
    'usr_demo_102',
    16498,
    9,
    'Intense storytelling with breathtaking twists right up to the final season. Highly recommended for any mystery/action lover.',
    28
);
