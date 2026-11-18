import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading',
  className = '',
}) => {
  const sizeClass =
    size === 'sm' ? 'loading-spinner-sm' : size === 'lg' ? 'loading-spinner-lg' : '';

  return (
    <progress
      aria-label={label}
      className={`loading-spinner ${sizeClass} ${className}`.trim()}
    />
  );
};

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading page' }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[65dvh] gap-4 px-4 animate-fadeIn">
      <div className="p-4 rounded-full bg-[#0c0c0f] border border-[#23232b] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center">
        <Spinner size="md" label={label} />
      </div>
      <span className="text-xs font-medium text-[#9a9aa6] tracking-wide">
        {label}…
      </span>
    </div>
  );
};

/**
 * Pixel-matched to AnimeCard on both mobile and desktop (zero CLS on hydration).
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col bg-[#0c0c0f] rounded-[16px] overflow-hidden border border-[#23232b] h-full"
    >
      {/* Poster (exact 185/265 aspect ratio + subtle badge placeholders) */}
      <div className="relative aspect-[185/265] w-full bg-[#151519] shimmer-loading">
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="h-4 w-9 rounded-full bg-black/50" />
          <div className="h-4 w-11 rounded-full bg-black/50" />
        </div>
        <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50" />
      </div>

      {/* Info Body (exact p-2.5 sm:p-3 + min-h title + studio + footer meta row) */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <div className="min-h-[2.15rem] sm:min-h-[2.45rem] space-y-1.5 pt-0.5">
            <div className="h-3 sm:h-3.5 bg-[#16161b] rounded-md w-[88%] shimmer-loading" />
            <div className="h-3 sm:h-3.5 bg-[#16161b] rounded-md w-[58%] shimmer-loading" />
          </div>
          <div className="h-2.5 bg-[#16161b] rounded w-2/5 mt-1 shimmer-loading" />
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[#232329]">
          <div className="h-2.5 bg-[#16161b] rounded w-10 shimmer-loading" />
          <div className="h-2.5 bg-[#16161b] rounded w-12 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

/**
 * Pixel-matched to CarouselRow on mobile and desktop (horizontal card track + header).
 */
export const CarouselRowSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="space-y-3">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#16161b] border border-[#23232b] shimmer-loading flex-shrink-0" />
            <div className="h-5 sm:h-6 w-36 sm:w-48 rounded-lg bg-[#16161b] shimmer-loading" />
          </div>
          <div className="h-3 sm:h-3.5 w-48 sm:w-72 rounded-md bg-[#121217] shimmer-loading" />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-6 w-16 rounded-full bg-[#121217] shimmer-loading" />
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-[#121217] border border-[#23232b] shimmer-loading" />
            <div className="w-8 h-8 rounded-full bg-[#121217] border border-[#23232b] shimmer-loading" />
          </div>
        </div>
      </div>

      {/* Horizontal Card Track matching exact responsive card widths */}
      <div className="flex gap-2.5 sm:gap-3.5 overflow-hidden pb-1 pt-0.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[134px] min-[400px]:w-[148px] sm:w-[172px] md:w-[184px]"
          >
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Pixel-matched to DiscoverPage table/list rows on mobile and desktop.
 */
export const TableRowSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-between p-3 rounded-2xl bg-[#0c0c0f] border border-[#23232b] gap-3"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-7 h-3.5 rounded bg-[#16161b] shimmer-loading flex-shrink-0" />
        <div className="w-10 sm:w-12 aspect-[3/4] rounded-xl bg-[#16161b] border border-[#23232b] shimmer-loading flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-3.5 sm:h-4 bg-[#16161b] rounded-md w-3/5 sm:w-2/5 shimmer-loading" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 bg-[#121217] rounded w-14 shimmer-loading" />
            <div className="h-2.5 bg-[#121217] rounded w-16 shimmer-loading" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        <div className="w-12 h-6 rounded-full bg-[#16161b] shimmer-loading" />
        <div className="w-8 h-8 sm:w-24 sm:h-8 rounded-full bg-[#16161b] shimmer-loading" />
      </div>
    </div>
  );
};

/**
 * Pixel-matched to HeroBanner on both mobile (portrait art-directed height) and desktop.
 */
export const HeroSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hero-adaptive relative w-full overflow-hidden min-h-[470px] min-[400px]:min-h-[510px] sm:min-h-[430px] md:min-h-[465px] lg:min-h-[500px] flex items-end border-b border-[#23232b] bg-[#000000]"
    >
      {/* Subtle shimmer backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111118] via-[#09090d] to-[#000000]" />

      {/* Mobile Left / Right Arrow Skeletons */}
      <div className="sm:hidden absolute inset-x-0 top-[96px] min-[400px]:top-[112px] -translate-y-1/2 z-20 flex items-center justify-between px-2.5 min-[400px]:px-3.5">
        <div className="w-11 h-11 rounded-full bg-[#0e0e13] border border-[#23232b] shimmer-loading" />
        <div className="w-11 h-11 rounded-full bg-[#0e0e13] border border-[#23232b] shimmer-loading" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 min-[400px]:pt-48 pb-5 sm:py-10 md:py-12">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          {/* Editorial Title */}
          <div className="space-y-2">
            <div className="h-7 min-[400px]:h-8 sm:h-10 md:h-12 bg-[#181820] rounded-xl w-4/5 sm:w-3/4 shimmer-loading" />
            <div className="h-7 min-[400px]:h-8 sm:h-10 md:h-12 bg-[#14141b] rounded-xl w-1/2 sm:hidden shimmer-loading" />
          </div>

          {/* 3 Monochrome Genre Pills */}
          <div className="flex flex-wrap gap-1.5">
            <div className="h-5 sm:h-6 w-16 rounded-full bg-[#15151b] border border-[#23232b] shimmer-loading" />
            <div className="h-5 sm:h-6 w-20 rounded-full bg-[#15151b] border border-[#23232b] shimmer-loading" />
            <div className="h-5 sm:h-6 w-16 rounded-full bg-[#15151b] border border-[#23232b] shimmer-loading" />
          </div>

          {/* Synopsis (2 lines mobile, 3 lines desktop) */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="h-3.5 bg-[#121218] rounded-md w-full shimmer-loading" />
            <div className="h-3.5 bg-[#121218] rounded-md w-5/6 shimmer-loading" />
            <div className="hidden sm:block h-3.5 bg-[#121218] rounded-md w-2/3 shimmer-loading" />
          </div>

          {/* Balanced CTA Buttons (2-col mobile, inline pills desktop) */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 pt-1 sm:pt-2">
            <div className="col-span-2 sm:col-span-1 h-11 sm:w-36 rounded-full bg-[#1d1e30] border border-[#2e3254] shimmer-loading" />
            <div className="h-11 sm:w-32 rounded-full bg-[#121218] border border-[#23232b] shimmer-loading" />
            <div className="h-11 sm:w-32 rounded-full bg-[#121218] border border-[#23232b] shimmer-loading" />
          </div>

          {/* Bottom Slide Pill (Desktop only) */}
          <div className="hidden sm:flex items-center pt-2 sm:pt-3">
            <div className="h-9 w-44 rounded-full bg-[#0e0e13] border border-[#23232b] shimmer-loading" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Pixel-matched to AnimeDetailsPage full-bleed banner + overlapping mobile/desktop poster layout.
 */
export const DetailsSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="space-y-6 pb-8 animate-fadeIn">
      {/* Full-bleed Top Banner (exact heights) */}
      <div className="relative w-full h-44 min-[480px]:h-56 sm:h-72 md:h-84 lg:h-96 bg-[#0d0d12] shimmer-loading">
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/55 to-transparent" />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-8 h-9 w-20 rounded-full bg-[#14141b] border border-[#23232b]" />
      </div>

      {/* Overlapping Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 min-[480px]:-mt-24 sm:-mt-32 lg:-mt-40 relative z-10 space-y-6">
        {/* Row 1: Poster + Title & Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 md:items-end">
          {/* Mobile side-by-side poster + compact title; desktop splits into grid columns */}
          <div className="flex items-end gap-3.5 sm:gap-5 md:contents">
            <div className="w-28 min-[400px]:w-32 sm:w-40 md:w-auto flex-shrink-0 md:col-span-4 lg:col-span-3">
              <div className="aspect-[185/265] w-full rounded-2xl bg-[#16161b] border border-[#23232b] shimmer-loading shadow-2xl" />
            </div>

            {/* Mobile-only title beside poster */}
            <div className="flex-1 min-w-0 space-y-2 pb-1 md:hidden">
              <div className="h-5 w-28 rounded-full bg-[#16161b] shimmer-loading" />
              <div className="h-6 w-full rounded-lg bg-[#181820] shimmer-loading" />
              <div className="h-6 w-2/3 rounded-lg bg-[#181820] shimmer-loading" />
              <div className="h-3.5 w-3/4 rounded bg-[#14141b] shimmer-loading" />
            </div>
          </div>

          {/* Desktop title + shared genres & action buttons */}
          <div className="md:col-span-8 lg:col-span-9 space-y-3">
            <div className="hidden md:block space-y-2.5">
              <div className="flex gap-2">
                <div className="h-6 w-32 rounded-full bg-[#14141b] border border-[#23232b] shimmer-loading" />
                <div className="h-6 w-36 rounded-full bg-[#14141b] border border-[#23232b] shimmer-loading" />
              </div>
              <div className="h-10 lg:h-12 w-3/4 rounded-xl bg-[#181820] shimmer-loading" />
              <div className="h-4 w-1/3 rounded bg-[#14141b] shimmer-loading" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <div className="h-6 w-16 rounded-full bg-[#15151b] shimmer-loading" />
              <div className="h-6 w-20 rounded-full bg-[#15151b] shimmer-loading" />
              <div className="h-6 w-16 rounded-full bg-[#15151b] shimmer-loading" />
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2.5 pt-1">
              <div className="col-span-2 sm:col-span-1 h-11 sm:w-40 rounded-full bg-[#1d1e30] shimmer-loading" />
              <div className="h-11 sm:w-36 rounded-full bg-[#14141b] border border-[#23232b] shimmer-loading" />
              <div className="h-11 sm:w-28 rounded-full bg-[#14141b] border border-[#23232b] shimmer-loading" />
            </div>
          </div>
        </div>

        {/* Row 2: Metadata Sidebar + Synopsis & Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-2">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="h-56 sm:h-64 rounded-2xl bg-[#0c0c0f] border border-[#23232b] shimmer-loading" />
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-5">
            <div className="h-10 w-64 rounded-full bg-[#0c0c0f] border border-[#23232b] shimmer-loading" />
            <div className="h-32 rounded-2xl bg-[#0c0c0f] border border-[#23232b] shimmer-loading" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-[#0c0c0f] border border-[#23232b] shimmer-loading"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
