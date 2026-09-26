import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800/80 animate-pulse">
      <div className="aspect-[3/4] w-full bg-slate-800/60 shimmer-loading" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-slate-800 rounded w-3/4 shimmer-loading" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2 shimmer-loading" />
        <div className="flex justify-between pt-1">
          <div className="h-3 bg-slate-800/40 rounded w-1/4 shimmer-loading" />
          <div className="h-3 bg-slate-800/40 rounded w-1/4 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-[450px] md:min-h-[520px] rounded-3xl overflow-hidden bg-slate-900/80 border border-slate-800/80 animate-pulse flex items-end p-6 md:p-12">
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-6 bg-slate-800 rounded-full w-36 shimmer-loading" />
        <div className="h-10 bg-slate-800 rounded-xl w-3/4 shimmer-loading" />
        <div className="h-4 bg-slate-800/70 rounded w-full shimmer-loading" />
        <div className="h-4 bg-slate-800/70 rounded w-4/5 shimmer-loading" />
        <div className="flex gap-3 pt-4">
          <div className="h-11 bg-slate-800 rounded-xl w-32 shimmer-loading" />
          <div className="h-11 bg-slate-800 rounded-xl w-32 shimmer-loading" />
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner */}
      <div className="h-72 md:h-96 w-full rounded-3xl bg-slate-900/80 shimmer-loading border border-slate-800/80" />
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl bg-slate-800 shimmer-loading" />
          <div className="h-10 bg-slate-800 rounded-xl w-full shimmer-loading" />
        </div>
        <div className="md:col-span-3 space-y-4">
          <div className="h-8 bg-slate-800 rounded w-2/3 shimmer-loading" />
          <div className="h-5 bg-slate-800/70 rounded w-1/3 shimmer-loading" />
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-slate-800/60 rounded w-full shimmer-loading" />
            <div className="h-4 bg-slate-800/60 rounded w-full shimmer-loading" />
            <div className="h-4 bg-slate-800/60 rounded w-3/4 shimmer-loading" />
          </div>
        </div>
      </div>
    </div>
  );
};
