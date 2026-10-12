import React from 'react';
import { ExternalLink, Globe, ShieldCheck } from 'lucide-react';
import type { ExternalLink as ExternalLinkType } from '../../api/types';

interface OfficialResourcesProps {
  links: ExternalLinkType[];
}

export const OfficialResources: React.FC<OfficialResourcesProps> = ({ links }) => {
  const streamingSites = [
    'crunchyroll',
    'netflix',
    'hulu',
    'youtube',
    'amazon prime video',
    'amazon',
    'funimation',
    'bilibili',
    'disney plus',
    'disney+',
    'hidive',
    'vrv',
    'tubi tv',
    'pluto tv',
    'animelab',
  ];

  // Filter out any streaming service links, retaining official site and external resource links
  const resourceLinks = links.filter(
    (link) => !streamingSites.some((site) => link.site.toLowerCase().includes(site))
  );

  if (resourceLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-[#3db4f2]" />
        <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
          Official Links & Resources
        </h2>
        <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold ml-auto">
          <ShieldCheck className="w-3 h-3" />
          Verified Links
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {resourceLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3.5 py-2 rounded-xl bg-[#151f2e] hover:bg-[#1f2c3f] text-slate-200 hover:text-[#3db4f2] border border-white/10 flex items-center gap-2 transition shadow-sm font-semibold"
          >
            {link.icon ? (
              <img src={link.icon} alt="" className="w-4 h-4 rounded object-contain" loading="lazy" />
            ) : (
              <Globe className="w-3.5 h-3.5 opacity-70" />
            )}
            <span>{link.site}</span>
            <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
};
