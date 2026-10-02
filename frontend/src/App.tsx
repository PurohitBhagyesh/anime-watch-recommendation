import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomTabBar } from './components/common/BottomTabBar';
import { Footer } from './components/common/Footer';

// Lazy loaded pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const AnimeDetailsPage = React.lazy(() => import('./pages/AnimeDetailsPage').then(m => ({ default: m.AnimeDetailsPage })));
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 rounded-full border-4 border-[#151f2e] border-t-[#3db4f2] animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-[#0b1622] text-[#bcbedc] selection:bg-[#3db4f2] selection:text-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <Navbar />
            <main className="flex-1 flex flex-col min-h-screen">
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <BottomTabBar />
          </div>
        </HashRouter>
      </WatchlistProvider>
    </AuthProvider>
  );
};

export default App;
