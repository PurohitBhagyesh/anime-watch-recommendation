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
      toggle: () => void;
    };
    ShareLink?: {
      instance: unknown;
      getInstance: () => unknown;
      init: (config: Record<string, unknown>) => unknown;
      setUrl: (url: string) => void;
      setTitle: (title: string) => void;
      setText: (text: string) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  }
}

function loadExternalStyle(href: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement | null;
    if (existing) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
    document.head.appendChild(link);
  });
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
        loadExternalStyle('/web-elements/buy-me-a-coffee/coffee-upi.css?v=2'),
        loadExternalStyle('/web-elements/share-link/share-link.css?v=2'),
        loadExternalScript('/web-elements/buy-me-a-coffee/coffee-upi.js?v=2'),
        loadExternalScript('/web-elements/share-link/share-link.js?v=2'),
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

      // Keep Coffee UPI and Share cards mutually exclusive so they never overlap on small screens
      const cupiPill = document.querySelector('.cupi-pill');
      const sharePill = document.querySelector('.wshare-pill');
      cupiPill?.addEventListener('click', () => window.ShareLink?.close());
      sharePill?.addEventListener('click', () => window.CoffeeUPI?.close());
    };

    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(setupWidgets, { timeout: 3500 });
    } else {
      timerId = setTimeout(setupWidgets, 2500);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
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
