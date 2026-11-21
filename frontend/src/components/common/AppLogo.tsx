import React, { useId } from 'react';

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
  const uid = useId().replace(/:/g, '');
  const bgId = `asObsidian-${uid}`;
  const accentId = `asIndigo-${uid}`;

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
          <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#17171f" />
            <stop offset="100%" stopColor="#060609" />
          </linearGradient>
          <linearGradient id={accentId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7582ff" />
            <stop offset="100%" stopColor="#5360e6" />
          </linearGradient>
        </defs>

        {/* Precision Obsidian Squircle */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill={`url(#${bgId})`}
          stroke="#2b2b38"
          strokeWidth="3"
        />

        {/* Platinum Origami 'A' Blade */}
        <path
          d="M50 18 L24 78 L37.5 78 L50 47 L55.5 60.5 L67 60.5 L50 18 Z"
          fill="#f5f5f7"
        />

        {/* Luminous Indigo Accent Wing & Spark */}
        <path
          d="M58.5 67 L76 78 L63 78 L54 71.5 Z"
          fill={`url(#${accentId})`}
        />
        <circle cx="71.5" cy="30.5" r="5.5" fill={`url(#${accentId})`} />
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
        textSize: 'text-lg',
      };
    }
    switch (size) {
      case 'sm':
        return {
          iconSize: 36,
          textSize: 'text-[17px] sm:text-[19px]',
        };
      case 'lg':
        return {
          iconSize: 52,
          textSize: 'text-2xl sm:text-3xl',
        };
      case 'xl':
        return {
          iconSize: 64,
          textSize: 'text-3xl sm:text-4xl',
        };
      case 'md':
      default:
        return {
          iconSize: 42,
          textSize: 'text-xl',
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
            className={`${dims.textSize} font-extrabold tracking-[-0.03em] text-[#f5f5f7] leading-none flex items-center`}
          >
            {brandName === 'AnimeSenpai' ? (
              <>
                <span>Anime</span>
                <span className="text-[#9a9aa6] font-medium">Senpai</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#5360e6] ml-0.5 translate-y-[2px]" aria-hidden="true" />
              </>
            ) : (
              brandName
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] text-[#9a9aa6] font-medium tracking-wider font-mono mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppLogo;
