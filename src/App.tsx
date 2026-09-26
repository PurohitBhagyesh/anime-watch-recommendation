import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar } from './components/common/Navbar';
import { BottomTabBar } from './components/common/BottomTabBar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { AnimeDetailsPage } from './pages/AnimeDetailsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export const App: React.FC = () => {
  return (
    <WatchlistProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#0b1622] text-[#bcbedc] selection:bg-[#3db4f2] selection:text-white pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/anime/:id" element={<AnimeDetailsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <BottomTabBar />
        </div>
      </BrowserRouter>
    </WatchlistProvider>
  );
};

export default App;
