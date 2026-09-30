import { prisma } from '../config/db';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { id: 'usr_demo_101' },
    update: {},
    create: {
      id: 'usr_demo_101',
      username: 'OtakuMaster',
      email: 'otakumaster@animesenpai.io',
      passwordHash: '$2a$10$wN3H0978943719873948712398712938712938172938712938712',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
      bio: 'Anime enthusiast exploring new seasonal gems and 90s cyberpunk classics.',
      favoriteGenre: 'Sci-Fi / Psychological',
    },
  });

  console.log(`👤 Seeded demo user: ${demoUser.username}`);

  // 2. Seed Sample Watchlist Items
  const sampleItems = [
    {
      userId: demoUser.id,
      animeId: 16498,
      title: 'Attack on Titan',
      romajiTitle: 'Shingeki no Kyojin',
      coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiDY.png',
      bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmnei.jpg',
      format: 'TV',
      status: 'completed',
      currentEpisode: 25,
      totalEpisodes: 25,
      userRating: 9.5,
      notes: 'Masterpiece soundtrack and world-building.',
      genres: JSON.stringify(['Action', 'Drama', 'Fantasy', 'Mystery']),
    },
    {
      userId: demoUser.id,
      animeId: 11061,
      title: 'Hunter x Hunter (2011)',
      romajiTitle: 'Hunter x Hunter (2011)',
      coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-sA1uF0e1gYyv.png',
      bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/11061-129gM6e7Fh3v.jpg',
      format: 'TV',
      status: 'watching',
      currentEpisode: 131,
      totalEpisodes: 148,
      userRating: 10.0,
      notes: 'Chimera Ant arc is peak shonen fiction.',
      genres: JSON.stringify(['Action', 'Adventure', 'Fantasy']),
    },
    {
      userId: demoUser.id,
      animeId: 154587,
      title: 'Frieren: Beyond Journey\'s End',
      romajiTitle: 'Sousou no Frieren',
      coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-3W7bV5f4fCge.jpg',
      bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-dr6vT4f6jQer.jpg',
      format: 'TV',
      status: 'completed',
      currentEpisode: 28,
      totalEpisodes: 28,
      userRating: 10.0,
      notes: 'Unbelievably poignant storytelling and stellar animation by Madhouse.',
      genres: JSON.stringify(['Adventure', 'Drama', 'Fantasy']),
    },
    {
      userId: demoUser.id,
      animeId: 171010,
      title: 'Solo Leveling Season 2 -Arise from the Shadow-',
      romajiTitle: 'Ore dake Level Up na Ken Season 2: Arise from the Shadow',
      coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171010-8JzC9bVzXG2n.jpg',
      bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/171010-3W8bQ4k9xZ1m.jpg',
      format: 'TV',
      status: 'watching',
      currentEpisode: 8,
      totalEpisodes: 12,
      userRating: 8.8,
      notes: 'High adrenaline fight sequences and sound design.',
      genres: JSON.stringify(['Action', 'Adventure', 'Fantasy']),
    },
  ];

  for (const item of sampleItems) {
    await prisma.watchlistItem.upsert({
      where: {
        userId_animeId: {
          userId: item.userId,
          animeId: item.animeId,
        },
      },
      update: {},
      create: item,
    });
  }

  console.log(`📋 Seeded ${sampleItems.length} watchlist items.`);

  // 3. Seed Reviews
  const sampleReviews = [
    {
      userId: demoUser.id,
      animeId: 154587,
      rating: 10,
      reviewText: 'Frieren is a sublime journey meditating on time, memory, and companionship. The direction and soundtrack are unmatched in modern anime.',
      likesCount: 42,
    },
  ];

  for (const rev of sampleReviews) {
    await prisma.review.create({
      data: rev,
    });
  }

  console.log(`⭐ Seeded ${sampleReviews.length} community reviews.`);
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
