import React from 'react';
import { Users, Mic } from 'lucide-react';
import type { CharacterEdge } from '../../api/types';

interface CharacterGridProps {
  characters: CharacterEdge[];
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users aria-hidden="true" className="w-4 h-4 text-white" />
        <h2 className="text-sm font-bold text-white tracking-tight">
          Characters & Voice Cast
        </h2>
        <span className="text-xs text-[#666672] ml-auto font-mono">Japanese Cast</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {characters.map((edge) => {
          const char = edge.node;
          const va = edge.voiceActors?.[0];

          return (
            <div
              key={`${char.id}-${va?.id || 'none'}`}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0b0b0d] border border-[#232329] hover:border-[#3a3a44] transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
                <img
                  src={char.image.medium || char.image.large}
                  alt={`${char.name.full} character portrait`}
                  width={44}
                  height={56}
                  loading="lazy"
                  className="w-9 h-12 sm:w-11 sm:h-14 rounded-xl object-cover bg-[#151519] flex-shrink-0 border border-[#232329]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate" title={char.name.full}>
                    {char.name.full}
                  </p>
                  <p className="text-[11px] text-[#9a9aa6] capitalize mt-0.5">
                    {edge.role.toLowerCase()}
                  </p>
                </div>
              </div>

              {va && (
                <div className="flex items-center gap-2 text-right pl-2 min-w-0 flex-1 justify-end border-l border-[#232329]">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#c8c8d2] truncate" title={va.name.full}>
                      {va.name.full}
                    </p>
                    <p className="text-[10px] text-[#666672] flex items-center justify-end gap-1 mt-0.5">
                      <Mic aria-hidden="true" className="w-2.5 h-2.5" />
                      <span>Japanese</span>
                    </p>
                  </div>
                  <img
                    src={va.image.medium || va.image.large}
                    alt={va.name.full}
                    loading="lazy"
                    className="w-9 h-12 sm:w-11 sm:h-14 rounded-xl object-cover bg-[#151519] flex-shrink-0 border border-[#232329]"
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
