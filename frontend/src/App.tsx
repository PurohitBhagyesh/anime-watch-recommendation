import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ScrollProgressLine } from './components/common/ScrollProgressLine';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { BackToTop } from './components/common/BackToTop';
import { WebElementsBridge } from './components/common/WebElementsBridge';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/Skeleton';

import { HomePage } from './pages/HomePage';

// Lazy loaded secondary pages for code splitting
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const AnimeDetailsPage = React.lazy(() => import('./pages/AnimeDetailsPage').then(m => ({ default: m.AnimeDetailsPage })));
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const LicensePage = React.lazy(() => import('./pages/LicensePage').then(m => ({ default: m.LicensePage })));
const SecurityPage = React.lazy(() => import('./pages/SecurityPage').then(m => ({ default: m.SecurityPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Seamlessly migrate legacy hash routes (e.g. /#/about -> /about) to clean URLs
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.slice(1);
  window.history.replaceState(null, '', cleanPath);
}

export const App: React.FC = () => {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <div className="adaptive-shell relative flex flex-col min-h-dvh bg-[#000000] text-[#9a9aa6] selection:bg-[#5360e6] selection:text-white">
              {/* Ethereal Anime Scenic Sky & Ocean Reflecting Background (Universal Mobile & Desktop, Scenery Only — Zero Characters) */}
              <div
                aria-hidden="true"
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
              >
                <picture>
                  <source media="(max-width: 640px)" srcSet="/img/anime-sky-ocean-bg-mobile.webp" type="image/webp" />
                  <source media="(max-width: 640px)" srcSet="/img/anime-sky-ocean-bg-mobile.jpg" type="image/jpeg" />
                  <source srcSet="/img/anime-sky-ocean-bg.webp" type="image/webp" />
                  <img
                    src="/img/anime-sky-ocean-bg.jpg"
                    alt=""
                    width={1376}
                    height={768}
                    className="w-full h-full object-cover object-center opacity-[0.22] sm:opacity-[0.30] filter contrast-115 saturate-125 brightness-95"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                {/* Cinematic darkening & vignettes to guarantee 100% WCAG contrast and readability across mobile and desktop */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/80 via-[#000000]/65 to-[#000000]/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_#000000_82%)]" />
              </div>

              <div className="relative z-10 flex flex-col flex-1 min-h-dvh min-w-0">
                <ScrollProgressLine />
                <Navbar />
                <main className="flex-1 flex flex-col min-w-0">
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/discover" element={<DiscoverPage />} />
                        <Route path="/anime/:id" element={<AnimeDetailsPage />} />
                        <Route path="/watchlist" element={<WatchlistPage />} />
                        <Route path="/account" element={<AccountPage defaultTab="account" />} />
                        <Route path="/settings" element={<AccountPage defaultTab="settings" />} />
                        <Route path="/login" element={<AuthPage initialMode="login" />} />
                        <Route path="/signup" element={<AuthPage initialMode="signup" />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/license" element={<LicensePage />} />
                        <Route path="/security" element={<SecurityPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
                <Footer />
                <BackToTop />
                <WebElementsBridge />
              </div>
            </div>
          </BrowserRouter>
        </WatchlistProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
};

export default App;
