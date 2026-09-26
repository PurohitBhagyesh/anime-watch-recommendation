import React from 'react';
import { ExternalLink, PlayCircle, ShieldCheck } from 'lucide-react';
import type { ExternalLink as ExternalLinkType } from '../../api/types';

interface StreamingPlatformsProps {
  links: ExternalLinkType[];
}

export const StreamingPlatforms: React.FC<StreamingPlatformsProps> = ({ links }) => {
  const streamingSites = [
    'Crunchyroll',
    'Netflix',
    'Hulu',
    'YouTube',
    'Amazon Prime Video',
    'Funimation',
    'Bilibili',
    'Disney Plus',
    'HIDIVE',
    'VRV',
    'Tubi TV',
    'Pluto TV',
    'AnimeLab',
  ];

  const streamLinks = links.filter((link) =>
    streamingSites.some((site) => link.site.toLowerCase().includes(site.toLowerCase()))
  );

  const otherLinks = links.filter(
    (link) => !streamingSites.some((site) => link.site.toLowerCase().includes(site.toLowerCase()))
  );

  if (links.length === 0) {
    return (
      <div className="p-4 rounded-xl royal-card-static text-center text-slate-400 text-xs">
        No official streaming links indexed for this anime yet.
      </div>
    );
  }

  const getSiteColor = (site: string) => {
    const s = site.toLowerCase();
    if (s.includes('crunchyroll')) return 'bg-[#f47521] hover:bg-[#ff8433] text-black font-black';
    if (s.includes('netflix')) return 'bg-[#e50914] hover:bg-[#f40612] text-white font-black';
    if (s.includes('hulu')) return 'bg-[#1ce783] hover:bg-[#25f791] text-black font-black';
    if (s.includes('youtube')) return 'bg-[#ff0000] hover:bg-[#ff2626] text-white font-black';
    if (s.includes('disney')) return 'bg-[#113ccf] hover:bg-[#1f4bf3] text-white font-black';
    if (s.includes('amazon')) return 'bg-[#00a8e1] hover:bg-[#1cbcf7] text-white font-black';
    if (s.includes('hidive')) return 'bg-[#00b2ff] hover:bg-[#2bc0ff] text-black font-black';
    return 'bg-[#0e1528] hover:bg-[#182544] text-slate-200 border border-white/10 font-bold';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PlayCircle className="w-4 h-4 text-[#818cf8]" />
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
          Where to Stream
        </h3>
        <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold ml-auto">
          <ShieldCheck className="w-3 h-3" />
          Official Links
        </span>
      </div>

      {streamLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {streamLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-xl ${getSiteColor(
                link.site
              )} text-xs sm:text-sm flex items-center justify-between transition shadow-md`}
            >
              <div className="flex items-center gap-2">
                {link.icon ? (
                  <img src={link.icon} alt="" className="w-4 h-4 rounded object-contain" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                <span>{link.site}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No direct streaming partner badges found.</p>
      )}

      {/* Official Media & Socials */}
      {otherLinks.length > 0 && (
        <div className="pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
            Official Links & External Resources
          </span>
          <div className="flex flex-wrap gap-1.5">
            {otherLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-[#0e1528] hover:bg-[#182544] text-slate-200 hover:text-[#818cf8] border border-white/10 flex items-center gap-1.5 transition font-semibold"
              >
                {link.icon && <img src={link.icon} alt="" className="w-3.5 h-3.5 rounded object-contain" />}
                <span>{link.site}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
