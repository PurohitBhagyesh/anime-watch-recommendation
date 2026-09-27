import axios from 'axios';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache<T>(key: string, data: T, ttlSeconds: number = 300): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

const ANIME_CARD_FRAGMENT = `
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

export async function fetchAniListGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  cacheTtl: number = 300
): Promise<T> {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = getFromCache<T>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.post(
      ANILIST_GRAPHQL_ENDPOINT,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 20000,
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0]?.message || 'GraphQL Query Error');
    }

    const data = response.data.data;
    if (cacheTtl > 0) {
      setInCache(cacheKey, data, cacheTtl);
    }
    return data;
  } catch (error: any) {
    console.error('AniList API fetch error:', error.message);
    throw error;
  }
}

export const anilistService = {
  // Get trending anime
  async getTrending(page: number = 1, perPage: number = 20) {
    const query = `
      query GetTrending($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
            ${ANIME_CARD_FRAGMENT}
          }
        }
      }
    `;
    return fetchAniListGraphQL(query, { page, perPage }, 600);
  },

  // Get current seasonal anime
  async getSeasonal(season: string, seasonYear: number, page: number = 1, perPage: number = 20) {
    const query = `
      query GetSeasonal($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, isAdult: false) {
            ${ANIME_CARD_FRAGMENT}
          }
        }
      }
    `;
    return fetchAniListGraphQL(query, { season, seasonYear, page, perPage }, 600);
  },

  // Get top 100 highest rated
  async getTop100(page: number = 1, perPage: number = 20) {
    const query = `
      query GetTop100($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
            ${ANIME_CARD_FRAGMENT}
          }
        }
      }
    `;
    return fetchAniListGraphQL(query, { page, perPage }, 900);
  },

  // Get popular anime
  async getPopular(page: number = 1, perPage: number = 20) {
    const query = `
      query GetPopular($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
            ${ANIME_CARD_FRAGMENT}
          }
        }
      }
    `;
    return fetchAniListGraphQL(query, { page, perPage }, 900);
  },

  // Search anime with filters
  async searchAnime(filters: {
    search?: string;
    genres?: string[];
    format?: string;
    status?: string;
    season?: string;
    seasonYear?: number;
    sort?: string[];
    page?: number;
    perPage?: number;
  }) {
    const query = `
      query SearchAnime(
        $search: String,
        $genre_in: [String],
        $format: MediaFormat,
        $status: MediaStatus,
        $season: MediaSeason,
        $seasonYear: Int,
        $sort: [MediaSort],
        $page: Int,
        $perPage: Int
      ) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
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
            ${ANIME_CARD_FRAGMENT}
          }
        }
      }
    `;

    const variables: Record<string, any> = {
      page: filters.page || 1,
      perPage: filters.perPage || 24,
      sort: filters.sort || ['POPULARITY_DESC'],
    };

    if (filters.search) variables.search = filters.search;
    if (filters.genres && filters.genres.length > 0) variables.genre_in = filters.genres;
    if (filters.format) variables.format = filters.format;
    if (filters.status) variables.status = filters.status;
    if (filters.season) variables.season = filters.season;
    if (filters.seasonYear) variables.seasonYear = filters.seasonYear;

    return fetchAniListGraphQL(query, variables, 300);
  },

  // Get anime details by ID
  async getAnimeDetails(id: number) {
    const query = `
      query GetAnimeDetails($id: Int) {
        Media(id: $id, type: ANIME) {
          ${ANIME_CARD_FRAGMENT}
          synonyms
          source
          hashtag
          startDate { year month day }
          endDate { year month day }
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
          characters(sort: [ROLE, RELEVANCE], perPage: 12) {
            edges {
              role
              node {
                id
                name { full native }
                image { large medium }
              }
              voiceActors(language: JAPANESE) {
                id
                name { full native }
                image { large medium }
                languageV2
              }
            }
          }
          relations {
            edges {
              relationType
              node {
                ${ANIME_CARD_FRAGMENT}
              }
            }
          }
          recommendations(sort: [RATING_DESC], perPage: 10) {
            nodes {
              mediaRecommendation {
                ${ANIME_CARD_FRAGMENT}
              }
            }
          }
          rankings {
            id
            rank
            type
            format
            year
            season
            allTime
            context
          }
        }
      }
    `;
    return fetchAniListGraphQL(query, { id }, 900);
  },
};
