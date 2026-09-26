import React from 'react';
import { Play, Tv, ExternalLink } from 'lucide-react';
import type { StreamingEpisode } from '../../api/types';

interface EpisodesGridProps {
  episodes: StreamingEpisode[];
  totalEpisodes?: number | null;
}

export const EpisodesGrid: React.FC<EpisodesGridProps> = ({ episodes, totalEpisodes }) => {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            Episodes
          </h3>
          {totalEpisodes && (
            <span className="text-xs text-slate-400 font-mono">Total: {totalEpisodes}</span>
          )}
        </div>
        <div className="p-4 rounded-lg bg-[#111622] border border-[#1e2638] text-center text-slate-400 text-xs">
          Episode clips are not directly hosted for this title. Refer to the streaming providers above.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tv className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
          Episodes & Clips
        </h3>
        <span className="text-xs text-slate-400 ml-auto font-mono">
          {episodes.length} Available {totalEpisodes ? `of ${totalEpisodes}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {episodes.map((ep, idx) => (
          <a
            key={`${ep.url}-${idx}`}
            href={ep.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg bg-[#111622] border border-[#1e2638] overflow-hidden hover:border-blue-500/50 transition-colors"
          >
            {/* Episode Thumbnail */}
            <div className="relative aspect-video w-full bg-[#0a0d14] overflow-hidden">
              {ep.thumbnail ? (
                <img
                  src={ep.thumbnail}
                  alt={ep.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0a0d14] text-slate-600">
                  <Tv className="w-6 h-6" />
                </div>
              )}
              {/* Play overlay button */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Site badge */}
              {ep.site && (
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-slate-200 font-medium">
                  {ep.site}
                </div>
              )}
            </div>

            {/* Episode Title */}
            <div className="p-2.5">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 line-clamp-1 transition">
                {ep.title || `Episode ${idx + 1}`}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Watch Stream</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
