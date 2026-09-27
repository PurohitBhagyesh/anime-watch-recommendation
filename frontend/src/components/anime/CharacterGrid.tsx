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
        <Users className="w-4 h-4 text-[#3db4f2]" />
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
          Characters & Voice Cast
        </h3>
        <span className="text-xs text-[#3db4f2] ml-auto font-bold">Japanese Cast</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {characters.map((edge) => {
          const char = edge.node;
          const va = edge.voiceActors?.[0];

          return (
            <div
              key={`${char.id}-${va?.id || 'none'}`}
              className="flex items-center justify-between p-2 rounded-xl anilist-table-row transition"
            >
              {/* Character Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <img
                  src={char.image.medium || char.image.large}
                  alt={char.name.full}
                  loading="lazy"
                  className="w-11 h-14 rounded-lg object-cover bg-[#0b1622] flex-shrink-0"
                />
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-100 truncate" title={char.name.full}>
                    {char.name.full}
                  </p>
                  <p className="text-[10px] text-[#3db4f2] capitalize font-semibold">
                    {edge.role.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Voice Actor Info */}
              {va && (
                <div className="flex items-center gap-2 text-right pl-2 min-w-0 flex-1 justify-end">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate" title={va.name.full}>
                      {va.name.full}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5 font-medium">
                      <Mic className="w-2.5 h-2.5 text-[#3db4f2]" />
                      <span>Japanese</span>
                    </p>
                  </div>
                  <img
                    src={va.image.medium || va.image.large}
                    alt={va.name.full}
                    loading="lazy"
                    className="w-11 h-14 rounded-lg object-cover bg-[#0b1622] flex-shrink-0"
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

