import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  withText?: boolean;
  subtitle?: string;
  glow?: boolean;
  brandName?: string;
}

export const AnimeSenpaiLogoIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 28 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="senpaiMonoSurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1e24" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
        </defs>

        {/* Crisp OpenLid-inspired monochrome squircle badge */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#senpaiMonoSurface)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3"
        />

        {/* Minimalist geometric 'A' fold */}
        <path
          d="M50 20 L74 70 L61 70 L55 56 L45 56 L39 70 L26 70 Z"
          fill="#ffffff"
        />
        <polygon points="50,36 54,48 46,48" fill="#09090b" />

        {/* Subtle underline slash */}
        <rect x="33" y="76" width="34" height="5" rx="2.5" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
  );
};

export const AniListLogoIcon = AnimeSenpaiLogoIcon;

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  withText = true,
  subtitle = '',
  brandName = 'AnimeSenpai',
}) => {
  const getDimensions = () => {
    if (typeof size === 'number') {
      return {
        iconSize: size,
        textSize: 'text-[15px]',
      };
    }
    switch (size) {
      case 'sm':
        return {
          iconSize: 26,
          textSize: 'text-[15px]',
        };
      case 'lg':
        return {
          iconSize: 40,
          textSize: 'text-xl sm:text-2xl',
        };
      case 'xl':
        return {
          iconSize: 48,
          textSize: 'text-2xl sm:text-3xl',
        };
      case 'md':
      default:
        return {
          iconSize: 30,
          textSize: 'text-base',
        };
    }
  };

  const dims = getDimensions();

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      <AnimeSenpaiLogoIcon size={dims.iconSize} />
      {withText && (
        <div className="flex flex-col">
          <div
            className={`${dims.textSize} font-bold tracking-[-0.025em] text-white leading-none flex items-center`}
          >
            {brandName === 'AnimeSenpai' ? (
              <>
                <span>Anime</span>
                <span className="text-[#9a9aa6] font-medium">Senpai</span>
              </>
            ) : (
              brandName
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] text-[#666672] font-medium tracking-wider font-mono mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppLogo;
