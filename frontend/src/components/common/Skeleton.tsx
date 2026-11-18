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

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#0c0c0f] rounded-2xl overflow-hidden border border-[#23232b]">
      <div className="aspect-[185/265] w-full bg-[#16161b] shimmer-loading" />
      <div className="p-3 space-y-2.5">
        <div className="h-3.5 bg-[#16161b] rounded-md w-4/5 shimmer-loading" />
        <div className="h-3 bg-[#16161b] rounded-md w-1/2 shimmer-loading" />
        <div className="flex justify-between pt-1.5 border-t border-[#23232b]">
          <div className="h-2.5 bg-[#16161b] rounded w-10 shimmer-loading" />
          <div className="h-2.5 bg-[#16161b] rounded w-12 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0c0c0f] border border-[#23232b] gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-6 h-3.5 rounded bg-[#16161b] shimmer-loading flex-shrink-0" />
        <div className="w-10 sm:w-12 aspect-[3/4] rounded-xl bg-[#16161b] shimmer-loading flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-3.5 bg-[#16161b] rounded w-2/5 shimmer-loading" />
          <div className="h-2.5 bg-[#16161b] rounded w-1/4 shimmer-loading" />
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-11 h-5 rounded-full bg-[#16161b] shimmer-loading" />
        <div className="w-8 h-8 rounded-full bg-[#16161b] shimmer-loading" />
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-[440px] sm:min-h-[540px] md:min-h-[600px] overflow-hidden bg-[#000000] border-b border-[#23232b] flex items-end px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="w-full max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4">
          <div className="h-6 bg-[#16161b] rounded-full w-36 shimmer-loading" />
          <div className="h-10 md:h-14 bg-[#16161b] rounded-2xl w-3/4 shimmer-loading" />
          <div className="h-4 bg-[#0c0c0f] rounded-lg w-full shimmer-loading" />
          <div className="h-4 bg-[#0c0c0f] rounded-lg w-4/5 shimmer-loading" />
          <div className="flex gap-3 pt-3">
            <div className="h-11 bg-[#16161b] rounded-full w-36 shimmer-loading" />
            <div className="h-11 bg-[#0c0c0f] border border-[#23232b] rounded-full w-32 shimmer-loading" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="h-56 sm:h-72 md:h-88 w-full rounded-3xl bg-[#0c0c0f] shimmer-loading border border-[#23232b]" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <div className="aspect-[185/265] w-40 md:w-full rounded-2xl bg-[#16161b] shimmer-loading" />
          <div className="h-10 rounded-full bg-[#16161b] shimmer-loading" />
          <div className="h-36 rounded-2xl bg-[#0c0c0f] border border-[#23232b] shimmer-loading" />
        </div>
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          <div className="h-9 bg-[#16161b] rounded-xl w-2/3 shimmer-loading" />
          <div className="h-28 bg-[#0c0c0f] border border-[#23232b] rounded-2xl w-full shimmer-loading" />
          <div className="h-10 bg-[#0c0c0f] border border-[#23232b] rounded-full w-64 shimmer-loading" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#0c0c0f] border border-[#23232b] shimmer-loading" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
