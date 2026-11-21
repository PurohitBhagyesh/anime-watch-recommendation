import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    // Use requestAnimationFrame & boolean diffing to eliminate forced reflow on scroll
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const isOver = scrollY > 320;
          setVisible((prev) => (prev !== isOver ? isOver : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
      aria-label="Scroll back to top"
      title="Back to top"
      className={`fixed bottom-[74px] right-3.5 sm:bottom-[78px] sm:right-5 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0c0c0f]/90 hover:bg-[#5360e6] text-[#9a9aa6] hover:text-white border border-[#23232b] hover:border-[#5360e6] shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp aria-hidden="true" className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
    </button>
  );
};

export default BackToTop;
