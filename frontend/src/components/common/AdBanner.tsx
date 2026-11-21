import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '2083388106',
  format = 'auto',
  responsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate push calls during React re-renders in SPA navigation
    if (!pushedRef.current && adRef.current) {
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch (err) {
        // Suppress benign duplicate push or adblock warnings
      }
    }
  }, []);

  return (
    <div
      aria-label="Sponsored advertisement"
      className={`adsense-container w-full max-w-[1200px] mx-auto my-6 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[90px] sm:min-h-[100px] ${className}`}
    >
      <div className="text-[10px] uppercase font-mono tracking-widest text-[#a1a1aa] mb-1.5 self-start sm:self-center select-none">
        Advertisement
      </div>
      <div className="w-full overflow-hidden flex justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-7916799992208650"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};

export default AdBanner;
