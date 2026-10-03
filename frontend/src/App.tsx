import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { WatchlistProvider } from './context/WatchlistContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomTabBar } from './components/common/BottomTabBar';
import { Footer } from './components/common/Footer';

import { HomePage } from './pages/HomePage';

// Lazy loaded secondary pages for code splitting
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const AnimeDetailsPage = React.lazy(() => import('./pages/AnimeDetailsPage').then(m => ({ default: m.AnimeDetailsPage })));
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

import { ErrorBoundary } from './components/common/ErrorBoundary';

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 rounded-full border-4 border-[#151f2e] border-t-[#3db4f2] animate-spin" />
  </div>
);

// Seamlessly migrate legacy hash routes (e.g. /#/about -> /about) to clean URLs
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.slice(1);
  window.history.replaceState(null, '', cleanPath);
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-[#0b1622] text-[#bcbedc] selection:bg-[#3db4f2] selection:text-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <Navbar />
            <main className="flex-1 flex flex-col min-h-screen">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
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
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
            <Footer />
            <BottomTabBar />
          </div>
          <SpeedInsights />
        </BrowserRouter>
      </WatchlistProvider>
    </AuthProvider>
  );
};

export default App;
