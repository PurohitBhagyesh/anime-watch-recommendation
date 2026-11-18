import React from 'react';
import { ThumbsUp } from 'lucide-react';
import type { AnimeRecommendation } from '../../api/types';
import { AnimeCard } from '../common/AnimeCard';

interface RecommendationsGridProps {
  recommendations: AnimeRecommendation[];
}

export const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({
  recommendations,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  const validRecs = recommendations
    .map((r) => r.mediaRecommendation)
    .filter((r): r is NonNullable<typeof r> => r !== null && Boolean(r.id));

  if (validRecs.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ThumbsUp aria-hidden="true" className="w-4 h-4 text-white" />
        <h2 className="text-sm font-bold text-white tracking-tight">
          Community Recommendations
        </h2>
        <span className="text-xs text-[#666672] ml-auto font-mono">Similar Titles</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {validRecs.slice(0, 12).map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
};
