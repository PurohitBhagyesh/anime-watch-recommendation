export type AnimeFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
export type AnimeStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export type WatchlistStatus = 'watching' | 'plan_to_watch' | 'completed' | 'dropped' | 'favorite';

export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string | null;
  userPreferred: string;
}

export interface AnimeCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface AnimeStudio {
  id: number;
  name: string;
  siteUrl: string | null;
}

export interface AnimeTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export interface ExternalLink {
  id: number;
  url: string;
  site: string;
  icon: string | null;
  color: string | null;
}

export interface StreamingEpisode {
  title: string;
  thumbnail: string | null;
  url: string;
  site: string;
}

export interface CharacterVoiceActor {
  id: number;
  name: {
    full: string;
    native: string | null;
  };
  image: {
    large: string;
    medium: string;
  };
  languageV2: string;
}

export interface CharacterEdge {
  role: string;
  node: {
    id: number;
    name: {
      full: string;
      native: string | null;
    };
    image: {
      large: string;
      medium: string;
    };
  };
  voiceActors: CharacterVoiceActor[];
}

export interface RelatedAnimeEdge {
  relationType: string;
  node: AnimeCardData;
}

export interface AnimeRecommendation {
  mediaRecommendation: AnimeCardData | null;
}

export interface NextAiringEpisode {
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
}

export interface AnimeCardData {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  format: AnimeFormat | null;
  status: AnimeStatus | null;
  episodes: number | null;
  duration: number | null;
  season: AnimeSeason | null;
  seasonYear: number | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  genres: string[];
  description: string | null;
  studios?: {
    nodes: AnimeStudio[];
  };
  nextAiringEpisode?: NextAiringEpisode | null;
  trailer?: AnimeTrailer | null;
}

export interface AnimeDetailsData extends AnimeCardData {
  synonyms: string[];
  source: string | null;
  hashtag: string | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  externalLinks: ExternalLink[];
  streamingEpisodes: StreamingEpisode[];
  characters: {
    edges: CharacterEdge[];
  };
  relations: {
    edges: RelatedAnimeEdge[];
  };
  recommendations: {
    nodes: AnimeRecommendation[];
  };
  rankings: Array<{
    id: number;
    rank: number;
    type: string;
    context: string;
    year: number | null;
    season: string | null;
    allTime: boolean;
  }>;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AnimePageResponse {
  pageInfo: PageInfo;
  media: AnimeCardData[];
}

export interface WatchlistItem {
  anime: AnimeCardData;
  status: WatchlistStatus;
  userRating?: number; // 1 to 10
  currentEpisode?: number;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}
