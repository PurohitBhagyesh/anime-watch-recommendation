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
}> = ({ className = '', size = 32 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(61,180,242,0.45)]"
      >
        <defs>
          <linearGradient id="senpaiBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="45%" stopColor="#3db4f2" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="senpaiAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="senpaiGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Outer Hex-Shield Container */}
        <path
          d="M50 4 L88 24 L88 76 L50 96 L12 76 L12 24 Z"
          fill="url(#senpaiBgGrad)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2.5"
        />

        {/* Inner geometric anime folds forming stylized 'A' & 'S' */}
        <path
          d="M50 18 L73 66 L59 66 L54 54 L46 54 L50 42 L50 18 Z"
          fill="#ffffff"
          opacity="0.95"
        />
        <path
          d="M50 18 L27 66 L41 66 L46 54 L54 54 L50 42 L50 18 Z"
          fill="url(#senpaiAccentGrad)"
          opacity="0.85"
        />
        {/* Dynamic Senpai Slash Bar */}
        <path
          d="M32 74 L68 74 L63 82 L27 82 Z"
          fill="url(#senpaiGoldGrad)"
          opacity="0.95"
        />

        {/* Anime Star Sparkle */}
        <polygon
          points="76,14 79,21 86,24 79,27 76,34 73,27 66,24 73,21"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};

export const AniListLogoIcon = AnimeSenpaiLogoIcon;

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  withText = true,
  subtitle = 'animesenpai.online',
  brandName = 'AnimeSenpai',
}) => {
  const getDimensions = () => {
    if (typeof size === 'number') {
      return {
        iconSize: size,
        textSize: 'text-base',
      };
    }
    switch (size) {
      case 'sm':
        return {
          iconSize: 30,
          textSize: 'text-sm sm:text-base',
        };
      case 'lg':
        return {
          iconSize: 44,
          textSize: 'text-2xl',
        };
      case 'xl':
        return {
          iconSize: 56,
          textSize: 'text-3xl',
        };
      case 'md':
      default:
        return {
          iconSize: 36,
          textSize: 'text-lg',
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
            className={`${dims.textSize} font-black tracking-tight text-[#edf1f5] leading-none group-hover:text-white transition-colors flex items-center gap-1`}
          >
            {brandName === 'AnimeSenpai' ? (
              <>
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Anime
                </span>
                <span className="bg-gradient-to-r from-[#38bdf8] via-[#3db4f2] to-[#0284c7] bg-clip-text text-transparent font-black drop-shadow-[0_0_12px_rgba(61,180,242,0.5)]">
                  Senpai
                </span>
              </>
            ) : (
              brandName
            )}
          </div>
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-[#8ba0b2] font-semibold tracking-wider font-mono">
                {subtitle}
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#3db4f2]/20 text-[#38bdf8] font-bold tracking-tight">
                アニメ先輩
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppLogo;
