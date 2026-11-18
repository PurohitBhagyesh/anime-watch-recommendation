import React from 'react';
import { GitFork } from 'lucide-react';
import type { RelatedAnimeEdge } from '../../api/types';
import { AnimeCard } from '../common/AnimeCard';

interface RelationsGridProps {
  relations: RelatedAnimeEdge[];
}

export const RelationsGrid: React.FC<RelationsGridProps> = ({ relations }) => {
  if (!relations || relations.length === 0) return null;

  const validRelations = relations.filter((edge) => edge.node && edge.node.id);
  if (validRelations.length === 0) return null;

  const formatRelationType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitFork aria-hidden="true" className="w-4 h-4 text-white" />
        <h2 className="text-sm font-bold text-white tracking-tight">
          Franchise Relations
        </h2>
        <span className="text-xs text-[#666672] ml-auto font-mono tabular-nums">
          {validRelations.length} Titles
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {validRelations.map((edge) => (
          <div key={`${edge.node.id}-${edge.relationType}`} className="flex flex-col gap-1.5">
            <div className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2.5 py-1 rounded-full bg-[#151519] border border-[#232329] text-[#c8c8d2] text-center truncate">
              {formatRelationType(edge.relationType)}
            </div>
            <AnimeCard anime={edge.node} />
          </div>
        ))}
      </div>
    </div>
  );
};
