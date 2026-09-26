import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  withText?: boolean;
  subtitle?: string;
  glow?: boolean;
  animateOnHover?: boolean;
}

export const BoltIcon: React.FC<{
  className?: string;
  size?: number;
  glow?: boolean;
}> = ({ className = '', size = 28, glow = false }) => {
  const gradientId = React.useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 46"
      fill="none"
      width={size}
      height={size * (46 / 48)}
      className={`inline-block flex-shrink-0 transition-transform ${
        glow ? 'drop-shadow-[0_0_12px_rgba(157,78,221,0.5)]' : ''
      } ${className}`}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#9d4edd" />
          <stop offset="25%" stopColor="#8b5cf6" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="85%" stopColor="#3db4f2" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  withText = true,
  subtitle = 'Anime Tracker',
  glow = true,
  animateOnHover = true,
}) => {
  const getDimensions = () => {
    if (typeof size === 'number') {
      return {
        boxSize: `w-[${size}px] h-[${size}px]`,
        iconSize: Math.round(size * 0.55),
        textSize: 'text-sm',
        subtextSize: 'text-[9px]',
      };
    }
    switch (size) {
      case 'sm':
        return {
          boxSize: 'w-7 h-7',
          iconSize: 15,
          textSize: 'text-sm',
          subtextSize: 'text-[9px]',
        };
      case 'lg':
        return {
          boxSize: 'w-10 h-10',
          iconSize: 22,
          textSize: 'text-lg sm:text-xl',
          subtextSize: 'text-xs',
        };
      case 'xl':
        return {
          boxSize: 'w-12 h-12',
          iconSize: 26,
          textSize: 'text-xl sm:text-2xl',
          subtextSize: 'text-xs',
        };
      case 'md':
      default:
        return {
          boxSize: 'w-8 h-8',
          iconSize: 18,
          textSize: 'text-base',
          subtextSize: 'text-[10px]',
        };
    }
  };

  const dims = getDimensions();

  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* Icon Emblem Box */}
      <div
        className={`${dims.boxSize} rounded-xl bg-gradient-to-br from-[#1a1735]/90 via-[#0e1726]/90 to-[#0a121e]/90 border border-purple-500/25 flex items-center justify-center shadow-lg shadow-purple-500/10 ${
          glow ? 'hover:shadow-purple-500/25' : ''
        } ${animateOnHover ? 'group-hover:scale-105 group-hover:border-purple-400/40' : ''} transition-all duration-300 relative overflow-hidden flex-shrink-0 backdrop-blur-sm`}
      >
        {/* Subtle inner ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/15 via-transparent to-[#3db4f2]/15 pointer-events-none" />
        <BoltIcon size={dims.iconSize} glow={glow} />
      </div>

      {/* Brand Text */}
      {withText && (
        <div className="flex flex-col">
          <span
            className={`${dims.textSize} font-black tracking-tight text-white leading-none flex items-center gap-0.5`}
          >
            <span>Volt</span>
            <span className="bg-gradient-to-r from-[#9d4edd] via-[#6366f1] to-[#3db4f2] bg-clip-text text-transparent">
              aku
            </span>
          </span>
          {subtitle && (
            <span
              className={`${dims.subtextSize} text-slate-400 font-medium tracking-wide mt-0.5`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppLogo;
