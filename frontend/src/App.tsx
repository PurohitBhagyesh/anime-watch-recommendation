import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomTabBar } from './components/common/BottomTabBar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { AnimeDetailsPage } from './pages/AnimeDetailsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-[#0b1622] text-[#bcbedc] selection:bg-[#3db4f2] selection:text-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <Navbar />
            <main className="flex-1">
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
