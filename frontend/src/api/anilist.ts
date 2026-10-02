import type { AnimeCardData, AnimeDetailsData, AnimePageResponse, AnimeSeason } from './types';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

// Helper to get current anime season
export function getCurrentSeason(): { season: AnimeSeason; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1 - 12
  const year = now.getFullYear();

  let season: AnimeSeason = 'WINTER';
  if (month >= 3 && month <= 5) {
    season = 'SPRING';
  } else if (month >= 6 && month <= 8) {
    season = 'SUMMER';
  } else if (month >= 9 && month <= 11) {
    season = 'FALL';
  } else {
    season = 'WINTER';
  }

  return { season, year };
}

// Common Fragment for Anime Cards
const CARD_FRAGMENT = `
  id
  title {
    romaji
    english
    native
    userPreferred
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  format
  status
  episodes
  duration
  season
  seasonYear
  averageScore
  meanScore
  popularity
  favourites
  genres
  description
  studios(isMain: true) {
    nodes {
      id
      name
      siteUrl
    }
  }
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
  trailer {
    id
    site
    thumbnail
  }
`;

// Helper GraphQL fetcher
async function fetchGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e: any) => e.message).join(', '));
  }

  return json.data;
}

export interface HomeSectionsData {
  spotlight: AnimeCardData | null;
  spotlights: AnimeCardData[];
  trending: AnimeCardData[];
  seasonal: AnimeCardData[];
  topRated: AnimeCardData[];
  popularAllTime: AnimeCardData[];
  upcoming: AnimeCardData[];
}

export async function fetchHomeData(): Promise<HomeSectionsData> {
  const { season, year } = getCurrentSeason();

  const query = `
    query (
      $season: MediaSeason,
      $seasonYear: Int
    ) {
      trending: Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: [TRENDING_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
      seasonal: Page(page: 1, perPage: 12) {
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
      topRated: Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: [SCORE_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
      popularAllTime: Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: [POPULARITY_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
      upcoming: Page(page: 1, perPage: 12) {
        media(type: ANIME, status: NOT_YET_RELEASED, sort: [POPULARITY_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchGraphQL<{
    trending: { media: AnimeCardData[] };
    seasonal: { media: AnimeCardData[] };
    topRated: { media: AnimeCardData[] };
    popularAllTime: { media: AnimeCardData[] };
    upcoming: { media: AnimeCardData[] };
  }>(query, { season, seasonYear: year });

  const trendingList = data.trending?.media || [];
  const validSpotlights = trendingList.filter((a) => a.bannerImage && a.description);
  const spotlights = validSpotlights.length > 0 ? validSpotlights.slice(0, 5) : trendingList.slice(0, 5);
  const spotlight = spotlights[0] || null;

  return {
    spotlight,
    spotlights,
    trending: trendingList,
    seasonal: data.seasonal?.media || [],
    topRated: data.topRated?.media || [],
    popularAllTime: data.popularAllTime?.media || [],
    upcoming: data.upcoming?.media || [],
  };
}

export async function searchAnimeAutocomplete(queryText: string): Promise<AnimeCardData[]> {
  if (!queryText || queryText.trim().length === 0) return [];

  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 6) {
        media(type: ANIME, search: $search, sort: [POPULARITY_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ Page: { media: AnimeCardData[] } }>(query, { search: queryText.trim() });
    return data.Page?.media || [];
  } catch (e) {
    console.error('Autocomplete error', e);
    return [];
  }
}

export async function fetchRandomAnime(): Promise<AnimeCardData | null> {
  const randomPage = Math.floor(Math.random() * 5) + 1; // page 1-5 of top scored
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 20) {
        media(type: ANIME, sort: [SCORE_DESC], isAdult: false) {
          ${CARD_FRAGMENT}
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ Page: { media: AnimeCardData[] } }>(query, { page: randomPage });
    const list = data.Page?.media || [];
    if (list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  } catch (e) {
    console.error('Random anime fetch error', e);
    return null;
  }
}

export interface SearchFilterParams {
  search?: string;
  genres?: string[];
  format?: string;
  status?: string;
  season?: string;
  seasonYear?: number;
  sort?: string[];
  page?: number;
  perPage?: number;
}

export async function searchAnime(params: SearchFilterParams = {}): Promise<AnimePageResponse> {
  const {
    search,
    genres,
    format,
    status,
    season,
    seasonYear,
    sort = ['TRENDING_DESC'],
    page = 1,
    perPage = 20,
  } = params;

  const query = `
    query (
      $page: Int,
      $perPage: Int,
      $search: String,
      $genre_in: [String],
      $format: MediaFormat,
      $status: MediaStatus,
      $season: MediaSeason,
      $seasonYear: Int,
      $sort: [MediaSort]
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(
          type: ANIME,
          search: $search,
          genre_in: $genre_in,
          format: $format,
          status: $status,
          season: $season,
          seasonYear: $seasonYear,
          sort: $sort,
          isAdult: false
        ) {
          ${CARD_FRAGMENT}
        }
      }
    }
  `;

  const variables: Record<string, any> = {
    page,
    perPage,
    sort,
  };

  if (search && search.trim() !== '') variables.search = search.trim();
  if (genres && genres.length > 0) variables.genre_in = genres;
  if (format) variables.format = format;
  if (status) variables.status = status;
  if (season) variables.season = season;
  if (seasonYear) variables.seasonYear = seasonYear;

  const data = await fetchGraphQL<{ Page: AnimePageResponse }>(query, variables);
  return data.Page;
}

export async function fetchAnimeDetails(id: number): Promise<AnimeDetailsData> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${CARD_FRAGMENT}
        synonyms
        source
        hashtag
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        externalLinks {
          id
          url
          site
          icon
          color
        }
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
        rankings {
          id
          rank
          type
          context
          year
          season
          allTime
        }
        characters(sort: [ROLE, RELEVANCE], perPage: 12) {
          edges {
            role
            node {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
            }
            voiceActors(language: JAPANESE) {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
              languageV2
            }
          }
        }
        relations {
          edges {
            relationType
            node {
              ${CARD_FRAGMENT}
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 10) {
          nodes {
            mediaRecommendation {
              ${CARD_FRAGMENT}
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ Media: AnimeDetailsData }>(query, { id });
  return data.Media;
}

export const GENRE_LIST = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'Slice of Life',
  'Supernatural',
  'Mystery',
  'Sports',
  'Psychological',
  'Thriller',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
];

export interface GenreMeta {
  name: string;
  totalEstimated: number;
  formattedCount: string;
  description: string;
}

export const GENRE_METADATA: Record<string, GenreMeta> = {
  Comedy: {
    name: 'Comedy',
    totalEstimated: 7850,
    formattedCount: '7,800+',
    description: 'Humor, gag, parodies, and lighthearted laughs',
  },
  Action: {
    name: 'Action',
    totalEstimated: 5240,
    formattedCount: '5,200+',
    description: 'High-intensity battles, martial arts, and adrenaline',
  },
  Fantasy: {
    name: 'Fantasy',
    totalEstimated: 4420,
    formattedCount: '4,400+',
    description: 'Magic, isekai worlds, mythological beasts, and quests',
  },
  Adventure: {
    name: 'Adventure',
    totalEstimated: 3950,
    formattedCount: '3,900+',
    description: 'Epic journeys, explorations, and expeditions',
  },
  'Sci-Fi': {
    name: 'Sci-Fi',
    totalEstimated: 3410,
    formattedCount: '3,400+',
    description: 'Futuristic technology, space exploration, and cyberpunk',
  },
  Drama: {
    name: 'Drama',
    totalEstimated: 3120,
    formattedCount: '3,100+',
    description: 'Emotional depth, human relationships, and conflict',
  },
  Romance: {
    name: 'Romance',
    totalEstimated: 2680,
    formattedCount: '2,600+',
    description: 'Love stories, romantic comedies, and heartfelt relationships',
  },
  'Slice of Life': {
    name: 'Slice of Life',
    totalEstimated: 2450,
    formattedCount: '2,400+',
    description: 'Everyday life, heartwarming moments, and relaxation',
  },
  Music: {
    name: 'Music',
    totalEstimated: 2210,
    formattedCount: '2,200+',
    description: 'Idols, bands, musical journeys, and performances',
  },
  Supernatural: {
    name: 'Supernatural',
    totalEstimated: 1940,
    formattedCount: '1,900+',
    description: 'Ghosts, spirits, vampires, demons, and occult powers',
  },
  Mecha: {
    name: 'Mecha',
    totalEstimated: 1350,
    formattedCount: '1,300+',
    description: 'Giant robotic suits, space warfare, and armored combat',
  },
  Mystery: {
    name: 'Mystery',
    totalEstimated: 1180,
    formattedCount: '1,100+',
    description: 'Detective cases, suspense, puzzles, and hidden truths',
  },
  Sports: {
    name: 'Sports',
    totalEstimated: 980,
    formattedCount: '950+',
    description: 'Athletic competitions, teamwork, and tournament battles',
  },
  Psychological: {
    name: 'Psychological',
    totalEstimated: 640,
    formattedCount: '600+',
    description: 'Mind games, mental battles, and dark dilemmas',
  },
  Horror: {
    name: 'Horror',
    totalEstimated: 560,
    formattedCount: '550+',
    description: 'Gore, psychological terror, monsters, and survival',
  },
  'Mahou Shoujo': {
    name: 'Mahou Shoujo',
    totalEstimated: 380,
    formattedCount: '350+',
    description: 'Magical girls, transformation spells, and guardian battles',
  },
  Thriller: {
    name: 'Thriller',
    totalEstimated: 190,
    formattedCount: '180+',
    description: 'High-stakes suspense, conspiracies, and tension',
  },
};
