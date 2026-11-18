import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#0b0b0d] rounded-2xl overflow-hidden border border-[#232329]">
      <div className="aspect-[185/265] w-full bg-[#151519] shimmer-loading" />
      <div className="p-3 space-y-2.5">
        <div className="h-3.5 bg-[#151519] rounded-md w-3/4 shimmer-loading" />
        <div className="h-3 bg-[#151519] rounded-md w-1/2 shimmer-loading" />
        <div className="flex justify-between pt-1">
          <div className="h-2.5 bg-[#151519] rounded w-1/4 shimmer-loading" />
          <div className="h-2.5 bg-[#151519] rounded w-1/4 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-[440px] sm:min-h-[540px] md:min-h-[600px] overflow-hidden bg-[#000000] border-b border-[#232329] flex items-end px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="w-full max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-4">
          <div className="h-6 bg-[#151519] rounded-full w-36 shimmer-loading" />
          <div className="h-10 md:h-14 bg-[#151519] rounded-2xl w-3/4 shimmer-loading" />
          <div className="h-4 bg-[#0b0b0d] rounded-lg w-full shimmer-loading" />
          <div className="h-4 bg-[#0b0b0d] rounded-lg w-4/5 shimmer-loading" />
          <div className="flex gap-3 pt-3">
            <div className="h-11 bg-[#151519] rounded-full w-36 shimmer-loading" />
            <div className="h-11 bg-[#0b0b0d] border border-[#232329] rounded-full w-32 shimmer-loading" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="h-64 md:h-88 w-full rounded-3xl bg-[#0b0b0d] shimmer-loading border border-[#232329]" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-[185/265] w-full rounded-2xl bg-[#151519] shimmer-loading" />
          <div className="h-10 rounded-full bg-[#151519] shimmer-loading" />
          <div className="h-32 rounded-2xl bg-[#0b0b0d] border border-[#232329] shimmer-loading" />
        </div>
        <div className="md:col-span-3 space-y-4">
          <div className="h-10 bg-[#151519] rounded-xl w-1/2 shimmer-loading" />
          <div className="h-24 bg-[#0b0b0d] border border-[#232329] rounded-2xl w-full shimmer-loading" />
          <div className="h-48 bg-[#0b0b0d] border border-[#232329] rounded-2xl w-full shimmer-loading" />
        </div>
      </div>
    </div>
  );
};
