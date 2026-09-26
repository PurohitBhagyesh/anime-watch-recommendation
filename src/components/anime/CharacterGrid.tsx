import React from 'react';
import { Users, Mic } from 'lucide-react';
import type { CharacterEdge } from '../../api/types';

interface CharacterGridProps {
  characters: CharacterEdge[];
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
          Characters & Voice Cast
        </h3>
        <span className="text-xs text-slate-400 ml-auto">Japanese Cast</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {characters.map((edge) => {
          const char = edge.node;
          const va = edge.voiceActors?.[0];

          return (
            <div
              key={`${char.id}-${va?.id || 'none'}`}
              className="flex items-center justify-between p-2 rounded-lg bg-[#111622] border border-[#1e2638] hover:border-blue-500/40 transition"
            >
              {/* Character Info */}
              <div className="flex items-center gap-2.5">
                <img
                  src={char.image.medium || char.image.large}
                  alt={char.name.full}
                  loading="lazy"
                  className="w-10 h-12 rounded object-cover bg-[#0a0d14] flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {char.name.full}
                  </p>
                  <p className="text-[10px] text-blue-400 capitalize">
                    {edge.role.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Voice Actor Info */}
              {va && (
                <div className="flex items-center gap-2 text-right pl-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">
                      {va.name.full}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center justify-end gap-0.5">
                      <Mic className="w-2.5 h-2.5 text-slate-400" />
                      VA
                    </p>
                  </div>
                  <img
                    src={va.image.medium || va.image.large}
                    alt={va.name.full}
                    loading="lazy"
                    className="w-10 h-12 rounded object-cover bg-[#0a0d14] flex-shrink-0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
