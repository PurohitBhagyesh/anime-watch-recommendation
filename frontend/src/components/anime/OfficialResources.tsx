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

  const resourceLinks = links.filter(
    (link) => !streamingSites.some((site) => link.site.toLowerCase().includes(site))
  );

  if (resourceLinks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Globe aria-hidden="true" className="w-4 h-4 text-white flex-shrink-0" />
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Official Links & Resources
        </h2>
        <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-[#4ade80] font-semibold sm:ml-auto">
          <ShieldCheck aria-hidden="true" className="w-3 h-3" />
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
            className="text-xs px-3.5 py-2 rounded-full bg-[#0b0b0d] hover:bg-[#151519] text-[#c8c8d2] hover:text-white border border-[#232329] hover:border-[#3a3a44] flex items-center gap-2 transition font-medium"
          >
            {link.icon ? (
              <img src={link.icon} alt="" className="w-4 h-4 rounded object-contain" loading="lazy" />
            ) : (
              <Globe aria-hidden="true" className="w-3.5 h-3.5 text-[#9a9aa6]" />
            )}
            <span>{link.site}</span>
            <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#666672]" />
          </a>
        ))}
      </div>
    </div>
  );
};
