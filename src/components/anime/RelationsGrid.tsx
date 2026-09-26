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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GitFork className="w-4 h-4 text-[#3db4f2]" />
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
          Franchise Relations
        </h3>
        <span className="text-xs text-[#3db4f2] ml-auto font-mono font-bold">{validRelations.length} Titles</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {validRelations.map((edge) => (
          <div key={`${edge.node.id}-${edge.relationType}`} className="flex flex-col gap-1.5">
            <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#151f2e] border border-white/10 text-[#3db4f2] text-center truncate">
              {formatRelationType(edge.relationType)}
            </div>
            <AnimeCard anime={edge.node} />
          </div>
        ))}
      </div>
    </div>
  );
};
