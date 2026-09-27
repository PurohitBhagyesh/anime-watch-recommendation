import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#151f2e] rounded-xl overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[185/265] w-full bg-[#0b1622] shimmer-loading" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-[#1f2c3f] rounded w-3/4 shimmer-loading" />
        <div className="h-3 bg-[#1f2c3f]/60 rounded w-1/2 shimmer-loading" />
        <div className="flex justify-between pt-1">
          <div className="h-3 bg-[#1f2c3f]/40 rounded w-1/4 shimmer-loading" />
          <div className="h-3 bg-[#1f2c3f]/40 rounded w-1/4 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-[520px] md:min-h-[660px] overflow-hidden bg-[#0b1622] border-b border-white/10 animate-pulse flex items-end px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-16">
      <div className="w-full max-w-3xl space-y-4">
        <div className="h-6 bg-[#1f2c3f] rounded-full w-36 shimmer-loading" />
        <div className="h-12 md:h-16 bg-[#1f2c3f] rounded-xl w-3/4 shimmer-loading" />
        <div className="h-4 bg-[#1f2c3f]/70 rounded w-full shimmer-loading" />
        <div className="h-4 bg-[#1f2c3f]/70 rounded w-4/5 shimmer-loading" />
        <div className="flex gap-3 pt-4">
          <div className="h-11 bg-[#1f2c3f] rounded-xl w-32 shimmer-loading" />
          <div className="h-11 bg-[#1f2c3f] rounded-xl w-32 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner */}
      <div className="h-72 md:h-96 w-full rounded-3xl bg-[#151f2e] shimmer-loading border border-white/10" />

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-[185/265] w-full rounded-2xl bg-[#1f2c3f] shimmer-loading" />
          <div className="h-10 rounded-xl bg-[#1f2c3f] shimmer-loading" />
          <div className="h-32 rounded-xl bg-[#1f2c3f]/60 shimmer-loading" />
        </div>
        <div className="md:col-span-3 space-y-4">
          <div className="h-10 bg-[#1f2c3f] rounded-xl w-1/2 shimmer-loading" />
          <div className="h-24 bg-[#1f2c3f]/60 rounded-xl w-full shimmer-loading" />
          <div className="h-48 bg-[#1f2c3f]/40 rounded-xl w-full shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

