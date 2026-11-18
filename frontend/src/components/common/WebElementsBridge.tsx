import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    CoffeeUPI?: {
      instance: unknown;
      getInstance: () => unknown;
      init: (config: Record<string, unknown>) => unknown;
      open: () => void;
      close: () => void;
    };
    ShareLink?: {
      instance: unknown;
      getInstance: () => unknown;
      init: (config: Record<string, unknown>) => unknown;
      setUrl: (url: string) => void;
      setTitle: (title: string) => void;
      setText: (text: string) => void;
    };
  }
}

function loadExternalScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve(), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    document.body.appendChild(script);
  });
}

export const WebElementsBridge: React.FC = () => {
  const location = useLocation();

  // Initialize official PurohitBhagyesh/web-elements widgets once
  useEffect(() => {
    let cancelled = false;

    const setupWidgets = async () => {
      await Promise.all([
        loadExternalScript('/web-elements/buy-me-a-coffee/coffee-upi.js'),
        loadExternalScript('/web-elements/share-link/share-link.js'),
      ]);

      if (cancelled) return;

      if (window.CoffeeUPI && !window.CoffeeUPI.getInstance()) {
        window.CoffeeUPI.init({
          upiId: 'Purohit2009@fam',
          payeeName: 'Bhagyesh Purohit',
          defaultAmount: 50,
          presets: [20, 50, 100, 200],
          title: 'Buy me a coffee',
          subtitle: 'Every coffee supports AnimeSenpai development.',
          position: 'bottom-left',
        });
      }

      if (window.ShareLink && !window.ShareLink.getInstance()) {
        window.ShareLink.init({
          url: window.location.href,
          title: document.title || 'AnimeSenpai',
          text: 'Explore trending anime, seasonal schedules & track your watchlist on AnimeSenpai!',
          buttonText: 'Share',
          position: 'bottom-right',
        });
      }
    };

    setupWidgets();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep ShareLink widget URL and page title synced across SPA navigation
  useEffect(() => {
    const syncShareTarget = () => {
      if (window.ShareLink?.getInstance()) {
        window.ShareLink.setUrl(window.location.href);
        window.ShareLink.setTitle(document.title || 'AnimeSenpai');
      }
    };

    // Delay slightly so useSEO updates document.title first
    const timer = setTimeout(syncShareTarget, 120);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default WebElementsBridge;
