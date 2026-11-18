import React, { useState } from 'react';
import { Heart, Copy, Check, Smartphone } from 'lucide-react';

export const SUPPORT_UPI_ID = 'Purohit2009@fam';
const UPI_PAY_LINK = `upi://pay?pa=${encodeURIComponent(SUPPORT_UPI_ID)}&pn=${encodeURIComponent('Bhagyesh Purohit')}&tn=${encodeURIComponent('Support AnimeSenpai')}&cu=INR`;

interface SupportUpiCardProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export const SupportUpiCard: React.FC<SupportUpiCardProps> = ({
  variant = 'full',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = SUPPORT_UPI_ID;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={`liquid-glass rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-400/25 flex items-center justify-center text-rose-400 flex-shrink-0">
            <Heart aria-hidden="true" className="w-4 h-4 fill-rose-400/30" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Support Independent Development</p>
            <p className="text-[11px] text-slate-400">
              100% free & ad-free. Optional UPI tip: <span className="font-mono text-slate-200 font-semibold">{SUPPORT_UPI_ID}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl anilist-btn-secondary text-xs font-bold cursor-pointer"
          >
            {copied ? (
              <>
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Copy UPI</span>
              </>
            )}
          </button>

          <a
            href={UPI_PAY_LINK}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl anilist-btn-primary text-xs font-bold"
          >
            <Smartphone aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Open UPI</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`liquid-glass rounded-2xl p-5 sm:p-6 space-y-4 ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/25 flex items-center justify-center text-rose-400 flex-shrink-0">
          <Heart aria-hidden="true" className="w-5 h-5 fill-rose-400/25" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Support AnimeSenpai
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AnimeSenpai is an independent, ad-free open-source project. Every feature is free for everyone. If you enjoy using it, voluntary UPI support helps cover domain and hosting costs.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-[#070d16]/70 border border-white/10">
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Official UPI ID
          </span>
          <span className="font-mono text-sm font-bold text-white select-all">
            {SUPPORT_UPI_ID}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl anilist-btn-secondary text-xs font-bold cursor-pointer"
          >
            {copied ? (
              <>
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Copy UPI ID</span>
              </>
            )}
          </button>

          <a
            href={UPI_PAY_LINK}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl anilist-btn-primary text-xs font-bold"
          >
            <Smartphone aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Pay via UPI</span>
          </a>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        Works with Google Pay, PhonePe, Paytm, FamPay, and BHIM. Tips are voluntary and do not unlock gated features.
      </p>
    </div>
  );
};

export default SupportUpiCard;
