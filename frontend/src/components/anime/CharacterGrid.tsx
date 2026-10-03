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
        <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
          Characters & Voice Cast
        </h2>
        <span className="text-[11px] text-[#3db4f2] ml-auto font-semibold">Japanese Cast</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {characters.map((edge) => {
          const char = edge.node;
          const va = edge.voiceActors?.[0];

          return (
            <div
              key={`${char.id}-${va?.id || 'none'}`}
              className="flex items-center justify-between p-2 rounded-xl bg-[#151f2e] border border-white/[0.06] hover:border-white/15 transition-all shadow-sm group"
            >
              {/* Character Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
                <img
                  src={char.image.medium || char.image.large}
                  alt={`${char.name.full} character portrait`}
                  width={44}
                  height={56}
                  loading="lazy"
                  className="w-11 h-14 rounded-lg object-cover bg-[#0b1622] flex-shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#edf1f5] group-hover:text-[#3db4f2] transition truncate" title={char.name.full}>
                    {char.name.full}
                  </p>
                  <p className="text-[10px] text-[#3db4f2] capitalize font-medium mt-0.5">
                    {edge.role.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Voice Actor Info */}
              {va && (
                <div className="flex items-center gap-2 text-right pl-1.5 min-w-0 flex-1 justify-end border-l border-white/[0.04]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate" title={va.name.full}>
                      {va.name.full}
                    </p>
                    <p className="text-[10px] text-[#8ba0b2] flex items-center justify-end gap-1 font-medium mt-0.5">
                      <Mic className="w-2.5 h-2.5 text-[#3db4f2]" />
                      <span>Japanese</span>
                    </p>
                  </div>
                  <img
                    src={va.image.medium || va.image.large}
                    alt={va.name.full}
                    loading="lazy"
                    className="w-11 h-14 rounded-lg object-cover bg-[#0b1622] flex-shrink-0 shadow-sm"
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

