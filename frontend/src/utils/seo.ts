import { useEffect } from 'react';

export const SITE_URL = 'https://www.animesenpai.online';
export const SITE_NAME = 'AnimeSenpai';
export const DEFAULT_OG_IMAGE = 'https://www.animesenpai.online/logo-512.png';
export const DEFAULT_ROBOTS = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'video.movie' | 'video.tv_show' | 'video.other';
  ogImage?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>> | null;
}

/**
 * Universal SEO hook for AnimeSenpai.
 * Dynamically updates document.title, canonical link, meta tags, and structured JSON-LD.
 * Cleans up page-specific tags upon unmount or route change.
 */
export function useSEO({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  twitterImage,
  twitterCard = 'summary_large_image',
  robots = DEFAULT_ROBOTS,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to create or update meta tag
    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProperty);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Helper to create or update link tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Set Meta Descriptions & Robots
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    if (title) {
      setMeta('og:title', title, true);
      setMeta('twitter:title', title);
    }

    if (canonicalUrl) {
      setLink('canonical', canonicalUrl);
      setMeta('og:url', canonicalUrl, true);
    }

    setMeta('og:type', ogType, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('twitter:card', twitterCard);
    setMeta('robots', robots);
    setMeta('googlebot', robots);

    const imageToUse = ogImage || DEFAULT_OG_IMAGE;
    setMeta('og:image', imageToUse, true);
    setMeta('twitter:image', twitterImage || imageToUse);

    // 3. Inject Dynamic Page-Level Structured Data (JSON-LD)
    let scriptEl = document.getElementById('dynamic-page-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-page-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd, null, 2);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // 4. Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('dynamic-page-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogType,
    ogImage,
    twitterImage,
    twitterCard,
    robots,
    // JSON-LD is serialized for reliable memoization comparison
    JSON.stringify(jsonLd),
  ]);
}
